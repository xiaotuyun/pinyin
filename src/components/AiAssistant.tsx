import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Volume2, BookOpen, CheckCircle2, Key, Cpu, AlertCircle, Settings } from 'lucide-react';
import { parsePinyinText, speakText } from '../utils/pinyinUtils';
import { getCustomApiKey, getSelectedModel } from '../utils/aiConfig';
import { generatePracticeStory } from '../utils/geminiClient';

interface AiAssistantProps {
  speechRate: number;
  onOpenModelConfig?: () => void;
  configVersion?: number;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  speechRate,
  onOpenModelConfig,
  configVersion
}) => {
  const [topic, setTopic] = useState<string>('动物森林里的好朋友');
  const [difficulty, setDifficulty] = useState<string>('初级');
  const [targetSounds, setTargetSounds] = useState<string>('平翘舌音 z/c/s 与 zh/ch/sh');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentKey, setCurrentKey] = useState<string>('');
  const [currentModel, setCurrentModel] = useState<string>('gemini-3.6-flash');

  useEffect(() => {
    setCurrentKey(getCustomApiKey());
    setCurrentModel(getSelectedModel());
  }, [configVersion]);

  const [result, setResult] = useState<{
    title: string;
    content: string;
    focusSounds: string[];
    translation: string;
    readingTips: string;
  } | null>(null);

  const handleGenerate = async () => {
    const apiKey = getCustomApiKey();
    const model = getSelectedModel();

    if (!apiKey) {
      setErrorMessage('请先点击右上角【密钥/模型配置】手动填写并保存 Gemini API 密钥');
      return;
    }

    if (!model || model === '未设定模型') {
      setErrorMessage('所选模型已失效或未配置，请在【密钥/模型配置】中保存有效密钥并选择模型');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await generatePracticeStory(apiKey, topic, difficulty, targetSounds, model);
      if (data.error) {
        setErrorMessage(data.error);
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      console.error('Failed to generate practice:', err);
      setErrorMessage(err?.message || '与 AI 服务通讯失败，请检查密钥与网络状态');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
              <h1 className="text-2xl font-bold">AI 智能拼音故事与短文生成</h1>
            </div>
            <p className="text-xs text-purple-100 max-w-2xl leading-relaxed">
              输入你感兴趣的主题或指定发音（如平翘舌、前后鼻音），AI 为你定制附带拼音标注与发音要领的专属短文！
            </p>
          </div>

          <button
            onClick={onOpenModelConfig}
            className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 backdrop-blur-xs shrink-0"
          >
            <Settings className="w-4 h-4" />
            <span>配置密钥与选择模型</span>
          </button>
        </div>
      </div>

      {/* Current Active Model Status Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-purple-100 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="font-bold text-slate-700 dark:text-slate-300">当前 AI 生成所用模型:</span>
          <span className="font-mono font-bold text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800">
            {currentKey && currentModel !== '未设定模型' ? currentModel : '无 (需要设置密钥并选择模型)'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {currentKey ? (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 已启用专属 API Key
            </span>
          ) : (
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> 尚未手动设置 API Key
            </span>
          )}

          <button
            onClick={onOpenModelConfig}
            className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
          >
            变更模型 / 重新测试 &rarr;
          </button>
        </div>
      </div>

      {/* Error Alert if any */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={onOpenModelConfig}
            className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 text-[11px] shrink-0"
          >
            去设置 API Key
          </button>
        </div>
      )}

      {/* Generator Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">短文主题:</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="如：小猫钓鱼、太空探险..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">重点发音训练:</label>
            <input
              type="text"
              value={targetSounds}
              onChange={(e) => setTargetSounds(e.target.value)}
              placeholder="如：n/l对比、b/p发音..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">难度等级:</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="初级">初级 (短小简明)</option>
              <option value="中级">中级 (故事流畅)</option>
              <option value="高级">高级 (富含生词成语)</option>
            </select>
          </div>

        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{loading ? `AI 正在通过模型 (${currentModel}) 创作短文...` : '开始生成定制拼音短文'}</span>
        </button>
      </div>

      {/* Generated Result */}
      {result && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                {result.title}
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {result.focusSounds && result.focusSounds.map((sound, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 rounded-full font-semibold">
                    🎯 训练点: {sound}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => speakText(result.content, speechRate)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow-2xs hover:bg-purple-700 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>朗读全文</span>
            </button>
          </div>

          {/* Render Text with Pinyin */}
          <div className="flex flex-wrap gap-3 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            {parsePinyinText(result.content).map((item, idx) => (
              <div
                key={idx}
                onClick={() => speakText(item.char, speechRate)}
                className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform"
              >
                <span className="text-xs font-sans text-purple-600 dark:text-purple-400 font-semibold mb-0.5">
                  {item.pinyin}
                </span>
                <span className="text-2xl font-serif font-semibold text-slate-900 dark:text-white">
                  {item.char}
                </span>
              </div>
            ))}
          </div>

          {/* Reading Tips */}
          {result.readingTips && (
            <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-300 font-sans space-y-1">
              <span className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-purple-500" /> 朗读注意事项与发音指南:
              </span>
              <p>{result.readingTips}</p>
            </div>
          )}

          {/* Translation */}
          {result.translation && (
            <div className="text-xs text-slate-500 font-serif">
              <span className="font-bold">参考翻译: </span>
              {result.translation}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
