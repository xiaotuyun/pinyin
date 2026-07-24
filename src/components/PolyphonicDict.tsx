import React, { useState } from 'react';
import { Search, Volume2, BookOpen, Sparkles, HelpCircle } from 'lucide-react';
import { POLYPHONIC_DATABASE } from '../data/pinyinVocabData';
import { speakText } from '../utils/pinyinUtils';

interface PolyphonicDictProps {
  speechRate: number;
}

export const PolyphonicDict: React.FC<PolyphonicDictProps> = ({ speechRate }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredEntries = POLYPHONIC_DATABASE.filter((entry) => {
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

  return (
    <div className="space-y-6">
      
      {/* Banner & Search */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>多音字大全与语境辨析</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                收录常用多音字
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              深入剖析汉语多音字在不同词义、词性及例句中的准确读音与发音要点。
            </p>
          </div>
        </div>

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
        {filteredEntries.map((entry) => (
          <div
            key={entry.char}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all space-y-4"
          >
            {/* Header Char */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <span className="text-4xl font-serif font-extrabold text-blue-600 dark:text-blue-400">
                  {entry.char}
                </span>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">
                    多音字读音数量: {entry.pronunciations.length}种
                  </span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {entry.pronunciations.map((p, idx) => (
                      <span key={idx} className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                        {p.pinyin}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => speakText(entry.char, speechRate)}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 hover:text-blue-600 transition-colors"
                title="朗读字音"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Pronunciation List */}
            <div className="space-y-3">
              {entry.pronunciations.map((p, idx) => (
                <div
                  key={idx}
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

                  {/* Sample Sentence */}
                  <div className="text-xs text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 p-2 rounded-lg font-serif">
                    <span className="font-bold text-blue-600 mr-1">例句:</span>
                    {p.sampleSentence}
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
