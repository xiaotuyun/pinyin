import React, { useState } from 'react';
import { Volume2, VolumeX, Eye, EyeOff, BookOpen, Sparkles, RefreshCw } from 'lucide-react';
import { READING_MATERIALS } from '../data/pinyinVocabData';
import { parsePinyinText, speakText } from '../utils/pinyinUtils';
import { ReadingMaterial } from '../types';

interface PinyinReaderProps {
  speechRate: number;
}

export const PinyinReader: React.FC<PinyinReaderProps> = ({ speechRate }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'poem' | 'twister' | 'idiom'>('all');
  const [activeMaterial, setActiveMaterial] = useState<ReadingMaterial>(READING_MATERIALS[0]);
  const [showPinyin, setShowPinyin] = useState<boolean>(true);
  const [showHanzi, setShowHanzi] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Filter materials
  const filteredMaterials = READING_MATERIALS.filter((m) =>
    selectedCategory === 'all' ? true : m.category === selectedCategory
  );

  // Parse current material into lines
  const lines = activeMaterial.content.split('\n');

  // Handle Play
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
                声情并茂朗读
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              经典唐诗古风、趣味绕口令、经典成语故事。支持隐去拼音背诵或看拼音复述。
            </p>
          </div>
        </div>

        {/* Category Selector */}
        <div className="flex gap-2 pb-1 border-b border-slate-100 dark:border-slate-700">
          {[
            { id: 'all', label: '全部素材' },
            { id: 'poem', label: '唐诗古风' },
            { id: 'twister', label: '趣味绕口令' },
            { id: 'idiom', label: '实用成语' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-rose-500 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Material List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs max-h-[500px] overflow-y-auto space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
              选读列表 ({filteredMaterials.length})
            </h3>
            {filteredMaterials.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setActiveMaterial(item);
                  setIsPlaying(false);
                  window.speechSynthesis.cancel();
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  activeMaterial.id === item.id
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm font-serif">{item.title}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {item.category === 'poem' ? '古诗' : item.category === 'twister' ? '绕口令' : '成语'}
                  </span>
                </div>
                {item.author && (
                  <p className="text-xs text-slate-500 mt-0.5">{item.author}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Material Reader Workspace */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
          
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h2 className="text-2xl font-serif font-extrabold text-slate-900 dark:text-white">
                {activeMaterial.title}
              </h2>
              {activeMaterial.author && (
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
          <div className="space-y-6 py-4 flex flex-col items-center justify-center min-h-[220px] bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
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
          {activeMaterial.translation && (
            <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 font-serif leading-relaxed">
              <span className="font-bold block mb-1">大意翻译与解析:</span>
              {activeMaterial.translation}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
