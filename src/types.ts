export type ToneType = 'symbol' | 'num' | 'none' | 'first';

export type DisplayMode = 'ruby' | 'inline' | 'stacked' | 'cards';

export interface PinyinResultChar {
  char: string;
  pinyin: string;
  pinyinClean: string;
  tone: number; // 0 (neutral), 1, 2, 3, 4
  isPolyphonic?: boolean;
  allPinyins?: string[];
}

export interface PolyphonicEntry {
  id?: string;
  char: string;
  pronunciations: {
    pinyin: string;
    meaning: string;
    examples: string[];
    sampleSentence: string;
  }[];
  isCustom?: boolean;
}

export interface ReadingMaterial {
  id: string;
  title: string;
  category: 'poem' | 'twister' | 'idiom' | 'story';
  author?: string;
  content: string;
  translation?: string;
  audioUrl?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface QuizQuestion {
  id: string;
  type: 'select-pinyin' | 'polyphonic-context' | 'tone-match' | 'pinyin-to-hanzi';
  questionText: string;
  targetChar?: string;
  pinyinHint?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface AIAnalysisResult {
  polyphonicChars?: {
    char: string;
    pinyinInContext: string;
    meaningInContext: string;
    otherPronunciations: { pinyin: string; meaning: string }[];
  }[];
  segmentedWords?: {
    word: string;
    pinyin: string;
    meaning: string;
    partOfSpeech?: string;
  }[];
  explanation?: string;
  grammarNotes?: string;
  recommendedLevel?: string;
}
