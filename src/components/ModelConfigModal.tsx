import React, { useState, useEffect } from 'react';
import {
  Key,
  Cpu,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  X
} from 'lucide-react';
import {
  getCustomApiKey,
  setCustomApiKey,
  getSelectedModel,
  setSelectedModel
} from '../utils/aiConfig';
import { listGeminiModels, testGeminiModel } from '../utils/geminiClient';

interface ModelInfo {
  id: string;
  displayName: string;
  description?: string;
  supportedGenerationMethods?: string[];
}

interface TestResult {
  loading: boolean;
  success?: boolean;
  responseText?: string;
  latencyMs?: number;
  error?: string;
}

interface ModelConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChange?: () => void;
}

export const ModelConfigModal: React.FC<ModelConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigChange
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [savedKey, setSavedKey] = useState<string>('');
  const [activeModel, setActiveModel] = useState<string>('gemini-3.6-flash');

  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loadingModels, setLoadingModels] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [testPrompt, setTestPrompt] = useState<string>('你好！请回复确认当前模型可用。');
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [customModelInput, setCustomModelInput] = useState<string>('');

  // Load configuration on mount or open
  useEffect(() => {
    if (isOpen) {
      const currentKey = getCustomApiKey();
      setApiKeyInput(currentKey);
      setSavedKey(currentKey);

      const currentModel = getSelectedModel();
      setActiveModel(currentModel);

      // Fetch models if key exists; otherwise clear model list
      if (currentKey) {
        handleFetchModels(currentKey);
      } else {
        setModels([]);
        setFetchError('请填写并保存您的 Gemini API 密钥以列出对应模型');
      }
    }
  }, [isOpen]);

  const handleSaveKey = () => {
    setCustomApiKey(apiKeyInput);
    setSavedKey(apiKeyInput.trim());
    if (onConfigChange) onConfigChange();
    if (apiKeyInput.trim()) {
      handleFetchModels(apiKeyInput.trim());
    } else {
      setModels([]);
      setActiveModel('未设定模型');
      setFetchError('请填写并保存 Gemini API 密钥');
    }
  };

  const handleClearKey = () => {
    setCustomApiKey('');
    setApiKeyInput('');
    setSavedKey('');
    setModels([]);
    setActiveModel('未设定模型');
    setFetchError('已清除密钥，所选模型已自动失效');
    if (onConfigChange) onConfigChange();
  };

  const handleFetchModels = async (keyToUse?: string) => {
    const key = keyToUse !== undefined ? keyToUse : apiKeyInput;
    if (!key.trim()) {
      setFetchError('请先填写 Gemini API 密钥');
      setModels([]);
      setActiveModel('未设定模型');
      return;
    }

    setLoadingModels(true);
    setFetchError(null);

    try {
      const fetchedModels = await listGeminiModels(key);
      if (fetchedModels && fetchedModels.length > 0) {
        setModels(fetchedModels);
        const currentModel = localStorage.getItem('gemini_selected_model');
        if (!currentModel || !fetchedModels.some((m) => m.id === currentModel)) {
          const defaultFirst = fetchedModels[0].id;
          setSelectedModel(defaultFirst);
          setActiveModel(defaultFirst);
          if (onConfigChange) onConfigChange();
        } else {
          setActiveModel(currentModel);
        }
      } else {
        setFetchError('当前 API 密钥未查找到任何可用模型，请核对密钥');
        setModels([]);
        setActiveModel('未设定模型');
        localStorage.removeItem('gemini_selected_model');
        if (onConfigChange) onConfigChange();
      }
    } catch (err: any) {
      setFetchError(err?.message || '请求失败，请检查网络状态及密钥正确性');
      setModels([]);
      setActiveModel('未设定模型');
      localStorage.removeItem('gemini_selected_model');
      if (onConfigChange) onConfigChange();
    } finally {
      setLoadingModels(false);
    }
  };

  const handleTestSingleModel = async (modelId: string) => {
    const key = apiKeyInput.trim() || savedKey;
    if (!key) {
      alert('请先手动填写并保存 Gemini API 密钥');
      return;
    }

    setTestResults((prev) => ({
      ...prev,
      [modelId]: { loading: true }
    }));

    try {
      const data = await testGeminiModel(key, modelId, testPrompt);
      setTestResults((prev) => ({
        ...prev,
        [modelId]: {
          loading: false,
          success: data.success,
          responseText: data.responseText,
          latencyMs: data.latencyMs,
          error: data.error
        }
      }));
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [modelId]: {
          loading: false,
          success: false,
          error: err?.message || '网络异常或接口请求超时'
        }
      }));
    }
  };

  const handleTestAllModels = async () => {
    for (const m of models) {
      await handleTestSingleModel(m.id);
    }
  };

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    setActiveModel(modelId);
    if (onConfigChange) onConfigChange();
  };

  const handleAddCustomModel = () => {
    if (!customModelInput.trim()) return;
    const modelId = customModelInput.trim();
    if (!models.some((m) => m.id === modelId)) {
      setModels((prev) => [
        { id: modelId, displayName: modelId, description: '自定义添加模型' },
        ...prev
      ]);
    }
    handleSelectModel(modelId);
    setCustomModelInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-50 via-indigo-50 to-white dark:from-slate-800/80 dark:to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Gemini 密钥与模型配置
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                手动设置您的专属 API Key，输出所有可用模型，支持一键联通测试与自定义模型选择
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          
          {/* Step 1: API Key Entry */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <Key className="w-4 h-4" /> 1. 手动填写 Gemini API 密钥 (API Key)
              </label>
              {savedKey ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 已保存专属 Key
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> 尚未填写 API Key
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="在此输入 AI Studio 或 Google Gemini 的 API Key (如 AIzaSy...)"
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveKey}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  <span>保存 Key</span>
                </button>
                {savedKey && (
                  <button
                    onClick={handleClearKey}
                    className="px-3 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-rose-100 hover:text-rose-700 text-xs transition-colors"
                  >
                    清除 Key
                  </button>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              提示：填入密钥后仅保存在当前浏览器本地，直接用于请求获取模型和智能生成，不占用全局共享额度。
            </p>
          </div>

          {/* Step 2: Fetch and List Models */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-500" />
                  <span>2. 账号对应的所有模型列表 ({models.length})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  可列出此 API Key 支持的所有 Gemini 语言与分析模型
                </p>
              </div>

              <button
                onClick={() => handleFetchModels()}
                disabled={loadingModels}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loadingModels ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>刷新/获取所有模型</span>
              </button>
            </div>

            {fetchError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{fetchError}</span>
              </div>
            )}

            {/* Test prompt & Test All Models Controls */}
            <div className="bg-purple-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-purple-100 dark:border-slate-700/60 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="flex-1 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">测试提示词:</span>
                <input
                  type="text"
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="如: 你好、请回答1+1等于几..."
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <button
                onClick={handleTestAllModels}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-xs hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>一键测试所有模型</span>
              </button>
            </div>

            {/* Custom Model Input Fallback */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customModelInput}
                onChange={(e) => setCustomModelInput(e.target.value)}
                placeholder="手动输入特定模型 ID (如 gemini-3.6-flash)..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
              />
              <button
                onClick={handleAddCustomModel}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-semibold hover:bg-slate-300"
              >
                添加并选中
              </button>
            </div>

            {/* Models Cards Grid / List */}
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {models.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-slate-500 space-y-2">
                  <XCircle className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-medium">
                    {savedKey || apiKeyInput
                      ? '密钥校验失败或输入错误，无可用模型。请确认 API Key 正确无误后点击“保存 Key”或“刷新/获取所有模型”。'
                      : '请先在上方填写并保存 Gemini API 密钥，以输出当前账号可用的模型列表。'}
                  </p>
                </div>
              ) : (
                models.map((m) => {
                  const isSelected = activeModel === m.id;
                  const result = testResults[m.id];

                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-400 dark:border-purple-600 shadow-2xs'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/70 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                              {m.id}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> 当前使用中
                              </span>
                            )}
                          </div>
                          {m.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {m.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Test Single Model Button */}
                          <button
                            onClick={() => handleTestSingleModel(m.id)}
                            disabled={result?.loading}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
                          >
                            {result?.loading ? (
                              <Loader2 className="w-3 h-3 animate-spin text-purple-600" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                            <span>测试模型</span>
                          </button>

                          {/* Select Model Button */}
                          <button
                            onClick={() => handleSelectModel(m.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                              isSelected
                                ? 'bg-purple-600 text-white shadow-2xs'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-purple-100 hover:text-purple-700'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>已选用</span>
                              </>
                            ) : (
                              <span>选择此模型</span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Test Result Box */}
                      {result && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                          {result.loading ? (
                            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>正在测试模型响应可用性...</span>
                            </div>
                          ) : result.success ? (
                            <div className="space-y-1 bg-emerald-50/70 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200">
                              <div className="flex items-center justify-between font-bold">
                                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> 测试成功
                                </span>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                                  响应耗时: {result.latencyMs}ms
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/30 mt-1">
                                💬 回复内容: "{result.responseText}"
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-1 bg-rose-50/70 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200">
                              <div className="flex items-center gap-1 font-bold text-rose-700 dark:text-rose-400">
                                <XCircle className="w-3.5 h-3.5" /> 测试失败
                              </div>
                              <p className="text-[11px] text-rose-800 dark:text-rose-300 font-mono break-all">
                                原因: {result.error}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>当前选中AI智能生成模型:</span>
            <span className="font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
              {savedKey && activeModel !== '未设定模型' ? activeModel : '无 (需填写有效密钥并选择模型)'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs transition-colors"
          >
            完成配置
          </button>
        </div>

      </div>
    </div>
  );
};
