function parseJsonText(text) {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return JSON.parse(fenced ? fenced[1] : trimmed);
}

function providerName() {
  return (process.env.AI_PROVIDER || "baidu").toLowerCase();
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

function mimoConfig() {
  return {
    apiKey: process.env.MIMO_API_KEY,
    baseUrl: process.env.MIMO_BASE_URL || "https://api.xiaomimimo.com/v1",
    model: process.env.MIMO_MODEL || "mimo-v2.5",
  };
}

async function estimateWithMimo(name) {
  const { apiKey, baseUrl, model } = mimoConfig();
  if (!apiKey) {
    return { status: 503, body: { error: "热量查询还没有配置 MIMO_API_KEY。" } };
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: foodEstimatePrompt(name) }],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 512,
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    return { status: response.status, body: { error: body.error?.message || "小米 MiMo 热量查询暂时不可用" } };
  }

  return { status: 200, body: parseJsonText(body.choices?.[0]?.message?.content) };
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
      messages: [{ role: "user", content: foodEstimatePrompt(name) }],
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
    const result = providerName() === "mimo" ? await estimateWithMimo(name) : await estimateWithDeepSeek(name);
    return res.status(result.status).json(result.body);
  } catch {
    return res.status(502).json({ error: "AI 返回格式无法解析，请手动输入" });
  }
};
