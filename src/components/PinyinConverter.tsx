import React, { useState, useMemo } from 'react';
import {
  Volume2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Palette,
  FileText,
  VolumeX,
  Info,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { parsePinyinText, getToneColorClass, speakText } from '../utils/pinyinUtils';
import { ToneType, DisplayMode, PinyinResultChar, AIAnalysisResult } from '../types';
import { getCustomApiKey, getSelectedModel } from '../utils/aiConfig';

interface PinyinConverterProps {
  speechRate: number;
}

const PRESET_SAMPLES = [
  { name: '经典古诗', text: '床前明月光，疑是地上霜。举头望明月，低头思故乡。' },
  { name: '多音字区分', text: '小明在路上行走，路过了中国银行，看到一位长辈长得很高大。' },
  { name: '绕口令', text: '四是四，十是十。十四是十四，四十是四十。' },
  { name: '成语推荐', text: '温故知新，自强不息，厚德载物，知行合一。' }
];

export const PinyinConverter: React.FC<PinyinConverterProps> = ({ speechRate }) => {
  const [inputText, setInputText] = useState<string>('床前明月光，疑是地上霜。举头望明月，低头思故乡。');
  const [toneType, setToneType] = useState<ToneType>('symbol');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('stacked');
  const [useToneColor, setUseToneColor] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeCharIndex, setActiveCharIndex] = useState<number | null>(null);

  // Selected polyphonic character modal
  const [selectedChar, setSelectedChar] = useState<PinyinResultChar | null>(null);

  // AI analysis state
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);

  // Parse text into Pinyin results
  const parsedData = useMemo(() => {
    return parsePinyinText(inputText, { toneType });
  }, [inputText, toneType]);

  // Handle TTS speech
  const handlePlaySpeech = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setActiveCharIndex(null);
      return;
    }

    if (!inputText.trim()) return;

    setIsPlaying(true);
    speakText(
      inputText,
      speechRate,
      () => setIsPlaying(true),
      () => {
        setIsPlaying(false);
        setActiveCharIndex(null);
      }
    );
  };

  // Copy result formatted
  const handleCopy = (format: 'plain' | 'inline' | 'ruby') => {
    let copyText = '';
    if (format === 'plain') {
      copyText = parsedData.map((d) => d.pinyin || d.char).join(' ');
    } else if (format === 'inline') {
      copyText = parsedData
        ? parsedData.map((d) => (d.pinyin ? `${d.char}(${d.pinyin})` : d.char)).join('')
        : inputText;
    } else if (format === 'ruby') {
      copyText = parsedData
        .map((d) => (d.pinyin ? `<ruby>${d.char}<rt>${d.pinyin}</rt></ruby>` : d.char))
        .join('');
    }

    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Trigger Gemini AI Analysis
  const handleAiAnalyze = async () => {
    if (!inputText.trim()) return;
    setAiLoading(true);
    try {
      const apiKey = getCustomApiKey();
      const model = getSelectedModel();

      const res = await fetch('/api/ai/analyze-pinyin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          type: 'full',
          apiKey,
          model
        })
      });
      const data = await res.json();
      setAiAnalysis(data);
    } catch (err) {
      console.error('AI analysis error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>汉字转拼音标注</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                实时精准转化
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              输入或粘贴中文汉字，自动生成标准拼音、四声着色、多音字智能识别。
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">快速范例:</span>
            {PRESET_SAMPLES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(sample.text);
                  setAiAnalysis(null);
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-amber-100 dark:bg-slate-700 dark:hover:bg-amber-950/50 text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setAiAnalysis(null);
            }}
            placeholder="请在此输入或粘贴需要转拼音的中文文本、文章、古诗、成语..."
            rows={4}
            className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-y text-base"
          />
          <div className="absolute bottom-3 right-3 flex items-center space-x-2">
            <span className="text-xs text-slate-400">
              {inputText.length} 字
            </span>
            {inputText && (
              <button
                onClick={() => {
                  setInputText('');
                  setAiAnalysis(null);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="清空文本"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Format Control Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
          
          {/* Left: Format Toggles */}
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Tone Type */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-500">声调格式:</span>
              <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-lg flex space-x-1">
                {[
                  { id: 'symbol', label: '带符号 (ā)' },
                  { id: 'num', label: '数字 (a1)' },
                  { id: 'none', label: '无声调 (a)' },
                  { id: 'first', label: '首字母' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setToneType(type.id as ToneType)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                      toneType === type.id
                        ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Mode */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-500">展示样式:</span>
              <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-lg flex space-x-1">
                {[
                  { id: 'stacked', label: '注音卡片' },
                  { id: 'ruby', label: 'Ruby上标' },
                  { id: 'inline', label: '行内括号' },
                  { id: 'plain', label: '纯拼音' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setDisplayMode(mode.id as DisplayMode)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                      displayMode === mode.id
                        ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Color Toggle */}
            <button
              onClick={() => setUseToneColor(!useToneColor)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                useToneColor
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>{useToneColor ? '声调着色: 开启' : '声调着色: 关闭'}</span>
            </button>

          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2">
            
            {/* Listen Button */}
            <button
              onClick={handlePlaySpeech}
              disabled={!inputText.trim()}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isPlaying
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-2xs'
              }`}
            >
              {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isPlaying ? '停止朗读' : '朗读全文'}</span>
            </button>

            {/* AI Analysis */}
            <button
              onClick={handleAiAnalyze}
              disabled={aiLoading || !inputText.trim()}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-2xs transition-all disabled:opacity-50"
            >
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>AI 多音字与词义解析</span>
            </button>

          </div>

        </div>

        {/* Tone Color Legend */}
        {useToneColor && (
          <div className="mt-3 pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="font-semibold">声调图例:</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> 一声 (阴平)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 二声 (阳平)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> 三声 (上声)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> 四声 (去声)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> 轻声
            </span>
          </div>
        )}

      </div>

      {/* Output Display Canvas */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs min-h-[220px]">
        
        {/* Output Header with Copy Options */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 mb-6">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              拼音标注结果
            </h2>
          </div>

          {/* Copy Toolbar */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleCopy('plain')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-colors"
              title="复制纯拼音文本"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>复制纯拼音</span>
            </button>
            <button
              onClick={() => handleCopy('inline')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-colors"
              title="复制汉字(拼音)格式"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>复制图文</span>
            </button>
            <button
              onClick={() => handleCopy('ruby')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-colors"
              title="复制HTML Ruby代码"
            >
              <span>HTML Ruby</span>
            </button>
          </div>
        </div>

        {/* Display Mode 1: Stacked Character Cards */}
        {displayMode === 'stacked' && (
          <div className="flex flex-wrap gap-2.5 leading-relaxed">
            {parsedData.map((item, idx) => {
              const toneColors = getToneColorClass(item.tone);
              const isPunctuation = !item.pinyin && !/[\u4e00-\u9fa5]/.test(item.char);

              if (isPunctuation) {
                return (
                  <div key={idx} className="flex items-end px-1 pb-2 text-2xl font-serif text-slate-500">
                    {item.char}
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  onClick={() => {
                    speakText(item.char, speechRate);
                    if (item.isPolyphonic) setSelectedChar(item);
                  }}
                  className={`group relative flex flex-col items-center justify-between p-2 rounded-xl border transition-all cursor-pointer select-none hover:shadow-md ${
                    useToneColor ? `${toneColors.bg} ${toneColors.border}` : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {/* Pinyin Text */}
                  <span
                    className={`text-sm font-sans tracking-wide ${
                      useToneColor ? toneColors.text : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {item.pinyin || ' '}
                  </span>

                  {/* Hanzi Character */}
                  <span className="text-2xl font-serif font-semibold text-slate-900 dark:text-white my-0.5">
                    {item.char}
                  </span>

                  {/* Polyphonic Indicator */}
                  {item.isPolyphonic && (
                    <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500 text-white font-sans mt-0.5" title="点击查看多音字读音">
                      多音字
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Display Mode 2: Ruby Annotation View */}
        {displayMode === 'ruby' && (
          <div className="text-2xl font-serif leading-loose tracking-widest text-slate-900 dark:text-white">
            {parsedData.map((item, idx) => {
              const toneColors = getToneColorClass(item.tone);
              if (!item.pinyin) {
                return <span key={idx} className="inline-block mx-0.5">{item.char}</span>;
              }
              return (
                <ruby key={idx} className="inline-flex flex-col items-center mx-1.5 my-2">
                  <rt
                    className={`text-xs font-sans font-normal mb-1 ${
                      useToneColor ? toneColors.text : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.pinyin}
                  </rt>
                  <span className="text-2xl">{item.char}</span>
                </ruby>
              );
            })}
          </div>
        )}

        {/* Display Mode 3: Inline Annotation View */}
        {displayMode === 'inline' && (
          <div className="text-lg leading-relaxed text-slate-900 dark:text-white font-serif tracking-wide">
            {parsedData.map((item, idx) => {
              const toneColors = getToneColorClass(item.tone);
              if (!item.pinyin) {
                return <span key={idx}>{item.char}</span>;
              }
              return (
                <span key={idx} className="inline-flex items-baseline mx-0.5">
                  <span className="font-semibold">{item.char}</span>
                  <span
                    className={`text-sm font-sans font-normal px-0.5 ${
                      useToneColor ? toneColors.text : 'text-slate-500'
                    }`}
                  >
                    ({item.pinyin})
                  </span>
                </span>
              );
            })}
          </div>
        )}

        {/* Display Mode 4: Plain Pinyin Text */}
        {displayMode === 'plain' && (
          <div className="text-lg font-sans leading-relaxed tracking-wider text-slate-800 dark:text-slate-200">
            {parsedData.map((item, idx) => {
              const toneColors = getToneColorClass(item.tone);
              return (
                <span
                  key={idx}
                  className={`inline-block mr-2 my-1 ${
                    useToneColor ? toneColors.text : ''
                  }`}
                >
                  {item.pinyin || item.char}
                </span>
              );
            })}
          </div>
        )}

      </div>

      {/* AI Analysis Drawer / Card */}
      {aiAnalysis && (
        <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-white dark:from-slate-900 dark:via-purple-950/20 dark:to-slate-800 rounded-2xl p-6 border border-purple-200 dark:border-purple-800/50 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-100 dark:border-purple-900/50">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                AI 智能多音字与成语分词解析
              </h3>
            </div>
            {aiAnalysis.recommendedLevel && (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
                难度: {aiAnalysis.recommendedLevel}
              </span>
            )}
          </div>

          {/* Polyphonic Breakdown */}
          {aiAnalysis.polyphonicChars && aiAnalysis.polyphonicChars.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                <Info className="w-4 h-4" /> 本句多音字准确消歧:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiAnalysis.polyphonicChars.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-purple-100 dark:border-purple-900/40 shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xl font-serif font-bold text-purple-700 dark:text-purple-300">
                        {item.char} ({item.pinyinInContext})
                      </span>
                      <span className="text-xs text-slate-500">上下文含义</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {item.meaningInContext}
                    </p>
                    {item.otherPronunciations && item.otherPronunciations.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-500">
                        <span>其他读音: </span>
                        {item.otherPronunciations.map((op, i) => (
                          <span key={i} className="mr-2 text-slate-600 dark:text-slate-400">
                            {op.pinyin} ({op.meaning})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Segmented Words */}
          {aiAnalysis.segmentedWords && aiAnalysis.segmentedWords.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-purple-900 dark:text-purple-300">
                词语拆解与拼音释义:
              </h4>
              <div className="flex flex-wrap gap-2">
                {aiAnalysis.segmentedWords.map((seg, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <span className="font-bold text-slate-900 dark:text-white mr-1.5">
                      {seg.word}
                    </span>
                    <span className="text-purple-600 dark:text-purple-400 mr-1.5 font-medium">
                      [{seg.pinyin}]
                    </span>
                    <span className="text-slate-500">{seg.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grammar Notes */}
          {aiAnalysis.grammarNotes && (
            <div className="text-xs text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 p-3 rounded-xl">
              <span className="font-bold text-slate-800 dark:text-slate-200">语法与发音提示: </span>
              {aiAnalysis.grammarNotes}
            </div>
          )}
        </div>
      )}

      {/* Polyphonic Inspection Modal */}
      {selectedChar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-serif font-bold text-amber-600 dark:text-amber-400">
                  {selectedChar.char}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                  多音字提示
                </span>
              </div>
              <button
                onClick={() => setSelectedChar(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                关闭 ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              汉字 “{selectedChar.char}” 在汉语中有多个常用读音：
            </p>

            <div className="space-y-2">
              {selectedChar.allPinyins && selectedChar.allPinyins.map((py, idx) => (
                <div
                  key={idx}
                  onClick={() => speakText(`${selectedChar.char} ${py}`, speechRate)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-amber-50 dark:bg-slate-900 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      {py}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-amber-600 dark:text-amber-400 font-medium">
                    <Volume2 className="w-4 h-4 mr-1" />
                    发音示范
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedChar(null)}
                className="px-4 py-2 text-xs font-semibold bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
