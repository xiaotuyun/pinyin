import { PolyphonicEntry, ReadingMaterial, QuizQuestion } from '../types';

export const POLYPHONIC_DATABASE: PolyphonicEntry[] = [
  {
    char: '行',
    pronunciations: [
      {
        pinyin: 'xíng',
        meaning: '行走、允许、能力强',
        examples: ['行人', '不行', '品行', '一行人'],
        sampleSentence: '小明在路上行走，大家都说他能力很行。'
      },
      {
        pinyin: 'háng',
        meaning: '行列、行业、排行',
        examples: ['银行', '行业', '行长', '一行字'],
        sampleSentence: '爸爸在银行工作，是这个行业的高手。'
      }
    ]
  },
  {
    char: '重',
    pronunciations: [
      {
        pinyin: 'zhòng',
        meaning: '重量、分量大、重要',
        examples: ['重量', '重要', '沉重', '重音'],
        sampleSentence: '这个任务非常重要，份量也很重。'
      },
      {
        pinyin: 'chóng',
        meaning: '重复、再次、层',
        examples: ['重新', '重复', '重逢', '三重奏'],
        sampleSentence: '请把这道题目重新做一遍。'
      }
    ]
  },
  {
    char: '长',
    pronunciations: [
      {
        pinyin: 'cháng',
        meaning: '两点间距离大、时间久',
        examples: ['长城', '长江', '长远', '长短'],
        sampleSentence: '万里长城历史悠久，绵延很长。'
      },
      {
        pinyin: 'zhǎng',
        meaning: '生长、增加、长辈、领导',
        examples: ['长大', '长辈', '校长', '生长'],
        sampleSentence: '小树苗健康地长大了，校长非常高兴。'
      }
    ]
  },
  {
    char: '好',
    pronunciations: [
      {
        pinyin: 'hǎo',
        meaning: '优点多、使人满意、完好',
        examples: ['好人', '好听', '友好', '好久'],
        sampleSentence: '今天天气很好，大家都很高兴。'
      },
      {
        pinyin: 'hào',
        meaning: '喜爱、爱好、容易发生',
        examples: ['爱好', '好强', '好奇', '好动'],
        sampleSentence: '小华是一个非常有好奇心、好学的好孩子。'
      }
    ]
  },
  {
    char: '乐',
    pronunciations: [
      {
        pinyin: 'lè',
        meaning: '快乐、欢喜、笑',
        examples: ['快乐', '乐趣', '乐意', '乐呵呵'],
        sampleSentence: '读书能给我们带来很多乐趣。'
      },
      {
        pinyin: 'yuè',
        meaning: '声音音律、乐器',
        examples: ['音乐', '乐器', '乐队', '乐谱'],
        sampleSentence: '她非常喜欢聆听优美的交响音乐。'
      }
    ]
  },
  {
    char: '还',
    pronunciations: [
      {
        pinyin: 'hái',
        meaning: '依然、仍然、更加',
        examples: ['还有', '还要', '还是', '还不错'],
        sampleSentence: '除了苹果，桌子上还有香蕉。'
      },
      {
        pinyin: 'huán',
        meaning: '归还、回返、回报',
        examples: ['还书', '还钱', '归还', '还乡'],
        sampleSentence: '请你明天把借的书归还给图书馆。'
      }
    ]
  },
  {
    char: '差',
    pronunciations: [
      {
        pinyin: 'chà',
        meaning: '错误、缺少、不好',
        examples: ['差不多', '差劲', '还差一人'],
        sampleSentence: '我们两人的成绩差不多。'
      },
      {
        pinyin: 'chā',
        meaning: '不同、不相合、计算余数',
        examples: ['差别', '差距', '时差', '误差'],
        sampleSentence: '东西方文化存在着一定的差别。'
      },
      {
        pinyin: 'chāi',
        meaning: '派遣、差役、公事',
        examples: ['出差', '差事', '听差'],
        sampleSentence: '经理下周要去上海出差。'
      },
      {
        pinyin: 'cī',
        meaning: '参差不齐（长短不一）',
        examples: ['参差不齐'],
        sampleSentence: '树枝长得参差不齐。'
      }
    ]
  },
  {
    char: '着',
    pronunciations: [
      {
        pinyin: 'zhe',
        meaning: '助词，表示动作或状态的持续',
        examples: ['看着', '笑着', '听着', '走着'],
        sampleSentence: '他微笑着看着远方。'
      },
      {
        pinyin: 'zháo',
        meaning: '接触到、受到、燃起',
        examples: ['着火', '着急', '睡着', '着凉'],
        sampleSentence: '外面风大，小心着凉感冒。'
      },
      {
        pinyin: 'zhuó',
        meaning: '穿戴、接触、下笔',
        examples: ['着陆', '着重', '穿着', '着手'],
        sampleSentence: '飞机顺畅地着陆在跑道上。'
      },
      {
        pinyin: 'zhāo',
        meaning: '下棋下子、招数、方法',
        examples: ['高着', '绝着', '走为上着'],
        sampleSentence: '这一招棋下得非常巧妙。'
      }
    ]
  }
];

export const READING_MATERIALS: ReadingMaterial[] = [
  {
    id: 'poem-1',
    title: '静夜思',
    category: 'poem',
    author: '李白 (唐代)',
    difficulty: 'beginner',
    content: `床前明月光，
疑是地上霜。
举头望明月，
低头思故乡。`,
    translation: 'Moonlight hits the foot of my bed, like frost on the ground. Raising my head, I look at the bright moon; bowing my head, I long for my hometown.'
  },
  {
    id: 'poem-2',
    title: '咏鹅',
    category: 'poem',
    author: '骆宾王 (唐代)',
    difficulty: 'beginner',
    content: `鹅，鹅，鹅，
曲项向天歌。
白毛浮绿水，
红掌拨清波。`,
    translation: 'Goose, goose, goose, with curved neck singing to the sky. White feathers float on green water, red webs push clear waves.'
  },
  {
    id: 'poem-3',
    title: '登鹳雀楼',
    category: 'poem',
    author: '王之涣 (唐代)',
    difficulty: 'beginner',
    content: `白日依山尽，
黄河入海流。
欲穷千里目，
更上一层楼。`,
    translation: 'The white sun sets behind the mountains, the Yellow River flows into the sea. To see a thousand miles further, step up another story.'
  },
  {
    id: 'twister-1',
    title: '四是四，十是十',
    category: 'twister',
    difficulty: 'intermediate',
    content: `四是四，十是十。
十四是十四，四十是四十。
莫把十四说四十，
莫把四十说十四。`,
    translation: 'Classic tongue twister practicing "s" (平舌音) vs "sh" (翘舌音).'
  },
  {
    id: 'twister-2',
    title: '八百标兵奔北坡',
    category: 'twister',
    difficulty: 'advanced',
    content: `八百标兵奔北坡，
炮兵并排北坡炮。
炮兵怕把标兵碰，
标兵怕碰炮兵炮。`,
    translation: 'Classic tongue twister practicing "b" and "p" labial sounds.'
  },
  {
    id: 'twister-3',
    title: '吃葡萄不吐葡萄皮',
    category: 'twister',
    difficulty: 'intermediate',
    content: `吃葡萄不吐葡萄皮，
不吃葡萄倒吐葡萄皮。`,
    translation: 'Eat grapes without spitting grape skins, do not eat grapes yet spit grape skins.'
  },
  {
    id: 'idiom-1',
    title: '自强不息',
    category: 'idiom',
    difficulty: 'beginner',
    content: `天行健，君子以自强不息。`,
    translation: 'As heaven maintain vigor through movement, gentlefolk should constantly strive for self-improvement.'
  },
  {
    id: 'idiom-2',
    title: '温故知新',
    category: 'idiom',
    difficulty: 'beginner',
    content: `温故而知新，可以为师矣。`,
    translation: 'Reviewing the old and learning the new enables one to become a teacher.'
  }
];

export const SAMPLE_QUIZZES: QuizQuestion[] = [
  {
    id: 'q1',
    type: 'select-pinyin',
    questionText: '请选择汉字 “拼” 的正确拼音：',
    targetChar: '拼',
    options: ['pīn', 'pīng', 'pīnɡ', 'pīnɡ'],
    correctAnswer: 'pīn',
    explanation: '“拼” 是前鼻音，拼音为 pīn（一声）。'
  },
  {
    id: 'q2',
    type: 'polyphonic-context',
    questionText: '在句子“他准备去银行（）办理业务”中，“行”字读音是：',
    targetChar: '行',
    options: ['háng', 'xíng', 'xìng', 'hàng'],
    correctAnswer: 'háng',
    explanation: '“银行” 指办理金融金融业务的机构，其中“行”读作 háng。'
  },
  {
    id: 'q3',
    type: 'select-pinyin',
    questionText: '请选择汉字 “鞥” 的拼音类型或韵母：',
    targetChar: '鞥',
    options: ['eng (后鼻韵母)', 'en (前鼻韵母)', 'in (前鼻韵母)', 'ang (后鼻韵母)'],
    correctAnswer: 'eng (后鼻韵母)',
    explanation: '“鞥” 读 ēng，韵母为 eng，属于后鼻韵母。'
  },
  {
    id: 'q4',
    type: 'polyphonic-context',
    questionText: '在句子“万里长（）城”中，“长”字的读音是：',
    targetChar: '长',
    options: ['cháng', 'zhǎng', 'chàng', 'zhàng'],
    correctAnswer: 'cháng',
    explanation: '“长城”表示空间距离绵延，读作 cháng。'
  },
  {
    id: 'q5',
    type: 'tone-match',
    questionText: '“妈妈”两个字中，第二个“妈”的声调是：',
    targetChar: '妈',
    options: ['轻声 (0声)', '一声 (阴平)', '二声 (阳平)', '四声 (去声)'],
    correctAnswer: '轻声 (0声)',
    explanation: '在重叠词“妈妈(mā ma)”中，第二个字念轻声，短而轻微。'
  },
  {
    id: 'q6',
    type: 'select-pinyin',
    questionText: '字母“ü”与“j q x”相拼时，上面的两点应该：',
    options: ['省去不写', '必须保留', '改成横线', '标在前面'],
    correctAnswer: '省去不写',
    explanation: '拼音规则：j q x 与 ü 相拼时，ü 上两点省略，如 ju qu xu。'
  }
];
