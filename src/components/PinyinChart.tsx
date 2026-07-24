import React, { useState } from 'react';
import { Volume2, Info, Sparkles, Sliders, CheckCircle2 } from 'lucide-react';
import { SHENGMU_LIST, YUNMU_LIST, ZHENGTI_LIST, TONE_INFOS, PINYIN_RULES } from '../data/pinyinChartData';
import { speakText } from '../utils/pinyinUtils';

interface PinyinChartProps {
  speechRate: number;
}

export const PinyinChart: React.FC<PinyinChartProps> = ({ speechRate }) => {
  const [activeChartTab, setActiveChartTab] = useState<'shengmu' | 'yunmu' | 'zhengti' | 'tones' | 'matrix'>('shengmu');
  
  // Matrix state
  const [selectedInitial, setSelectedInitial] = useState<string>('b');
  const [selectedFinal, setSelectedFinal] = useState<string>('a');

  // Selected item detail modal
  const [selectedItemTip, setSelectedItemTip] = useState<{
    symbol: string;
    category: string;
    example: string;
    examplePinyin: string;
    tip: string;
  } | null>(null);

  return (
    <div className="space-y-6">
      
      {/* Chart Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>汉语拼音字母表与标准发音</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                声韵母点读
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              点击任意拼音字母可听到清晰的标准汉语发音、汉字例字及口型发音技巧。
            </p>
          </div>
        </div>

        {/* Subtabs */}
        <div className="flex overflow-x-auto gap-2 pb-1 border-b border-slate-100 dark:border-slate-700 no-scrollbar">
          {[
            { id: 'shengmu', label: '声母表 (23个)' },
            { id: 'yunmu', label: '韵母表 (24个)' },
            { id: 'zhengti', label: '整体认读音节 (16个)' },
            { id: 'tones', label: '四声声调与标调规则' },
            { id: 'matrix', label: '声韵母拼读训练矩阵' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveChartTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeChartTab === tab.id
                  ? 'bg-emerald-500 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Shengmu (声母表) */}
      {activeChartTab === 'shengmu' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {SHENGMU_LIST.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  speakText(`${item.symbol}，${item.example}`, speechRate);
                  setSelectedItemTip(item);
                }}
                className="group relative bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-md hover:border-emerald-400 cursor-pointer transition-all flex flex-col items-center justify-between"
              >
                <div className="flex items-center justify-between w-full text-[10px] text-slate-400">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{item.category}</span>
                  <Volume2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </div>
                
                <span className="text-3xl font-sans font-extrabold text-slate-900 dark:text-white my-2 group-hover:scale-110 transition-transform">
                  {item.symbol}
                </span>

                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                  <span>例字:</span>
                  <span className="font-serif font-bold text-slate-800 dark:text-slate-200">{item.example}</span>
                  <span className="text-emerald-600 font-sans">({item.examplePinyin})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Yunmu (韵母表) */}
      {activeChartTab === 'yunmu' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {YUNMU_LIST.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  speakText(`${item.symbol}，${item.example}`, speechRate);
                  setSelectedItemTip(item);
                }}
                className="group relative bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-md hover:border-blue-400 cursor-pointer transition-all flex flex-col items-center justify-between"
              >
                <div className="flex items-center justify-between w-full text-[10px] text-slate-400">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{item.category}</span>
                  <Volume2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
                
                <span className="text-3xl font-sans font-extrabold text-slate-900 dark:text-white my-2 group-hover:scale-110 transition-transform">
                  {item.symbol}
                </span>

                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                  <span>例字:</span>
                  <span className="font-serif font-bold text-slate-800 dark:text-slate-200">{item.example}</span>
                  <span className="text-blue-600 font-sans">({item.examplePinyin})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Zhengti Renduyinjie (整体认读音节) */}
      {activeChartTab === 'zhengti' && (
        <div className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
            💡 <strong>小贴士：</strong> 整体认读音节不需要进行声母和韵母的拼读，直接作为一个整体来读出和记忆。
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {ZHENGTI_LIST.map((item, idx) => (
              <div
                key={idx}
                onClick={() => speakText(`${item.symbol}，${item.example}`, speechRate)}
                className="group bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-md hover:border-amber-400 cursor-pointer transition-all flex flex-col items-center justify-between"
              >
                <div className="w-full text-right">
                  <Volume2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-500 transition-colors" />
                </div>
                
                <span className="text-3xl font-sans font-extrabold text-slate-900 dark:text-white my-2 group-hover:scale-110 transition-transform">
                  {item.symbol}
                </span>

                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                  <span>例字:</span>
                  <span className="font-serif font-bold text-slate-800 dark:text-slate-200">{item.example}</span>
                  <span className="text-amber-600 font-sans">({item.examplePinyin})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Tones & Rules (四声声调) */}
      {activeChartTab === 'tones' && (
        <div className="space-y-6">
          {/* Tone Contour Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TONE_INFOS.filter(t => t.toneNumber > 0).map((tone, idx) => (
              <div
                key={idx}
                onClick={() => speakText(tone.symbolExample, speechRate)}
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {tone.name}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      调值: {tone.contour}
                    </span>
                  </div>

                  <div className="my-4 text-center">
                    <span className="text-4xl font-serif font-extrabold text-amber-600 dark:text-amber-400">
                      {tone.symbolExample}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {tone.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                  <span>口诀: {tone.mnemonic}</span>
                  <Volume2 className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>

          {/* Pinyin Rules Grid */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              汉语拼音核心标调与变调法则
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PINYIN_RULES.map((rule, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {rule.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {rule.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Combination Matrix (拼读组合训练) */}
      {activeChartTab === 'matrix' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              声母 + 韵母 拼读组合练习
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              选择任意声母和韵母，自动生成四声拼读音节并支持音频朗读。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Shengmu Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">选择声母 (Shengmu):</label>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                {SHENGMU_LIST.map((s) => (
                  <button
                    key={s.symbol}
                    onClick={() => setSelectedInitial(s.symbol)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedInitial === s.symbol
                        ? 'bg-emerald-500 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {s.symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Yunmu Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">选择韵母 (Yunmu):</label>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                {YUNMU_LIST.map((y) => (
                  <button
                    key={y.symbol}
                    onClick={() => setSelectedFinal(y.symbol)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedFinal === y.symbol
                        ? 'bg-blue-500 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {y.symbol}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Combined Output Display */}
          <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                组合结果: <span className="text-emerald-600 font-extrabold text-lg">{selectedInitial}</span> + <span className="text-blue-600 font-extrabold text-lg">{selectedFinal}</span>
              </span>
              <button
                onClick={() => speakText(`${selectedInitial}，${selectedFinal}，拼读：${selectedInitial}${selectedFinal}`, speechRate)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                <span>连续朗读</span>
              </button>
            </div>

            {/* 4 Tones Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { tone: 1, label: '一声 (阴平)' },
                { tone: 2, label: '二声 (阳平)' },
                { tone: 3, label: '三声 (上声)' },
                { tone: 4, label: '四声 (去声)' }
              ].map((t) => {
                // Generate pinyin with tone mark
                const syllable = `${selectedInitial}${selectedFinal}`;
                return (
                  <div
                    key={t.tone}
                    onClick={() => speakText(syllable, speechRate)}
                    className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all"
                  >
                    <span className="text-xs text-slate-400 block mb-1">{t.label}</span>
                    <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {syllable}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tip Modal */}
      {selectedItemTip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {selectedItemTip.symbol}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                  {selectedItemTip.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedItemTip(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                关闭 ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-xs text-slate-400 block">发音例字:</span>
                  <span className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                    {selectedItemTip.example} ({selectedItemTip.examplePinyin})
                  </span>
                </div>
                <button
                  onClick={() => speakText(`${selectedItemTip.symbol}，例字：${selectedItemTip.example}`, speechRate)}
                  className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1">口型与发音要领:</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                  {selectedItemTip.tip}
                </p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedItemTip(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl hover:opacity-90 transition-opacity"
              >
                明白了
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
