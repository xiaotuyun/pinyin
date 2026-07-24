import React, { useState, useEffect } from 'react';
import { Volume2, BookOpen, Grid, HelpCircle, Sparkles, Languages, Key, Cpu } from 'lucide-react';
import { getCustomApiKey, getSelectedModel } from '../utils/aiConfig';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  onOpenModelConfig?: () => void;
  configVersion?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  speechRate,
  setSpeechRate,
  onOpenModelConfig,
  configVersion
}) => {
  const [currentModel, setCurrentModel] = useState<string>('gemini-3.6-flash');
  const [hasKey, setHasKey] = useState<boolean>(false);

  useEffect(() => {
    setCurrentModel(getSelectedModel());
    setHasKey(!!getCustomApiKey());
  }, [configVersion]);

  const tabs = [
    { id: 'converter', label: '汉字转拼音', icon: Languages },
    { id: 'chart', label: '拼音字母表', icon: Grid },
    { id: 'polyphonic', label: '多音字大全', icon: BookOpen },
    { id: 'reader', label: '朗读素材库', icon: Volume2 },
    { id: 'quiz', label: '拼音测试关卡', icon: HelpCircle },
    { id: 'ai-helper', label: 'AI 智能生成', icon: Sparkles }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo & Brand Name */}
          <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => setActiveTab('converter')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center text-white shadow-md font-bold text-xl tracking-wider">
              拼
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  拼音大师
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 rounded-full">
                  Pinyin Pro
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden xl:block">
                汉字转换 · 声调标注 · 拼音字母表 · 多音字解析
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden lg:flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600 dark:text-amber-400' : ''}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Controls: Model Settings & Audio Speed */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Model & Key Button */}
            <button
              onClick={onOpenModelConfig}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-semibold shadow-2xs transition-all"
              title="配置 Gemini API 密钥与测试模型"
            >
              <Key className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">密钥/模型配置</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-200 dark:bg-purple-900 font-mono font-bold">
                {currentModel.length > 14 ? currentModel.slice(0, 12) + '...' : currentModel}
              </span>
            </button>

            {/* Audio Speed Quick Control */}
            <div className="hidden sm:flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-300">
              <Volume2 className="w-3.5 h-3.5 text-slate-500" />
              <span>语速:</span>
              <button
                onClick={() => setSpeechRate(speechRate === 0.6 ? 0.9 : speechRate === 0.9 ? 1.2 : 0.6)}
                className="font-bold text-amber-600 dark:text-amber-400 hover:underline px-1"
                title="切换朗读语速"
              >
                {speechRate === 0.6 ? '0.6x' : speechRate === 0.9 ? '0.9x' : '1.2x'}
              </button>
            </div>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex overflow-x-auto py-2 space-x-2 border-t border-slate-100 dark:border-slate-800 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
