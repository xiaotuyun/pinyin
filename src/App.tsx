import React, { useState } from 'react';
import { Header } from './components/Header';
import { PinyinConverter } from './components/PinyinConverter';
import { PinyinChart } from './components/PinyinChart';
import { PolyphonicDict } from './components/PolyphonicDict';
import { PinyinReader } from './components/PinyinReader';
import { PinyinQuiz } from './components/PinyinQuiz';
import { AiAssistant } from './components/AiAssistant';
import { ModelConfigModal } from './components/ModelConfigModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('converter');
  const [speechRate, setSpeechRate] = useState<number>(0.9);
  const [isModelConfigOpen, setIsModelConfigOpen] = useState<boolean>(false);
  const [configVersion, setConfigVersion] = useState<number>(0);

  const handleConfigChange = () => {
    setConfigVersion((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-amber-100 selection:text-amber-900">
      
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        speechRate={speechRate}
        setSpeechRate={setSpeechRate}
        onOpenModelConfig={() => setIsModelConfigOpen(true)}
        configVersion={configVersion}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'converter' && <PinyinConverter speechRate={speechRate} />}
        {activeTab === 'chart' && <PinyinChart speechRate={speechRate} />}
        {activeTab === 'polyphonic' && <PolyphonicDict speechRate={speechRate} />}
        {activeTab === 'reader' && <PinyinReader speechRate={speechRate} />}
        {activeTab === 'quiz' && <PinyinQuiz speechRate={speechRate} />}
        {activeTab === 'ai-helper' && (
          <AiAssistant
            speechRate={speechRate}
            onOpenModelConfig={() => setIsModelConfigOpen(true)}
            configVersion={configVersion}
          />
        )}
      </main>

      {/* Global Model & Key Config Modal */}
      <ModelConfigModal
        isOpen={isModelConfigOpen}
        onClose={() => setIsModelConfigOpen(false)}
        onConfigChange={handleConfigChange}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>拼音大师 Pinyin Master — 汉语拼音学习与汉字转换利器</span>
          <div className="flex items-center space-x-4">
            <button onClick={() => setActiveTab('chart')} className="hover:underline">拼音表</button>
            <button onClick={() => setActiveTab('polyphonic')} className="hover:underline">多音字</button>
            <button onClick={() => setActiveTab('quiz')} className="hover:underline">测验关卡</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
