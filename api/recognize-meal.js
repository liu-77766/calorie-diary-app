const MAX_IMAGE_LENGTH = 5_500_000;

function parseDataUrl(image) {
  const match = image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

function parseJsonText(text) {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return JSON.parse(fenced ? fenced[1] : trimmed);
}

async function estimateCaloriesWithDeepSeek(foodName) {
  if (!process.env.DEEPSEEK_API_KEY || !foodName || foodName === "图像主体") return null;

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      messages: [
        {
          role: "user",
          content: [
            `请估算食物“${foodName}”常见可食部分每100克热量。`,
            "只返回 JSON，不要返回 Markdown。",
            'JSON 字段必须是：{"kcalPer100":0,"note":"简短说明这是估算值，必要时提醒按包装或实际重量调整"}',
          ].join("\n"),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });

  const body = await response.json();
  if (!response.ok) return null;

  try {
    const parsed = parseJsonText(body.choices?.[0]?.message?.content);
    return {
      kcalPer100: Number(parsed.kcalPer100) || 0,
      note: parsed.note || "DeepSeek 估算热量，请按实际情况调整。",
    };
  } catch {
    return null;
  }
}

async function enrichCaloriesWithDeepSeek(result) {
  const estimate = await estimateCaloriesWithDeepSeek(result.foodName);
  if (!estimate?.kcalPer100) return result;

  return {
    ...result,
    kcalPer100: estimate.kcalPer100,
    note: `${estimate.note}（食物名称来自百度识别，热量由 DeepSeek 估算）`,
  };
}

async function getBaiduAccessToken() {
  const apiKey = process.env.BAIDU_API_KEY;
  const secretKey = process.env.BAIDU_SECRET_KEY;
  if (!apiKey || !secretKey) {
    throw new Error("拍照识别还没有配置 BAIDU_API_KEY 和 BAIDU_SECRET_KEY。");
  }

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: apiKey,
    client_secret: secretKey,
  });
  const response = await fetch(`https://aip.baidubce.com/oauth/2.0/token?${params.toString()}`, {
    method: "POST",
  });
  const body = await response.json();
  if (!response.ok || !body.access_token) {
    throw new Error(body.error_description || body.error || "百度 access_token 获取失败");
  }
  return body.access_token;
}

function normalizeBaiduDishResult(body) {
  if (body.error_code) {
    throw new Error(body.error_msg || "百度菜品识别失败");
  }

  const dish = body.result?.[0];
  if (!dish) {
    throw new Error("百度没有识别到明确菜品，请手动输入");
  }

  const calorie = Number(dish.calorie) || 0;
  const confidence = Number(dish.probability || dish.score || 0);
  return {
    foodName: dish.name || "未知菜品",
    estimatedGrams: 100,
    kcalPer100: calorie,
    confidence,
    note: "百度菜品识别返回的卡路里通常按每100克估算，请按实际重量调整。",
  };
}

function pickFirstResult(items = []) {
  return items.find((item) => item && (item.name || item.keyword || item.root));
}

function normalizeBaiduCombinationResult(body) {
  if (body.error_code) {
    throw new Error(body.error_msg || "百度图像组合识别失败");
  }

  const result = body.result || {};
  const dish = pickFirstResult(result.dishs?.result);
  if (dish) {
    return {
      foodName: dish.name || dish.keyword || "未知菜品",
      estimatedGrams: 100,
      kcalPer100: Number(dish.calorie) || 0,
      confidence: Number(dish.probability || dish.score || 0),
      note: "百度菜品识别返回的卡路里通常按每100克估算，请按实际重量调整。",
    };
  }

  const ingredient = pickFirstResult(result.ingredient?.result);
  if (ingredient) {
    return {
      foodName: ingredient.name || ingredient.keyword || "未知食材",
      estimatedGrams: 100,
      kcalPer100: Number(ingredient.calorie) || 0,
      confidence: Number(ingredient.score || ingredient.probability || 0),
      note: "百度果蔬/食材识别结果，热量可能为空，请按实际情况补充或调整。",
    };
  }

  const general = pickFirstResult(result.advanced_general?.result);
  if (general) {
    return {
      foodName: general.keyword || general.name || general.root || "未知食物",
      estimatedGrams: 100,
      kcalPer100: 0,
      confidence: Number(general.score || 0),
      note: "百度通用识别只返回名称，不返回热量；请手动填写每100克热量。",
    };
  }

  const objectDetect = result.object_detect?.result;
  if (objectDetect?.width && objectDetect?.height) {
    return {
      foodName: "图像主体",
      estimatedGrams: 100,
      kcalPer100: 0,
      confidence: 0,
      note: "百度图像主体检测只定位主体，不判断具体食物和热量；请手动填写名称和热量。",
    };
  }

  throw new Error("百度没有识别到明确食物，请手动输入");
}

async function recognizeWithBaidu(image) {
  const parsedImage = parseDataUrl(image);
  if (!parsedImage) {
    return { status: 400, body: { error: "请上传有效的餐食照片" } };
  }

  const accessToken = await getBaiduAccessToken();
  const params = new URLSearchParams({ access_token: accessToken });
  const response = await fetch(`https://aip.baidubce.com/api/v1/solution/direct/imagerecognition/combination?${params.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      image: parsedImage.data,
      scenes: ["dishs", "ingredient", "advanced_general", "object_detect"],
      sceneConf: {
        dishs: {
          top_num: "3",
          filter_threshold: "0.7",
        },
        ingredient: {
          top_num: "3",
        },
        advanced_general: {
          baike_num: "0",
        },
        object_detect: {},
      },
    }),
  });
  const body = await response.json();
  if (!response.ok) {
    return { status: response.status, body: { error: body.error_msg || "百度图像组合识别服务暂时不可用" } };
  }

  const result = normalizeBaiduCombinationResult(body);
  return { status: 200, body: await enrichCaloriesWithDeepSeek(result) };
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "只支持 POST 请求" });
  }

  let requestBody = req.body;
  if (typeof requestBody === "string") {
    try {
      requestBody = JSON.parse(requestBody);
    } catch {
      return res.status(400).json({ error: "请求格式不是有效 JSON" });
    }
  }

  const image = requestBody?.image;
  if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
    return res.status(400).json({ error: "请上传有效的餐食照片" });
  }

  if (image.length > MAX_IMAGE_LENGTH) {
    return res.status(413).json({ error: "照片太大，请重新拍一张或选择较小的图片" });
  }

  try {
    const result = await recognizeWithBaidu(image);
    return res.status(result.status).json(result.body);
  } catch (error) {
    return res.status(502).json({ error: error.message || "百度识别失败，请手动输入" });
  }
};
