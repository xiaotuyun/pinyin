import React, { useState, useEffect } from 'react';
import { Search, Volume2, BookOpen, Sparkles, HelpCircle, Plus, X, Trash2, CheckCircle2, Loader2, Bot, User, Cpu, AlertCircle } from 'lucide-react';
import { POLYPHONIC_DATABASE } from '../data/pinyinVocabData';
import { speakText } from '../utils/pinyinUtils';
import { consultPolyphonicAI } from '../utils/geminiClient';
import { getCustomApiKey, getSelectedModel } from '../utils/aiConfig';
import { PolyphonicEntry } from '../types';

interface PolyphonicDictProps {
  speechRate: number;
  onOpenModelConfig?: () => void;
  configVersion?: number;
}

interface PronunciationForm {
  pinyin: string;
  meaning: string;
  examples: string; // comma separated
  sampleSentence: string;
}

export const PolyphonicDict: React.FC<PolyphonicDictProps> = ({
  speechRate,
  onOpenModelConfig,
  configVersion
}) => {
  const [customEntries, setCustomEntries] = useState<PolyphonicEntry[]>(() => {
    try {
      const saved = localStorage.getItem('pinyin_custom_polyphonic');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allEntries = [...customEntries, ...POLYPHONIC_DATABASE];

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Manual Add Modal State
  const [isManualOpen, setIsManualOpen] = useState<boolean>(false);
  const [manualChar, setManualChar] = useState<string>('');
  const [pronunciations, setPronunciations] = useState<PronunciationForm[]>([
    { pinyin: '', meaning: '', examples: '', sampleSentence: '' }
  ]);

  // AI Assistant Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiQuery, setAiQuery] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<(PolyphonicEntry & { aiExplanation?: string }) | null>(null);

  const [currentKey, setCurrentKey] = useState<string>('');
  const [currentModel, setCurrentModel] = useState<string>('gemini-2.5-flash');

  useEffect(() => {
    setCurrentKey(getCustomApiKey());
    setCurrentModel(getSelectedModel());
  }, [configVersion]);

  useEffect(() => {
    try {
      localStorage.setItem('pinyin_custom_polyphonic', JSON.stringify(customEntries));
    } catch (e) {
      console.error(e);
    }
  }, [customEntries]);

  const filteredEntries = allEntries.filter((entry) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.trim().toLowerCase();
    return (
      entry.char.includes(query) ||
      entry.pronunciations.some((p) =>
        p.pinyin.toLowerCase().includes(query) ||
        p.meaning.includes(query) ||
        p.examples.some((ex) => ex.includes(query))
      )
    );
  });

  const handleAddPronunciationRow = () => {
    setPronunciations((prev) => [
      ...prev,
      { pinyin: '', meaning: '', examples: '', sampleSentence: '' }
    ]);
  };

  const handleRemovePronunciationRow = (index: number) => {
    if (pronunciations.length === 1) return;
    setPronunciations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualChar.trim()) return;

    const formattedPronunciations = pronunciations.map((p) => ({
      pinyin: p.pinyin.trim(),
      meaning: p.meaning.trim(),
      examples: p.examples.split(/[,，\s]+/).filter(Boolean),
      sampleSentence: p.sampleSentence.trim()
    }));

    const newEntry: PolyphonicEntry = {
      id: `poly-custom-${Date.now()}`,
      char: manualChar.trim().charAt(0),
      pronunciations: formattedPronunciations,
      isCustom: true
    };

    setCustomEntries((prev) => [newEntry, ...prev]);
    setIsManualOpen(false);
    setManualChar('');
    setPronunciations([{ pinyin: '', meaning: '', examples: '', sampleSentence: '' }]);
    setSuccessMessage(`成功添加多音字《${newEntry.char}》！`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDeleteCustom = (id?: string) => {
    if (!id) return;
    if (window.confirm('确定要删除这个自定义多音字吗？')) {
      setCustomEntries((prev) => prev.filter((item) => item.id !== id));
      setSuccessMessage('已成功删除该自定义多音字');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleRunAiConsult = async () => {
    const apiKey = getCustomApiKey();
    const model = getSelectedModel();

    if (!apiKey) {
      setAiError('请先点击右上角【密钥/模型配置】手动填写并保存 Gemini API 密钥');
      return;
    }

    if (!aiQuery.trim()) return;

    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const data = await consultPolyphonicAI(apiKey, aiQuery, model);
      if (!data.char || !data.pronunciations) {
        throw new Error('AI 返回的数据格式不正确，请换个问题重试');
      }
      setAiResult(data);
    } catch (err: any) {
      console.error(err);
      setAiError(err?.message || 'AI 咨询失败，请检查网络或 API Key');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddAiResultToDict = () => {
    if (!aiResult) return;
    const newEntry: PolyphonicEntry = {
      id: `poly-ai-${Date.now()}`,
      char: aiResult.char,
      pronunciations: aiResult.pronunciations,
      isCustom: true
    };
    setCustomEntries((prev) => [newEntry, ...prev]);
    setIsAiModalOpen(false);
    setAiResult(null);
    setAiQuery('');
    setSuccessMessage(`成功将 AI 生成的多音字《${newEntry.char}》加入多音字大全！`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner & Search & Action Buttons */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>多音字大全与语境辨析</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                收录常用多音字 ({allEntries.length})
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              深入剖析汉语多音字在不同词义、词性及例句中的准确读音与发音要点。支持手动添加与 AI 智能助手辅助咨询！
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsManualOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>手动添加多音字</span>
            </button>

            <button
              onClick={() => setIsAiModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI 智能助手辅助咨询</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索多音字（如：行、重、长、好、乐、háng、xíng）..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Dictionary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEntries.map((entry, idx) => (
          <div
            key={entry.id || `${entry.char}-${idx}`}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all space-y-4 relative group"
          >
            {/* Header Char */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <span className="text-4xl font-serif font-extrabold text-blue-600 dark:text-blue-400">
                  {entry.char}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">
                      读音数量: {entry.pronunciations.length}种
                    </span>
                    {entry.isCustom && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                        自定义
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.pronunciations.map((p, pIdx) => (
                      <span key={pIdx} className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                        {p.pinyin}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {entry.isCustom && entry.id && (
                  <button
                    onClick={() => handleDeleteCustom(entry.id)}
                    className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                    title="删除自定义字词"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => speakText(entry.char, speechRate)}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 hover:text-blue-600 transition-colors"
                  title="朗读字音"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Pronunciation List */}
            <div className="space-y-3">
              {entry.pronunciations.map((p, pIdx) => (
                <div
                  key={pIdx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        [{p.pinyin}]
                      </span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {p.meaning}
                      </span>
                    </div>
                    <button
                      onClick={() => speakText(`${p.pinyin}，${p.sampleSentence}`, speechRate)}
                      className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
                      title="朗读例句"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Examples */}
                  {p.examples && p.examples.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <span className="text-slate-400">组词:</span>
                      {p.examples.map((ex, i) => (
                        <span
                          key={i}
                          onClick={() => speakText(ex, speechRate)}
                          className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium cursor-pointer hover:border-blue-400"
                        >
                          {ex}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Sample Sentence */}
                  {p.sampleSentence && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 p-2 rounded-lg font-serif">
                      <span className="font-bold text-blue-600 mr-1">例句:</span>
                      {p.sampleSentence}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

      {/* MANUAL ADD MODAL */}
      {isManualOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>手动添加多音字条目</span>
              </h3>
              <button
                onClick={() => setIsManualOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">多音汉字 (单字)</label>
                <input
                  type="text"
                  maxLength={1}
                  required
                  value={manualChar}
                  onChange={(e) => setManualChar(e.target.value)}
                  placeholder="如：长、重、行"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm outline-none font-serif font-bold text-lg"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">读音与释义明细</label>
                  <button
                    type="button"
                    onClick={handleAddPronunciationRow}
                    className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
                  >
                    + 添加另一个读音
                  </button>
                </div>

                {pronunciations.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-600">读音 #{idx + 1}</span>
                      {pronunciations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePronunciationRow(idx)}
                          className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                        >
                          删除此读音
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        value={p.pinyin}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPronunciations((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, pinyin: val } : item))
                          );
                        }}
                        placeholder="拼音 (如: cháng 或 zhǎng)"
                        className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
                      />
                      <input
                        type="text"
                        required
                        value={p.meaning}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPronunciations((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, meaning: val } : item))
                          );
                        }}
                        placeholder="词义简述 (如: 长度、长短)"
                        className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
                      />
                    </div>

                    <input
                      type="text"
                      value={p.examples}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPronunciations((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, examples: val } : item))
                        );
                      }}
                      placeholder="组词 (用逗号分隔，如: 长短, 长度, 长期)"
                      className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
                    />

                    <input
                      type="text"
                      value={p.sampleSentence}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPronunciations((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, sampleSentence: val } : item))
                        );
                      }}
                      placeholder="标准例句 (如: 这条河流的长度超过三千公里。)"
                      className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsManualOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
                >
                  保存并加入多音字大全
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI ASSISTANT / CONSULTANT MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  AI 智能多音字助手与咨询顾问
                </h3>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Config & Status */}
            <div className="bg-purple-50/80 dark:bg-purple-950/30 p-3.5 rounded-xl border border-purple-200 dark:border-purple-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  当前 AI 模型: <span className="text-purple-700 dark:text-purple-300 font-mono">{currentKey ? currentModel : '未配置 API Key'}</span>
                </span>
              </div>
              <button
                onClick={onOpenModelConfig}
                className="text-purple-600 font-bold hover:underline"
              >
                配置密钥 &rarr;
              </button>
            </div>

            {aiError && (
              <div className="p-3.5 rounded-xl bg-rose-50 text-rose-800 text-xs flex items-center gap-2 border border-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500">向 AI 咨询汉字、词组或要求添加指定多音字:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRunAiConsult();
                  }}
                  placeholder="如：朝、长、行，或要求解释‘重’字的所有读音"
                  className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleRunAiConsult}
                  disabled={aiLoading || !aiQuery.trim()}
                  className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>AI 检索与生成</span>
                </button>
              </div>

              {/* Quick Preset Prompts */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-400 self-center mr-1">快捷示例:</span>
                {['朝', '剥', '宿', '降', '数', '还'].map((charPreset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAiQuery(`请详细分析多音字“${charPreset}”的所有读音、词义和例句`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-[11px] font-medium border border-purple-200 dark:border-purple-800"
                  >
                    分析 “{charPreset}”
                  </button>
                ))}
              </div>
            </div>

            {/* AI Result Preview */}
            {aiResult && (
              <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-purple-200 dark:border-purple-900">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-serif font-extrabold text-purple-700 dark:text-purple-300">
                      {aiResult.char}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-bold">
                      AI 智能生成结果
                    </span>
                  </div>

                  <button
                    onClick={handleAddAiResultToDict}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>一键加入多音字大全</span>
                  </button>
                </div>

                {aiResult.aiExplanation && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900 p-3 rounded-xl border border-purple-100 dark:border-purple-900/50 leading-relaxed">
                    <strong className="text-purple-700 dark:text-purple-400">AI 专家解析: </strong>
                    {aiResult.aiExplanation}
                  </p>
                )}

                <div className="space-y-2.5">
                  {aiResult.pronunciations.map((p, pIdx) => (
                    <div key={pIdx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-purple-700 dark:text-purple-400 text-sm">[{p.pinyin}]</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{p.meaning}</span>
                      </div>
                      {p.examples && p.examples.length > 0 && (
                        <div className="flex flex-wrap gap-1 text-[11px]">
                          <span className="text-slate-400">组词:</span>
                          {p.examples.map((ex, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                              {ex}
                            </span>
                          ))}
                        </div>
                      )}
                      {p.sampleSentence && (
                        <div className="text-slate-600 dark:text-slate-400 font-serif text-[11px]">
                          <span className="font-bold text-purple-600">例句: </span>
                          {p.sampleSentence}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
