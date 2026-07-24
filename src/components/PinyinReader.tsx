import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Eye, EyeOff, BookOpen, Sparkles, RefreshCw, Plus, Trash2, X, Loader2 } from 'lucide-react';
import { READING_MATERIALS } from '../data/pinyinVocabData';
import { parsePinyinText, speakText } from '../utils/pinyinUtils';
import { ReadingMaterial } from '../types';
import { consultPoetryOrTextAI } from '../utils/geminiClient';
import { getCustomApiKey, getSelectedModel } from '../utils/aiConfig';

interface PinyinReaderProps {
  speechRate: number;
  onSwitchToAiHelper?: () => void;
}

export const PinyinReader: React.FC<PinyinReaderProps> = ({ speechRate, onSwitchToAiHelper }) => {
  const [customMaterials, setCustomMaterials] = useState<ReadingMaterial[]>(() => {
    try {
      const saved = localStorage.getItem('pinyin_custom_materials');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allMaterials = [...customMaterials, ...READING_MATERIALS];

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeMaterial, setActiveMaterial] = useState<ReadingMaterial>(allMaterials[0] || READING_MATERIALS[0]);
  const [showPinyin, setShowPinyin] = useState<boolean>(true);
  const [showHanzi, setShowHanzi] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  // Manual Form
  const [manualTitle, setManualTitle] = useState('');
  const [manualAuthor, setManualAuthor] = useState('');
  const [manualCategory, setManualCategory] = useState('唐诗古风');
  const [manualContent, setManualContent] = useState('');
  const [manualTranslation, setManualTranslation] = useState('');

  // AI Gen Prompt
  const [aiPrompt, setAiPrompt] = useState('请写一首描写江南春景的五言绝句，要求音韵优美并附带解析');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('pinyin_custom_materials', JSON.stringify(customMaterials));
    } catch (err) {
      console.error(err);
    }
  }, [customMaterials]);

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim() || !manualContent.trim()) return;

    const newItem: ReadingMaterial = {
      id: `custom-${Date.now()}`,
      title: manualTitle.trim(),
      author: manualAuthor.trim() || '自创素材',
      category: manualCategory,
      content: manualContent.trim(),
      translation: manualTranslation.trim() || '自主添加朗读练习素材'
    };

    const updated = [newItem, ...customMaterials];
    setCustomMaterials(updated);
    setActiveMaterial(newItem);
    setIsAddModalOpen(false);

    // Reset form
    setManualTitle('');
    setManualAuthor('');
    setManualContent('');
    setManualTranslation('');
  };

  const handleAiGenerateMaterial = async () => {
    const apiKey = getCustomApiKey();
    const model = getSelectedModel();
    if (!apiKey) {
      setAiError('请先在顶部或【模型与密钥设置】中配置有效的 Gemini API 密钥');
      return;
    }

    setAiLoading(true);
    setAiError(null);
    try {
      const data = await consultPoetryOrTextAI(apiKey, aiPrompt, model);
      if (!data.content || !data.title) {
        throw new Error('AI 返回的数据格式不完整，请重试');
      }

      const newItem: ReadingMaterial = {
        id: `ai-gen-${Date.now()}`,
        title: data.title || 'AI 生成素材',
        author: data.author || 'AI 智能创作',
        category: (data.category as any) || 'poem',
        content: data.content,
        translation: data.translation || data.aiExplanation || 'AI 定制朗读练习'
      };

      const updated = [newItem, ...customMaterials];
      setCustomMaterials(updated);
      setActiveMaterial(newItem);
      setIsAiModalOpen(false);
      setAiPrompt('');
    } catch (err: any) {
      setAiError(err?.message || '生成失败，请检查网络或 API Key');
    } finally {
      setAiLoading(false);
    }
  };

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('确定要删除这个自定义素材吗？')) return;
    const updated = customMaterials.filter((m) => m.id !== id);
    setCustomMaterials(updated);
    if (activeMaterial.id === id) {
      setActiveMaterial(allMaterials[0] || READING_MATERIALS[0]);
    }
  };

  // Filter materials
  const filteredMaterials = allMaterials.filter((m) =>
    selectedCategory === 'all' ? true : m.category === selectedCategory
  );

  // Parse current material into lines
  const lines = (activeMaterial?.content || '').split('\n');

  const handlePlayMaterial = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    speakText(
      activeMaterial.content,
      speechRate,
      () => setIsPlaying(true),
      () => setIsPlaying(false)
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>朗读与背诵素材库</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                声情并茂朗读与自建库
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              经典唐诗古风、趣味绕口令、经典成语。支持手动添加、AI 智能生成全套素材或一键朗读！
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-rose-500" />
              <span>手动添加素材</span>
            </button>

            <button
              onClick={() => setIsAiModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI 智能生成新素材</span>
            </button>

            {onSwitchToAiHelper && (
              <button
                onClick={onSwitchToAiHelper}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>AI 自由对话与古诗词问答顾问</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Selector */}
        <div className="flex flex-wrap gap-2 pb-1 border-b border-slate-100 dark:border-slate-700">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-rose-500 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            全部素材 ({allMaterials.length})
          </button>
          {Array.from(new Set(allMaterials.map((m) => m.category || 'poem'))).map((catId) => {
            const labelMap: Record<string, string> = {
              poem: '唐诗古风',
              twister: '趣味绕口令',
              idiom: '实用成语',
              story: '故事短文'
            };
            const label = labelMap[catId] || catId;
            const count = allMaterials.filter((m) => (m.category || 'poem') === catId).length;
            return (
              <button
                key={catId}
                onClick={() => setSelectedCategory(catId)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === catId
                    ? 'bg-rose-500 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Material List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs max-h-[520px] overflow-y-auto space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center justify-between">
              <span>选读列表 ({filteredMaterials.length})</span>
              {customMaterials.length > 0 && (
                <span className="text-[10px] text-rose-500 font-semibold">包含自定义库</span>
              )}
            </h3>
            {filteredMaterials.map((item) => {
              const isCustom = item.id.startsWith('custom-') || item.id.startsWith('ai-gen-');
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveMaterial(item);
                    setIsPlaying(false);
                    window.speechSynthesis.cancel();
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all relative group ${
                    activeMaterial?.id === item.id
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm font-serif">{item.title}</h4>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {item.category === 'poem' ? '唐诗古风' : item.category === 'twister' ? '趣味绕口令' : item.category === 'idiom' ? '实用成语' : item.category === 'story' ? '故事短文' : item.category}
                      </span>
                      {isCustom && (
                        <button
                          onClick={(e) => handleDeleteCustom(item.id, e)}
                          title="删除此自定义素材"
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  {item.author && (
                    <p className="text-xs text-slate-500 mt-0.5">{item.author}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Material Reader Workspace */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
          
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-serif font-extrabold text-slate-900 dark:text-white">
                  {activeMaterial?.title}
                </h2>
                {activeMaterial?.id.startsWith('custom-') && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">自建</span>
                )}
                {activeMaterial?.id.startsWith('ai-gen-') && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">AI创作</span>
                )}
              </div>
              {activeMaterial?.author && (
                <span className="text-xs text-slate-500 font-medium">
                  {activeMaterial.author}
                </span>
              )}
            </div>

            {/* Display & Play Controls */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Show/Hide Pinyin */}
              <button
                onClick={() => setShowPinyin(!showPinyin)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  showPinyin
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500 line-through'
                }`}
              >
                {showPinyin ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showPinyin ? '拼音: 显示' : '拼音: 隐藏'}</span>
              </button>

              {/* Show/Hide Hanzi */}
              <button
                onClick={() => setShowHanzi(!showHanzi)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  showHanzi
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500 line-through'
                }`}
              >
                {showHanzi ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showHanzi ? '汉字: 显示' : '汉字: 隐藏'}</span>
              </button>

              {/* Speech Play Button */}
              <button
                onClick={handlePlayMaterial}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isPlaying
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-rose-500 hover:bg-rose-600 text-white shadow-2xs'
                }`}
              >
                {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isPlaying ? '停止朗读' : '全文朗读'}</span>
              </button>

            </div>
          </div>

          {/* Reader Content Display */}
          <div className="space-y-6 py-6 flex flex-col items-center justify-center min-h-[220px] bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
            {lines.map((line, lIdx) => {
              if (!line.trim()) return null;
              const charData = parsePinyinText(line);

              return (
                <div key={lIdx} className="flex flex-wrap justify-center gap-3 my-1">
                  {charData.map((item, cIdx) => (
                    <div
                      key={cIdx}
                      onClick={() => speakText(item.char, speechRate)}
                      className="flex flex-col items-center cursor-pointer group hover:scale-110 transition-transform"
                    >
                      {/* Pinyin */}
                      {showPinyin && (
                        <span className="text-sm font-sans text-rose-600 dark:text-rose-400 font-medium mb-0.5 min-h-[20px]">
                          {item.pinyin}
                        </span>
                      )}

                      {/* Hanzi */}
                      {showHanzi && (
                        <span className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
                          {item.char}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Translation */}
          {activeMaterial?.translation && (
            <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 font-serif leading-relaxed">
              <span className="font-bold block mb-1">大意翻译与解析:</span>
              {activeMaterial.translation}
            </div>
          )}

        </div>

      </div>

      {/* Manual Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-500" /> 手动添加朗读/古诗素材
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustom} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">素材标题 *</label>
                  <input
                    type="text"
                    required
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="如：春晓、四是四绕口令"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">作者 / 朝代</label>
                  <input
                    type="text"
                    value={manualAuthor}
                    onChange={(e) => setManualAuthor(e.target.value)}
                    placeholder="如：孟浩然 (唐代)"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">分类名称 (可直接输入任意自定义分类)</label>
                <input
                  type="text"
                  required
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  placeholder="如：唐诗古风、语文期末背诵、英语短文..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none text-xs"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['唐诗古风', '趣味绕口令', '实用成语', '语文背诵作业', '经典宋词', '英语美文'].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setManualCategory(preset)}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-medium"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500">正文内容 (每句换行) *</label>
                <textarea
                  required
                  rows={4}
                  value={manualContent}
                  onChange={(e) => setManualContent(e.target.value)}
                  placeholder="春眠不觉晓，&#10;处处闻啼鸟。&#10;夜来风雨声，&#10;花落知多少。"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none font-serif text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500">大意翻译与解析</label>
                <input
                  type="text"
                  value={manualTranslation}
                  onChange={(e) => setManualTranslation(e.target.value)}
                  placeholder="简要翻译或朗读要领说明..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  保存并加入素材库
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Generate Material Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-500 animate-pulse" /> AI 智能生成朗读与古诗素材
              </h3>
              <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {aiError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200">
                {aiError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">告诉 AI 你想生成什么古诗、儿歌或绕口令:</label>
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="如：请写一首关于秋天的七言绝句，或者写一段专门练习平翘舌音的趣味绕口令..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  '请写一首描写春天的五言绝句',
                  '经典绕口令：四是四十是十',
                  '描写月亮的唐诗古风',
                  '小学生日常励志诗词'
                ].map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAiPrompt(s)}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={handleAiGenerateMaterial}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{aiLoading ? 'AI 正在创作与排版...' : '一键生成并存入素材库'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
