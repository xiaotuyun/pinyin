export interface ModelInfo {
  id: string;
  rawName?: string;
  displayName: string;
  description?: string;
  supportedGenerationMethods?: string[];
}

export interface TestResult {
  loading: boolean;
  success?: boolean;
  responseText?: string;
  latencyMs?: number;
  error?: string;
}

/**
 * Helper to check if a response is JSON from server API
 */
async function parseJsonResponse(res: Response) {
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await res.json();
  }
  return null;
}

/**
 * Clean JSON string if model wraps response in ```json ... ``` codeblocks
 */
function cleanAndParseJson(text: string) {
  if (!text) return {};
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

/**
 * List available Gemini models using server API or direct browser REST API
 */
export async function listGeminiModels(apiKey: string): Promise<ModelInfo[]> {
  const key = apiKey.trim();
  if (!key) {
    throw new Error('请提供 Gemini API 密钥');
  }

  // 1. Try server backend API first if available
  try {
    const res = await fetch('/api/ai/list-models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: key })
    });

    const data = await parseJsonResponse(res);
    if (res.ok && data && !data.error && Array.isArray(data.models)) {
      return data.models;
    }
    if (data && data.error && res.status !== 404) {
      throw new Error(data.error);
    }
  } catch (err: any) {
    // If it's a genuine API error from backend (not 404 HTML fallback), rethrow
    if (err.message && !err.message.includes('Unexpected token') && !err.message.includes('Failed to fetch')) {
      throw err;
    }
  }

  // 2. Direct browser REST API fallback for static deployments (GitHub Pages)
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errMsg = data.error?.message || `HTTP ${res.status}: 鉴权失败`;
    throw new Error(`API 密钥校验失败 (${errMsg})，请检查密钥正确性及网络与权限。`);
  }

  const rawList = data.models || [];
  if (!Array.isArray(rawList) || rawList.length === 0) {
    throw new Error('未能通过当前 API 密钥查找到任何 Gemini 可用模型，请核对密钥。');
  }

  return rawList.map((m: any) => {
    const id = m.name ? m.name.replace(/^models\//, '') : m.id || 'gemini-2.5-flash';
    return {
      id,
      rawName: m.name || id,
      displayName: m.displayName || id,
      description: m.description || '',
      supportedGenerationMethods: m.supportedGenerationMethods || []
    };
  });
}

/**
 * Test a specific model using server API or direct browser REST API
 */
export async function testGeminiModel(apiKey: string, model: string, testPrompt?: string) {
  const key = apiKey.trim();
  const prompt = testPrompt || '你好！请回复一句话确认当前模型正常运行。';

  // 1. Try server backend API first if available
  try {
    const res = await fetch('/api/ai/test-model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: key, model, testPrompt: prompt })
    });

    const data = await parseJsonResponse(res);
    if (res.ok && data) {
      return data;
    }
  } catch (err) {
    // fallback
  }

  // 2. Direct browser REST API fallback
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const startTime = Date.now();

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const latencyMs = Date.now() - startTime;
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        model,
        error: data.error?.message || `HTTP ${res.status}: 测试失败`
      };
    }

    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '（模型已响应，无文本返回）';
    return {
      success: true,
      model,
      prompt,
      responseText,
      latencyMs
    };
  } catch (err: any) {
    return {
      success: false,
      model,
      error: err?.message || '网络通讯异常或接口超时'
    };
  }
}

/**
 * Analyze Pinyin text using server API or direct browser REST API
 */
export async function analyzePinyinText(apiKey: string, text: string, type: string = 'full', model: string = 'gemini-2.5-flash') {
  const key = apiKey.trim();
  if (!key) {
    throw new Error('请先在【模型与密钥设置】中填写您的 Gemini API 密钥');
  }

  // 1. Try server backend API first if available
  try {
    const res = await fetch('/api/ai/analyze-pinyin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, type, apiKey: key, model })
    });

    const data = await parseJsonResponse(res);
    if (res.ok && data && !data.error) {
      return data;
    }
    if (data && data.error && res.status !== 404) {
      throw new Error(data.error);
    }
  } catch (err: any) {
    if (err.message && !err.message.includes('Unexpected token') && !err.message.includes('Failed to fetch')) {
      throw err;
    }
  }

  // 2. Direct browser REST API fallback
  let prompt = '';
  if (type === 'polyphonic') {
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
  } else if (type === 'tongue-twister-analysis') {
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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error?.message || `HTTP ${res.status}: 分析失败，请检查 API Key`);
  }

  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return cleanAndParseJson(responseText);
}

/**
 * Generate Pinyin practice story/text using server API or direct browser REST API
 */
export async function generatePracticeStory(
  apiKey: string,
  topic: string,
  difficulty: string,
  targetSounds: string,
  model: string = 'gemini-2.5-flash'
) {
  const key = apiKey.trim();
  if (!key) {
    throw new Error('请先在【模型与密钥设置】中填写您的 Gemini API 密钥');
  }

  // 1. Try server backend API first if available
  try {
    const res = await fetch('/api/ai/generate-practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, difficulty, targetSounds, apiKey: key, model })
    });

    const data = await parseJsonResponse(res);
    if (res.ok && data && !data.error) {
      return data;
    }
    if (data && data.error && res.status !== 404) {
      throw new Error(data.error);
    }
  } catch (err: any) {
    if (err.message && !err.message.includes('Unexpected token') && !err.message.includes('Failed to fetch')) {
      throw err;
    }
  }

  // 2. Direct browser REST API fallback
  const prompt = `生成适合汉语拼音练习的短文或例句。
主题: ${topic || '日常生活'}
难度: ${difficulty || '初级'}
重点发音/声韵母: ${targetSounds || '无'}

请返回 JSON 格式 (raw JSON without markdown codeblock):
{
  "title": "短文标题",
  "content": "中文汉字正文",
  "focusSounds": ["重点声母或韵母"],
  "translation": "英文或通俗含义翻译",
  "readingTips": "朗读提示与发音注意事项"
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error?.message || `HTTP ${res.status}: 生成失败，请检查 API Key`);
  }

  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return cleanAndParseJson(responseText);
}

/**
 * Advanced AI consultation for classical poetry, specific lines, and custom reading materials
 */
export async function consultPoetryOrTextAI(
  apiKey: string,
  question: string,
  model: string = 'gemini-2.5-flash'
) {
  const key = apiKey.trim();
  if (!key) {
    throw new Error('请先在【模型与密钥设置】中填写您的 Gemini API 密钥');
  }

  const prompt = `你是一个精通汉语拼音、古诗词鉴赏和语文教学的AI专家。
用户提问或请求：
"${question}"

请仔细分析用户的需求（如咨询某首古诗、请求某某句、要求生成朗读素材或诗词解析）。
请以结构化的 JSON 格式返回结果（raw JSON without markdown codeblock）：
{
  "title": "诗词标题或主题名称",
  "author": "作者与朝代（如果是古诗词）",
  "category": "poem",
  "content": "正文内容（如果是古诗词或文章，每句换行）",
  "translation": "白话文解释或诗意翻译",
  "readingTips": "朗读要领、发音难点及背诵建议",
  "aiExplanation": "针对用户提问的详细解答与诗词鉴赏"
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  const resData = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(resData.error?.message || `HTTP ${res.status}: AI 咨询失败，请检查 API Key`);
  }

  const respText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return cleanAndParseJson(respText);
}

/**
 * Advanced AI consultation for Polyphonic characters & generation
 */
export async function consultPolyphonicAI(
  apiKey: string,
  query: string,
  model: string = 'gemini-2.5-flash'
) {
  const key = apiKey.trim();
  if (!key) {
    throw new Error('请先在【模型与密钥设置】中填写您的 Gemini API 密钥');
  }

  // 1. Try server backend API first if available
  try {
    const res = await fetch('/api/ai/consult-polyphonic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, apiKey: key, model })
    });

    const data = await parseJsonResponse(res);
    if (res.ok && data && !data.error) {
      return data;
    }
    if (data && data.error && res.status !== 404) {
      throw new Error(data.error);
    }
  } catch (err: any) {
    if (err.message && !err.message.includes('Unexpected token') && !err.message.includes('Failed to fetch')) {
      throw err;
    }
  }

  // 2. Direct browser REST API fallback
  const prompt = `你是一个精通汉语拼音与多音字辨析的语文教学 AI 专家。
用户提问或查询：
"${query}"

请分析用户要求的汉字或多音字问题，并按标准多音字字典格式返回 JSON (raw JSON without markdown codeblock)：
{
  "char": "汉字",
  "aiExplanation": "对该汉字多音字语境辨析的详细解答与老师建议",
  "pronunciations": [
    {
      "pinyin": "拼音(带声调)",
      "meaning": "此读音的词义解释",
      "examples": ["组词1", "组词2"],
      "sampleSentence": "包含该读音的完整标准例句"
    }
  ]
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  const resData = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(resData.error?.message || `HTTP ${res.status}: AI 多音字咨询失败，请检查 API Key`);
  }

  const respText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return cleanAndParseJson(respText);
}

