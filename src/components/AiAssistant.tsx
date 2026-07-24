import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, Volume2, BookOpen, CheckCircle2, Key, Cpu, AlertCircle, Settings, Send, BookmarkPlus, MessageSquare, Bot, User } from 'lucide-react';
import { parsePinyinText, speakText } from '../utils/pinyinUtils';
import { getCustomApiKey, getSelectedModel } from '../utils/aiConfig';
import { generatePracticeStory, consultPoetryOrTextAI } from '../utils/geminiClient';
import { ReadingMaterial } from '../types';

interface AiAssistantProps {
  speechRate: number;
  onOpenModelConfig?: () => void;
  configVersion?: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  structuredData?: {
    title: string;
    author?: string;
    category?: string;
    content: string;
    translation?: string;
    readingTips?: string;
    aiExplanation?: string;
  };
  timestamp: string;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  speechRate,
  onOpenModelConfig,
  configVersion
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'story'>('chat');

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: '你好！我是您的专属 AI 语文与古诗词助手。您可以随时向我提问古诗词含义、字词发音、朗读技巧，或者要求我为您查找并添加指定的古诗、绕口令、儿歌！',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Story generator state
  const [topic, setTopic] = useState<string>('动物森林里的好朋友');
  const [difficulty, setDifficulty] = useState<string>('初级');
  const [targetSounds, setTargetSounds] = useState<string>('平翘舌音 z/c/s 与 zh/ch/sh');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [result, setResult] = useState<{
    title: string;
    content: string;
    focusSounds: string[];
    translation: string;
    readingTips: string;
  } | null>(null);

  const [currentKey, setCurrentKey] = useState<string>('');
  const [currentModel, setCurrentModel] = useState<string>('gemini-2.5-flash');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentKey(getCustomApiKey());
    setCurrentModel(getSelectedModel());
  }, [configVersion]);

  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleSendChat = async (queryText?: string) => {
    const textToSend = queryText || chatInput;
    const apiKey = getCustomApiKey();
    const model = getSelectedModel();

    if (!apiKey) {
      setErrorMessage('请先点击右上角【密钥/模型配置】手动填写并保存 Gemini API 密钥');
      return;
    }

    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setChatInput('');
    setChatLoading(true);
    setErrorMessage(null);

    try {
      const data = await consultPoetryOrTextAI(apiKey, textToSend, model);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.aiExplanation || data.translation || `为您找到了关于《${data.title}》的解析与朗读素材：`,
        structuredData: data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `抱歉，AI 咨询遇到了一点问题：${err?.message || '请检查网络或 API Key'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateStory = async () => {
    const apiKey = getCustomApiKey();
    const model = getSelectedModel();

    if (!apiKey) {
      setErrorMessage('请先点击右上角【密钥/模型配置】手动填写并保存 Gemini API 密钥');
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
      console.error(err);
      setErrorMessage(err?.message || '与 AI 服务通讯失败，请检查密钥与网络状态');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToLibrary = (item: {
    title: string;
    author?: string;
    category?: string;
    content: string;
    translation?: string;
    readingTips?: string;
    aiExplanation?: string;
  }) => {
    try {
      const saved = localStorage.getItem('pinyin_custom_materials');
      const list = saved ? JSON.parse(saved) : [];
      const newMaterial: ReadingMaterial = {
        id: `ai-chat-${Date.now()}`,
        title: item.title || 'AI 自定义咨询素材',
        author: item.author || 'AI 智能创作',
        category: (item.category as any) || 'poem',
        content: item.content,
        translation: item.translation || item.aiExplanation || 'AI 专家解析与诗词鉴赏'
      };
      localStorage.setItem('pinyin_custom_materials', JSON.stringify([newMaterial, ...list]));
      setSuccessMessage(`成功将《${item.title}》加入【朗读与背诵素材库】！可前往“朗读素材库”进行点读。`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
              <h1 className="text-2xl font-bold">AI 智能对话与古诗词助手</h1>
            </div>
            <p className="text-xs text-purple-100 max-w-2xl leading-relaxed">
              支持自由对话咨询任何古诗词含义、字词发音、朗读要领，更可要求 AI 添加指定古诗词并一键加入朗读库！
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

      {/* Mode Switch Tabs */}
      <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'chat'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>AI 自由对话与古诗词问答顾问</span>
        </button>

        <button
          onClick={() => setActiveTab('story')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'story'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>定制拼音短文生成器</span>
        </button>
      </div>

      {/* Current Active Model Status Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-purple-100 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="font-bold text-slate-700 dark:text-slate-300">当前 AI 所用模型:</span>
          <span className="font-mono font-bold text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800">
            {currentKey && currentModel !== '未设定模型' ? currentModel : '无 (请配置 API Key)'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {currentKey ? (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 已启用专属 API Key
            </span>
          ) : (
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> 尚未设置 API Key
            </span>
          )}

          <button
            onClick={onOpenModelConfig}
            className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
          >
            变更模型 &rarr;
          </button>
        </div>
      </div>

      {/* Error / Success Alerts */}
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

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* TAB 1: FREE CHAT & CONSULTANT */}
      {activeTab === 'chat' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col h-[650px]">
          
          {/* Chat Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAi ? '' : 'flex-row-reverse'}`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isAi
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-amber-500 text-white shadow-xs'
                    }`}
                  >
                    {isAi ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>

                  <div className={`max-w-[85%] space-y-3 ${isAi ? '' : 'text-right'}`}>
                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed inline-block text-left ${
                        isAi
                          ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                          : 'bg-purple-600 text-white'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {/* Structured Poetry / Material Card if returned by AI */}
                    {msg.structuredData && (
                      <div className="bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl p-5 space-y-4 text-left shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-100 dark:border-purple-900">
                          <div>
                            <h3 className="text-base font-serif font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{msg.structuredData.title}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-300 font-bold">
                                诗词素材
                              </span>
                            </h3>
                            {msg.structuredData.author && (
                              <p className="text-xs text-slate-500 mt-0.5">{msg.structuredData.author}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAddToLibrary(msg.structuredData!)}
                              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors"
                            >
                              <BookmarkPlus className="w-3.5 h-3.5" />
                              <span>加入朗读库</span>
                            </button>

                            <button
                              onClick={() => speakText(msg.structuredData!.content, speechRate)}
                              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs transition-colors"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>朗读</span>
                            </button>
                          </div>
                        </div>

                        {/* Content with Pinyin */}
                        <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-purple-100 dark:border-purple-900/50 justify-center">
                          {parsePinyinText(msg.structuredData.content).map((item, cIdx) => (
                            <div
                              key={cIdx}
                              onClick={() => speakText(item.char, speechRate)}
                              className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform"
                            >
                              <span className="text-[11px] font-sans text-purple-600 dark:text-purple-400 font-semibold mb-0.5">
                                {item.pinyin}
                              </span>
                              <span className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                                {item.char}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Translation & Reading Tips */}
                        {msg.structuredData.translation && (
                          <div className="text-xs text-slate-600 dark:text-slate-300 font-serif leading-relaxed">
                            <span className="font-bold text-slate-800 dark:text-slate-200">白话翻译: </span>
                            {msg.structuredData.translation}
                          </div>
                        )}

                        {msg.structuredData.readingTips && (
                          <div className="text-xs text-purple-900 dark:text-purple-300 font-sans bg-purple-100/50 dark:bg-purple-900/20 p-2.5 rounded-lg">
                            <span className="font-bold">朗读提示: </span>
                            {msg.structuredData.readingTips}
                          </div>
                        )}
                      </div>
                    )}

                    <span className="text-[10px] text-slate-400 block px-1">{msg.timestamp}</span>
                  </div>
                </div>
              );
            })}

            {chatLoading && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 animate-pulse" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 text-xs text-slate-500 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  <span>AI 正在思考并检索古诗词与拼音解析...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Bar */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 self-center mr-1">快捷提问:</span>
            {[
              '请帮我讲解李白的《静夜思》',
              '要求添加指定的古诗：苏轼《水调歌头》',
              '请写一首适合小学生练习平翘舌音的绕口令',
              '解释一下“温故而知新”的含义'
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendChat(preset)}
                className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-[11px] font-medium border border-purple-200 dark:border-purple-800 transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChat();
                }
              }}
              placeholder="输入任何古诗词、字词含义咨询，或要求添加指定古诗..."
              className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => handleSendChat()}
              disabled={chatLoading || !chatInput.trim()}
              className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
            >
              {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>发送</span>
            </button>
          </div>

        </div>
      )}

      {/* TAB 2: STORY GENERATOR */}
      {activeTab === 'story' && (
        <div className="space-y-6">
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
              onClick={handleGenerateStory}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? `AI 正在创作...` : '开始生成定制拼音短文'}</span>
            </button>
          </div>

          {/* Generated Result */}
          {result && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
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

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddToLibrary({ title: result.title, content: result.content, translation: result.translation, readingTips: result.readingTips, category: 'story' })}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition-colors"
                  >
                    <BookmarkPlus className="w-4 h-4" />
                    <span>加入朗读素材库</span>
                  </button>

                  <button
                    onClick={() => speakText(result.content, speechRate)}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow-2xs hover:bg-purple-700 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>朗读全文</span>
                  </button>
                </div>
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
      )}

    </div>
  );
};
