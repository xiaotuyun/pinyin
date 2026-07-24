export function getCustomApiKey(): string {
  return localStorage.getItem('gemini_custom_api_key') || '';
}

export function setCustomApiKey(key: string): void {
  const trimmed = key.trim();
  if (!trimmed) {
    localStorage.removeItem('gemini_custom_api_key');
    localStorage.removeItem('gemini_selected_model');
  } else {
    localStorage.setItem('gemini_custom_api_key', trimmed);
  }
}

export function getSelectedModel(): string {
  const key = getCustomApiKey();
  if (!key) {
    return '未设定模型';
  }
  return localStorage.getItem('gemini_selected_model') || 'gemini-3.6-flash';
}

export function setSelectedModel(model: string): void {
  const key = getCustomApiKey();
  if (!key) {
    localStorage.removeItem('gemini_selected_model');
    return;
  }
  localStorage.setItem('gemini_selected_model', model);
}
