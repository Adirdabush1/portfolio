const axios = require("axios");

const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const callGroq = async ({ system, user, temperature = 0.3, max_tokens = 400, json = false }) => {
  const body = {
    model: MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature,
    max_tokens,
  };
  if (json) body.response_format = { type: "json_object" };

  let res;
  try {
    res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      body,
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );
  } catch (err) {
    const status = err.response?.status;
    const data = err.response?.data;
    const msg = data?.error?.message || data?.message || err.message;
    console.error(`Groq ${status || "?"}: ${msg}`);
    throw err;
  }
  const text = res.data.choices[0].message?.content || res.data.choices[0].text || "";
  return {
    text,
    usage: res.data.usage,
    model: res.data.model || MODEL,
  };
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = { callGroq, sleep, MODEL };
