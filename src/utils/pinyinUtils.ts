import { pinyin } from 'pinyin-pro';
import { PinyinResultChar, ToneType } from '../types';

/**
 * Parses Chinese text into detailed character-by-character pinyin analysis
 */
export function parsePinyinText(
  text: string,
  options: {
    toneType?: ToneType;
    nonHanziKeep?: boolean;
  } = {}
): PinyinResultChar[] {
  if (!text) return [];

  const { toneType = 'symbol' } = options;

  // Get full details array from pinyin-pro
  try {
    const allData = pinyin(text, {
      type: 'all',
      toneType: toneType === 'first' ? 'symbol' : toneType,
      pattern: toneType === 'first' ? 'first' : 'pinyin',
      nonZh: 'consecutive'
    });

    return allData.map((item: any) => {
      const char = item.origin || '';
      const pyStr = item.pinyin || '';
      const num = item.num || 0;

      // Extract tone number (1-4, 0 for neutral)
      const tone = num >= 1 && num <= 4 ? num : 0;

      return {
        char,
        pinyin: pyStr,
        pinyinClean: item.pinyin ? item.pinyin.replace(/[1-4]/g, '') : '',
        tone,
        isPolyphonic: item.isPolyphonic || item.polyphonic || false,
        allPinyins: item.allPinyin || [pyStr]
      };
    });
  } catch (err) {
    console.error('Error parsing pinyin:', err);
    // Fallback if pinyin-pro fails on edge cases
    return text.split('').map((c) => ({
      char: c,
      pinyin: '',
      pinyinClean: '',
      tone: 0,
      isPolyphonic: false,
      allPinyins: []
    }));
  }
}

/**
 * Gets Tailwind color classes corresponding to Pinyin tones
 */
export function getToneColorClass(tone: number): {
  text: string;
  bg: string;
  border: string;
  badge: string;
} {
  switch (tone) {
    case 1: // 阴平 - 红色系
      return {
        text: 'text-rose-600 dark:text-rose-400 font-medium',
        bg: 'bg-rose-50 dark:bg-rose-950/30',
        border: 'border-rose-200 dark:border-rose-800',
        badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
      };
    case 2: // 阳平 - 绿色系
      return {
        text: 'text-emerald-600 dark:text-emerald-400 font-medium',
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        border: 'border-emerald-200 dark:border-emerald-800',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
      };
    case 3: // 上声 - 蓝色系
      return {
        text: 'text-blue-600 dark:text-blue-400 font-medium',
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        border: 'border-blue-200 dark:border-blue-800',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
      };
    case 4: // 去声 - 紫色系
      return {
        text: 'text-purple-600 dark:text-purple-400 font-medium',
        bg: 'bg-purple-50 dark:bg-purple-950/30',
        border: 'border-purple-200 dark:border-purple-800',
        badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
      };
    default: // 轻声或非汉字 - 灰色系
      return {
        text: 'text-slate-600 dark:text-slate-400',
        bg: 'bg-slate-50 dark:bg-slate-800/50',
        border: 'border-slate-200 dark:border-slate-700',
        badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
      };
  }
}

/**
 * Text-To-Speech Pronunciation Helper using Web Speech API
 */
export function speakText(
  text: string,
  rate = 0.9,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return;
  }

  window.speechSynthesis.cancel(); // Stop current speech if any

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = rate;

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;

  // Try to find a natural Chinese voice if available
  const voices = window.speechSynthesis.getVoices();
  const zhVoice = voices.find((v) => v.lang.includes('zh') || v.lang.includes('CN'));
  if (zhVoice) {
    utterance.voice = zhVoice;
  }

  window.speechSynthesis.speak(utterance);
}
