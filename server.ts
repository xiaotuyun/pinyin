import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint to list all available models for an API key
  app.post("/api/ai/list-models", async (req, res) => {
    try {
      const apiKey = req.body.apiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "请手动填写并保存 Gemini API 密钥 (API Key)" });
      }

      const ai = new GoogleGenAI({ apiKey });
      const rawList: any[] = [];

      try {
        const response: any = await ai.models.list();
        if (Symbol.asyncIterator in Object(response)) {
          for await (const m of response) {
            rawList.push(m);
          }
        } else if (Array.isArray(response)) {
          rawList.push(...response);
        } else if (response && Array.isArray(response.models)) {
          rawList.push(...response.models);
        }
      } catch (listErr: any) {
        console.warn("ai.models.list() failed for provided key:", listErr?.message);
        return res.status(400).json({ error: "API 密钥输入错误或无效，无法获取模型列表：" + (listErr?.message || "鉴权失败") });
      }

      if (rawList.length === 0) {
        return res.status(400).json({ error: "未能通过当前 API 密钥获取到任何模型，请检查密钥是否正确或是否有访问权限" });
      }

      const models = rawList.map((m: any) => {
        const id = m.name ? m.name.replace(/^models\//, "") : m.id || "gemini-3.6-flash";
        return {
          id,
          rawName: m.name || id,
          displayName: m.displayName || id,
          description: m.description || "",
          supportedGenerationMethods: m.supportedGenerationMethods || []
        };
      });

      return res.json({ models });
    } catch (error: any) {
      console.error("List models error:", error);
      return res.status(500).json({ error: error?.message || "无法获取模型列表，请检查 API Key 是否正确" });
    }
  });

  // API endpoint to test a specific model
  app.post("/api/ai/test-model", async (req, res) => {
    try {
      const apiKey = req.body.apiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "未提供 API Key" });
      }

      const { model, testPrompt } = req.body;
      if (!model) {
        return res.status(400).json({ error: "必须指定测试模型" });
      }

      const prompt = testPrompt || "你好！请回复一句话确认当前模型正常运行。";
      const ai = new GoogleGenAI({ apiKey });
      const startTime = Date.now();

      const response = await ai.models.generateContent({
        model: model,
        contents: prompt
      });

      const latencyMs = Date.now() - startTime;
      const responseText = response.text || "（模型已响应，无文本返回）";

      return res.json({
        success: true,
        model,
        prompt,
        responseText,
        latencyMs
      });
    } catch (error: any) {
      console.error(`Test model ${req.body.model} error:`, error);
      return res.status(200).json({
        success: false,
        model: req.body.model,
        error: error?.message || "测试失败：无法与该模型正常交互"
      });
    }
  });

  // API endpoint for Gemini-powered Pinyin & Hanzi Analysis
  app.post("/api/ai/analyze-pinyin", async (req, res) => {
    try {
      const apiKey = req.body.apiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "请先在【模型与密钥设置】中填入您的 Gemini API 密钥" });
      }

      const { text, type, model } = req.body;
      const selectedModel = model || "gemini-3.6-flash";

      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const ai = new GoogleGenAI({ apiKey });

      let prompt = "";
      if (type === "polyphonic") {
        prompt = `Analyze the Chinese text "${text}" specifically for polyphonic characters (多音字). 
Provide a JSON response in the following format (no markdown fences, raw JSON only):
{
  "polyphonicChars": [
    {
      "char": "长",
      "pinyinInContext": "cháng",
      "meaningInContext": "指长度、长短",
      "otherPronunciations": [
        { "pinyin": "zhǎng", "meaning": "指生长、长辈" }
      ]
    }
  ],
  "explanation": "简要解析此句中多音字的使用"
}`;
      } else if (type === "tongue-twister-analysis") {
        prompt = `Analyze the Chinese tongue twister "${text}" for Pinyin practice.
Provide a JSON response (no markdown fences, raw JSON only):
{
  "keyPronunciations": [
    { "sounds": "b / p / m", "description": "双唇音对比练习" }
  ],
  "difficulty": "初级/中级/高级",
  "tips": ["读音技巧与发音要领1", "技巧2"]
}`;
      } else {
        prompt = `Provide a detailed Pinyin and vocabulary breakdown for the Chinese text "${text}".
Provide a JSON response (no markdown fences, raw JSON only):
{
  "segmentedWords": [
    {
      "word": "汉字",
      "pinyin": "hàn zì",
      "meaning": "Chinese character",
      "partOfSpeech": "名词"
    }
  ],
  "grammarNotes": "本句核心表达或语法要点说明",
  "recommendedLevel": "HSK 1-6级别评估"
}`;
      }

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "{}";
      const data = JSON.parse(responseText);
      return res.json(data);
    } catch (error: any) {
      console.error("Gemini API error:", error);
      return res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // API endpoint for AI generated reading/practice sentence or story
  app.post("/api/ai/generate-practice", async (req, res) => {
    try {
      const apiKey = req.body.apiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "请先在【模型与密钥设置】中填入您的 Gemini API 密钥" });
      }

      const { topic, difficulty, targetSounds, model } = req.body;
      const selectedModel = model || "gemini-3.6-flash";

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `生成适合汉语拼音练习的短文或例句。
主题: ${topic || "日常生活"}
难度: ${difficulty || "初级"}
重点发音/声韵母: ${targetSounds || "无"}

请返回 JSON 格式 (raw JSON without markdown codeblock):
{
  "title": "短文标题",
  "content": "中文汉字正文",
  "focusSounds": ["重点声母或韵母"],
  "translation": "英文或通俗含义翻译",
  "readingTips": "朗读提示与发音注意事项"
}`;

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const data = JSON.parse(response.text || "{}");
      return res.json(data);
    } catch (error: any) {
      console.error("Gemini API generate practice error:", error);
      return res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
