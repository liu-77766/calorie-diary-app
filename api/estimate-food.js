function parseJsonText(text) {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return JSON.parse(fenced ? fenced[1] : trimmed);
}

function readOpenAIText(responseBody) {
  if (responseBody.output_text) return responseBody.output_text;

  const message = responseBody.output?.find((item) => item.type === "message");
  const text = message?.content?.find((item) => item.type === "output_text");
  return text?.text || "";
}

function readGeminiText(responseBody) {
  return responseBody.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
}

function providerName() {
  return (process.env.AI_PROVIDER || "openai").toLowerCase();
}

function foodEstimatePrompt(name) {
  return [
    `请估算食物“${name}”的常见热量记录方式。`,
    "如果通常按个吃，unit 用 piece，并给 kcalPerPiece 和 defaultAmount。",
    "否则 unit 用 g 或 ml，并给 kcalPer100。",
    "只给常见可食部分的大概值，不要夸大准确性。名称使用简体中文。",
    "只返回 JSON，不要返回 Markdown。",
    'JSON 字段必须是：{"name":"食物名","unit":"g|ml|piece","kcalPer100":0,"kcalPerPiece":0,"defaultAmount":1,"note":"简短说明"}',
  ].join("\n");
}

async function estimateWithGemini(name) {
  if (!process.env.GEMINI_API_KEY) {
    return { status: 503, body: { error: "热量查询还没有配置 GEMINI_API_KEY。可以先用内置食物或手动输入热量。" } };
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "x-goog-api-key": process.env.GEMINI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: foodEstimatePrompt(name) }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    return { status: response.status, body: { error: body.error?.message || "Gemini 热量查询暂时不可用" } };
  }

  return { status: 200, body: parseJsonText(readGeminiText(body)) };
}

async function estimateWithDeepSeek(name) {
  if (!process.env.DEEPSEEK_API_KEY) {
    return { status: 503, body: { error: "热量查询还没有配置 DEEPSEEK_API_KEY。可以先用内置食物或手动输入热量。" } };
  }

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
          content: foodEstimatePrompt(name),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    return { status: response.status, body: { error: body.error?.message || "DeepSeek 热量查询暂时不可用" } };
  }

  return { status: 200, body: parseJsonText(body.choices?.[0]?.message?.content) };
}

async function estimateWithOpenAI(name) {
  if (!process.env.OPENAI_API_KEY) {
    return { status: 503, body: { error: "热量查询还没有配置 OPENAI_API_KEY。可以先用内置食物或手动输入热量。" } };
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [{ type: "input_text", text: foodEstimatePrompt(name) }],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "food_calorie_estimate",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["name", "unit", "kcalPer100", "kcalPerPiece", "defaultAmount", "note"],
            properties: {
              name: { type: "string" },
              unit: { type: "string", enum: ["g", "ml", "piece"] },
              kcalPer100: { type: "number" },
              kcalPerPiece: { type: "number" },
              defaultAmount: { type: "number" },
              note: { type: "string" },
            },
          },
        },
      },
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    return { status: response.status, body: { error: body.error?.message || "AI 热量查询暂时不可用" } };
  }

  return { status: 200, body: parseJsonText(readOpenAIText(body)) };
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

  const name = String(requestBody?.name || "").trim();
  if (!name) {
    return res.status(400).json({ error: "请先输入食物名" });
  }

  try {
    const provider = providerName();
    if (process.env.DEEPSEEK_API_KEY) {
      const result = await estimateWithDeepSeek(name);
      return res.status(result.status).json(result.body);
    }
    if (provider === "baidu") {
      return res.status(501).json({
        error: "百度菜品识别只支持拍照识别，不能按食物名查询热量。请配置 DEEPSEEK_API_KEY 后再查询。",
      });
    }
    const result = provider === "gemini" ? await estimateWithGemini(name) : await estimateWithOpenAI(name);
    return res.status(result.status).json(result.body);
  } catch {
    return res.status(502).json({ error: "AI 返回格式无法解析，请手动输入" });
  }
};
