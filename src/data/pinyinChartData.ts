export interface ShengmuItem {
  symbol: string;
  category: string;
  example: string;
  examplePinyin: string;
  tip: string;
}

export interface YunmuItem {
  symbol: string;
  category: string;
  example: string;
  examplePinyin: string;
  tip: string;
}

export interface ZhengtiItem {
  symbol: string;
  example: string;
  examplePinyin: string;
}

export interface ToneInfo {
  toneNumber: number;
  name: string;
  symbolExample: string;
  contour: string; // e.g. "55"
  description: string;
  mnemonic: string;
}

export const SHENGMU_LIST: ShengmuItem[] = [
  { symbol: 'b', category: '双唇音', example: '播', examplePinyin: 'bō', tip: '双唇紧闭，然后突然张开，吐出较弱的气流' },
  { symbol: 'p', category: '双唇音', example: '泼', examplePinyin: 'pō', tip: '发音部位与b相同，但送出的气流较强' },
  { symbol: 'm', category: '双唇音', example: '摸', examplePinyin: 'mō', tip: '双唇紧闭，气流从鼻腔通过，声带振动' },
  { symbol: 'f', category: '唇齿音', example: '佛', examplePinyin: 'fó', tip: '上齿接触下唇，气流从唇齿缝隙中摩擦而出' },
  
  { symbol: 'd', category: '舌尖中音', example: '得', examplePinyin: 'dé', tip: '舌尖抵住上齿龈，突然放开，气流较弱' },
  { symbol: 't', category: '舌尖中音', example: '特', examplePinyin: 'tè', tip: '发音部位与d相同，但喷出较强的气流' },
  { symbol: 'n', category: '舌尖中音', example: '呐', examplePinyin: 'nà', tip: '舌尖抵住上齿龈，气流从鼻腔通过，声带振动' },
  { symbol: 'l', category: '舌尖中音', example: '勒', examplePinyin: 'lè', tip: '舌尖抵住上齿龈，气流从舌头两侧流出' },
  
  { symbol: 'g', category: '舌根音', example: '哥', examplePinyin: 'gē', tip: '舌根抵住软腭，突然放开，吐出较弱气流' },
  { symbol: 'k', category: '舌根音', example: '蝌', examplePinyin: 'kē', tip: '发音部位与g相同，但送出较强的气流' },
  { symbol: 'h', category: '舌根音', example: '喝', examplePinyin: 'hē', tip: '舌根接近软腭，气流从缝隙中摩擦而出' },
  
  { symbol: 'j', category: '舌面音', example: '基', examplePinyin: 'jī', tip: '舌面前部抵住硬腭前部，然后微开形成缝隙' },
  { symbol: 'q', category: '舌面音', example: '欺', examplePinyin: 'qī', tip: '发音部位与j相同，但送出较强的气流' },
  { symbol: 'x', category: '舌面音', example: '希', examplePinyin: 'xī', tip: '舌面前部接近硬腭前部，气流从中摩擦而出' },
  
  { symbol: 'zh', category: '翘舌音 (主音)', example: '知', examplePinyin: 'zhī', tip: '舌尖向上卷翘抵住硬腭前部，气流较弱' },
  { symbol: 'ch', category: '翘舌音 (主音)', example: '吃', examplePinyin: 'chī', tip: '发音部位与zh相同，但送出较强的气流' },
  { symbol: 'sh', category: '翘舌音 (主音)', example: '狮', examplePinyin: 'shī', tip: '舌尖翘起接近硬腭前部，气流摩擦而出' },
  { symbol: 'r', category: '翘舌音 (主音)', example: '日', examplePinyin: 'rì', tip: '发音部位与sh相同，但声带需要振动' },
  
  { symbol: 'z', category: '平舌音', example: '姿', examplePinyin: 'zī', tip: '舌尖抵住上齿背，微开缝隙，气流较弱' },
  { symbol: 'c', category: '平舌音', example: '雌', examplePinyin: 'cí', tip: '发音部位与z相同，但送出较强的气流' },
  { symbol: 's', category: '平舌音', example: '思', examplePinyin: 'sī', tip: '舌尖接近上齿背，气流从狭缝摩擦而出' },
  
  { symbol: 'y', category: '零声母起笔', example: '衣', examplePinyin: 'yī', tip: '作韵母i的开头引导音，发音接近i' },
  { symbol: 'w', category: '零声母起笔', example: '乌', examplePinyin: 'wū', tip: '作韵母u的开头引导音，发音接近u' }
];

export const YUNMU_LIST: YunmuItem[] = [
  // 单韵母
  { symbol: 'a', category: '单韵母', example: '啊', examplePinyin: 'ā', tip: '张大嘴巴，舌位低，响亮平稳' },
  { symbol: 'o', category: '单韵母', example: '喔', examplePinyin: 'ō', tip: '嘴唇拢圆成圆形，舌头后缩' },
  { symbol: 'e', category: '单韵母', example: '鹅', examplePinyin: 'é', tip: '嘴半开半闭，角向两边展开，发音如“鹅”' },
  { symbol: 'i', category: '单韵母', example: '衣', examplePinyin: 'yī', tip: '牙齿对齐，嘴角向两边展平如微笑' },
  { symbol: 'u', category: '单韵母', example: '乌', examplePinyin: 'wū', tip: '嘴唇突起成小圆孔，舌头后缩' },
  { symbol: 'ü', category: '单韵母', example: '迂', examplePinyin: 'yū', tip: '发i音的同时把嘴唇撮圆呈小孔状' },

  // 复韵母
  { symbol: 'ai', category: '复韵母', example: '爱', examplePinyin: 'ài', tip: '先发a音，滑动过渡到i音' },
  { symbol: 'ei', category: '复韵母', example: '欸', examplePinyin: 'èi', tip: '先发e音，滑动过渡到i音' },
  { symbol: 'ui', category: '复韵母', example: '威', examplePinyin: 'wēi', tip: '由u向ei滑动，嘴形由圆变扁' },
  { symbol: 'ao', category: '复韵母', example: '奥', examplePinyin: 'ào', tip: '先发a音，滑动过渡到o音' },
  { symbol: 'ou', category: '复韵母', example: '欧', examplePinyin: 'ōu', tip: '先发o音，滑动过渡到u音' },
  { symbol: 'iu', category: '复韵母', example: '优', examplePinyin: 'yōu', tip: '由i向ou滑动，口形由扁变圆' },
  { symbol: 'ie', category: '复韵母', example: '耶', examplePinyin: 'yē', tip: '先发i音，再滑向e音' },
  { symbol: 'üe', category: '复韵母', example: '约', examplePinyin: 'yuē', tip: '先发ü音，再滑向e音' },
  { symbol: 'er', category: '特殊韵母', example: '耳', examplePinyin: 'ěr', tip: '卷舌韵母，发音时舌尖向硬腭卷起' },

  // 前鼻韵母
  { symbol: 'an', category: '前鼻韵母', example: '安', examplePinyin: 'ān', tip: '先发a音，舌尖抵住上齿龈作n鼻音收尾' },
  { symbol: 'en', category: '前鼻韵母', example: '恩', examplePinyin: 'ēn', tip: '先发e音，舌尖抵住上齿龈收n尾' },
  { symbol: 'in', category: '前鼻韵母', example: '因', examplePinyin: 'yīn', tip: '先发i音，舌尖抵住上齿龈收n尾' },
  { symbol: 'un', category: '前鼻韵母', example: '温', examplePinyin: 'wēn', tip: '先发u音，舌尖抵住上齿龈收n尾' },
  { symbol: 'ün', category: '前鼻韵母', example: '晕', examplePinyin: 'yūn', tip: '先发ü音，舌尖抵住上齿龈收n尾' },

  // 后鼻韵母
  { symbol: 'ang', category: '后鼻韵母', example: '昂', examplePinyin: 'áng', tip: '先发a音，舌根抵住软腭发ng鼻音' },
  { symbol: 'eng', category: '后鼻韵母', example: '鞥', examplePinyin: 'ēng', tip: '先发e音，舌根抵住软腭发ng鼻音' },
  { symbol: 'ing', category: '后鼻韵母', example: '英', examplePinyin: 'yīng', tip: '先发i音，舌根抵住软腭发ng鼻音' },
  { symbol: 'ong', category: '后鼻韵母', example: '轰', examplePinyin: 'hōng', tip: '先发o音，嘴唇发圆，舌根抵住软腭收ng' }
];

export const ZHENGTI_LIST: ZhengtiItem[] = [
  { symbol: 'zhi', example: '织', examplePinyin: 'zhī' },
  { symbol: 'chi', example: '吃', examplePinyin: 'chī' },
  { symbol: 'shi', example: '诗', examplePinyin: 'shī' },
  { symbol: 'ri', example: '日', examplePinyin: 'rì' },
  { symbol: 'zi', example: '姿', examplePinyin: 'zī' },
  { symbol: 'ci', example: '词', examplePinyin: 'cí' },
  { symbol: 'si', example: '丝', examplePinyin: 'sī' },
  { symbol: 'yi', example: '衣', examplePinyin: 'yī' },
  { symbol: 'wu', example: '乌', examplePinyin: 'wū' },
  { symbol: 'yu', example: '鱼', examplePinyin: 'yú' },
  { symbol: 'ye', example: '夜', examplePinyin: 'yè' },
  { symbol: 'yue', example: '月', examplePinyin: 'yuè' },
  { symbol: 'yuan', example: '元', examplePinyin: 'yuán' },
  { symbol: 'yin', example: '因', examplePinyin: 'yīn' },
  { symbol: 'yun', example: '云', examplePinyin: 'yún' },
  { symbol: 'ying', example: '鹰', examplePinyin: 'yīng' }
];

export const TONE_INFOS: ToneInfo[] = [
  {
    toneNumber: 1,
    name: '一声（阴平）',
    symbolExample: 'ā māmā',
    contour: '55 高平',
    description: '发音时声调高而平，保持五度音阶的最高点。',
    mnemonic: '一声平平高高挂 (¯)'
  },
  {
    toneNumber: 2,
    name: '二声（阳平）',
    symbolExample: 'á mámá',
    contour: '35 中升',
    description: '发音由中音升到高音，就像提问说话时的上扬语气。',
    mnemonic: '二声就像上山坡 (ˊ)'
  },
  {
    toneNumber: 3,
    name: '三声（上声）',
    symbolExample: 'ǎ mǎmǎ',
    contour: '214 降升',
    description: '发音先降到最低，再转折向上扬起，音长较长。',
    mnemonic: '三声下坡又上坡 (ˇ)'
  },
  {
    toneNumber: 4,
    name: '四声（去声）',
    symbolExample: 'à màmà',
    contour: '51 全降',
    description: '发音从最高音快速陡降到最低音，干脆利落。',
    mnemonic: '四声就像下山坡 (ˋ)'
  },
  {
    toneNumber: 0,
    name: '轻声',
    symbolExample: 'a mama',
    contour: '短促',
    description: '发音短而轻微，不标注声调符号。如：妈妈(mā ma)。',
    mnemonic: '轻声轻短不标号 (•)'
  }
];

export const PINYIN_RULES = [
  {
    title: '标调口诀',
    content: '有 a 在，给 a 标；a 不在，找 o e；i u 并列标在后，单个韵母不用说。'
  },
  {
    title: 'j q x 与 ü 相拼规则',
    content: 'j、q、x 与 ü 相拼时，ü 上面的两点省去不写（如 ju、qu、xu、yuan）。但 n、l 与 ü 相拼时必须保留两点（如 nǚ、lǚ）。'
  },
  {
    title: '“一”的变调规则',
    content: '单念或在词尾读一声(yī)；在四声前读二声(yí，如“一定”)；在一、二、三声前读四声(yì，如“一天”)。'
  },
  {
    title: '“不”的变调规则',
    content: '单念或在一、二、三声前读四声(bù)；在四声字前读二声(bú，如“不是”、“不对”)。'
  }
];
