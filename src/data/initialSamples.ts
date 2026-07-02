import { ShitsumonKobo_Content } from '../types';

export const initialSamples: ShitsumonKobo_Content[] = [
  {
    id: "sample_diagnostic_mbti",
    title: "あなたの認知心理類型診断 (Ni-Ti-Fe-Se)",
    description: "あなたが日常の中でどの認知機能（未来予測のNi、論理追求のTi、他者調和のFe、現在没頭のSe）を駆使しているかを細かく割り出すリアル特性診断。芋虫がうろうろするギミック付き！",
    type: "diagnostic",
    creatorName: "デフォルト",
    isPublic: true,
    themeColorMode: "auto",
    customColor: "#ec4899",
    scoringAttributes: ["Ni", "Ti", "Fe", "Se"],
    createdAt: "2020-01-01T00:00:00.000Z",
    gimmicks: {
      enableLsiCaterpillar: true,
      caterpillarQuotes: [
        "LSIは、感覚と主観的論理の塊なのだ…🐛",
        "そんなにタップしないでほしい、潰れちゃうから…",
        "Niって、結局ひらめきのことなのか？",
        "Tiを極めし者は、すべてのバグを憎む…！",
        "ふん、お前はSeが足りていないようだな！"
      ],
      caterpillarSquishTarget: 30,
      enableTapBeat: false,
      tapBeatEmojis: ["💡", "⚡", "🧠"],
      tapBeatSoundType: "synth",
      enableFreeImageInsertion: true
    },
    questions: [
      {
        id: "q_mbti_1",
        text: "物事の全体像や、未来に起こることが一瞬のひらめきとして頭に浮かぶことがある。",
        type: "five_choices",
        skipEnabled: true,
        sliderMin: 0,
        sliderMax: 100,
        sliderStep: 1,
        sliderLeftLabel: "そんなことはない",
        sliderRightLabel: "常にある",
        sliderScores: { Ni: 2 },
        choices: [
          { id: "c1_1", text: "強くそう思う", scores: { Ni: 4, Se: -1 } },
          { id: "c1_2", text: "少しそう思う", scores: { Ni: 2 } },
          { id: "c1_3", text: "どちらとも言えない", scores: {} },
          { id: "c1_4", text: "あまりそう思わない", scores: { Se: 2, Ni: -1 } },
          { id: "c1_5", text: "全くそう思わない", scores: { Se: 4, Ni: -2 } }
        ],
        textRules: [],
        pairItems: []
      },
      {
        id: "q_mbti_2",
        text: "物事の仕組みや論理的な一貫性が説明できない状態があると、どうにかして理路整然とさせたくなる。",
        type: "radio",
        skipEnabled: true,
        sliderMin: 0,
        sliderMax: 100,
        sliderStep: 1,
        sliderLeftLabel: "",
        sliderRightLabel: "",
        sliderScores: {},
        choices: [
          { id: "c2_1", text: "まさにその通り。徹底的に突き詰めたい", scores: { Ti: 4, Fe: -1 } },
          { id: "c2_2", text: "だいたいは論理的な方がスッキリする", scores: { Ti: 2 } },
          { id: "c2_3", text: "そこまでこだわらない。感情や雰囲気の方が大事", scores: { Fe: 3, Ti: -2 } }
        ],
        textRules: [],
        pairItems: []
      },
      {
        id: "q_mbti_3",
        text: "周りの人が悲しんでいたり、その場の空気がピリピリしていると、自分も影響されやすく、すぐに調和を取り戻そうと頑張ってしまう。",
        type: "checkbox",
        skipEnabled: false,
        sliderMin: 0,
        sliderMax: 100,
        sliderStep: 1,
        sliderLeftLabel: "",
        sliderRightLabel: "",
        sliderScores: {},
        choices: [
          { id: "c3_1", text: "他人の感情をすごく敏感に察知して、笑顔を増やそうとする", scores: { Fe: 3 } },
          { id: "c3_2", text: "気遣いや言葉をかけて相手が安心できるようにする", scores: { Fe: 2 } },
          { id: "c3_3", text: "自分は自分、人は人と割り切って静観する", scores: { Ti: 2, Fe: -2 } }
        ],
        textRules: [],
        pairItems: []
      },
      {
        id: "q_mbti_4",
        text: "「今この瞬間、目の前にあるリアルな映像や体験、美味しいものをそのまま全身で楽しめているか？」をスライダーで表現すると？",
        type: "slider",
        skipEnabled: false,
        sliderMin: 0,
        sliderMax: 10,
        sliderStep: 1,
        sliderLeftLabel: "ずっと考え事をしていて上の空",
        sliderRightLabel: "完全に目の前のリアルを五感で満喫中！",
        sliderScores: { Se: 1 },
        choices: [],
        textRules: [],
        pairItems: []
      },
      {
        id: "q_mbti_5",
        text: "誰かが「キモい/嫌い/オェー」などの不満を言ったり「好き/大好き/愛してる」などの愛情表現をした時、あなた自身の内面（FeまたはSe）はどう反応しますか？（文字で自由に入力してください！）",
        type: "text",
        skipEnabled: true,
        sliderMin: 0,
        sliderMax: 100,
        sliderStep: 1,
        sliderLeftLabel: "",
        sliderRightLabel: "",
        sliderScores: {},
        choices: [],
        textRules: [
          {
            id: "tr1",
            keywords: ["好き", "大好き", "愛してる", "嬉しい", "共感"],
            scores: { Fe: 3 },
            isFallback: false
          },
          {
            id: "tr2",
            keywords: ["キモい", "嫌い", "オェー", "うざい", "無理"],
            scores: { Se: 3 },
            isFallback: false
          },
          {
            id: "tr3",
            keywords: [],
            scores: { Ti: 1 },
            isFallback: true
          }
        ],
        pairItems: []
      }
    ],
    gachaItems: [],
    results: [
      {
        id: "r1",
        title: "未来を紡ぐひらめきの賢者 (Niタイプ)",
        description: "あなたの心の中で最も輝いているのは、未来のビジョンや本質を洞察する「Ni」です。周囲が気づかない数年先の可能性や意味に自然とたどり着く、知的なイノベーター気質を持っています。",
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=60",
        conditionAttribute: "Ni",
        conditionScoreMin: 0
      },
      {
        id: "r2",
        title: "真理を突き詰める精密理系脳 (Tiタイプ)",
        description: "あなたの心の中で最も輝いているのは、徹底的な論理追求と自己一貫性を重んじる「Ti」です。複雑な事象を分解して整理し、クリアな「納得」を得るまであきらめないストイックな分析者です。",
        imageUrl: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=60",
        conditionAttribute: "Ti",
        conditionScoreMin: 0
      },
      {
        id: "r3",
        title: "調和と愛を届ける共感の天使 (Feタイプ)",
        description: "あなたの心の中で最も輝いているのは、周囲の人間関係や全体の和を細やかに感じとる「Fe」です。みんなの役に立ちたい、笑顔にしてあげたいという高いEQの持ち主で、グループのバランサーです。",
        imageUrl: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&auto=format&fit=crop&q=60",
        conditionAttribute: "Fe",
        conditionScoreMin: 0
      },
      {
        id: "r4",
        title: "現実を遊び尽くすパワフルチャレンジャー (Seタイプ)",
        description: "あなたの心の中で最も輝いているのは、いまこの瞬間の環境・スリル・現実そのものをパワフルに味わう「Se」です。臨機応変でスピーディ、退屈を嫌い、体感を通じて世界を広げる開拓者です。",
        imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&auto=format&fit=crop&q=60",
        conditionAttribute: "Se",
        conditionScoreMin: 0
      }
    ]
  },
  {
    id: "sample_gacha_bug",
    title: "LSI芋虫(🐛)の虫たたき＆ガチャ工房",
    description: "画面をタップすると『ピコピコシンセ音』が鳴り響く！そして、好きな時に10連ガチャを引いて色んな愉快な芋虫たちを収集できるファンタジーなガチャ＆たたきゲームプラットフォーム！",
    type: "gacha",
    creatorName: "デフォルト",
    isPublic: true,
    themeColorMode: "auto",
    customColor: "#10b981",
    scoringAttributes: ["Score"],
    createdAt: "2020-01-01T00:00:00.000Z",
    gimmicks: {
      enableLsiCaterpillar: true,
      caterpillarQuotes: [
        "私は、みんなのために作成されたLSI芋虫。🐛",
        "30回叩くとポコッて消えちゃうんだ…（優しくしてね！）",
        "ガチャを回せば、ウルトラレアな黄金の私が手に入るかも！？",
        "叩くとスコアになるよ！"
      ],
      caterpillarSquishTarget: 30,
      enableTapBeat: true,
      tapBeatEmojis: ["🐱", "🐸", "🐹", "🐷", "🐛"],
      tapBeatSoundType: "bell",
      enableFreeImageInsertion: true
    },
    questions: [],
    gachaItems: [
      {
        id: "gi_1",
        name: "神話級：黄金に輝くLSIキング芋虫 🐛👑✨",
        imageUrlOrEmoji: "🐛",
        rarity: "UR",
        probability: 3,
        dialogue: "「ふっ…ついに我が目覚めしを引いたか。世界の主観的論理の頂点、それが私だ！」"
      },
      {
        id: "gi_2",
        name: "超越級：哲学するインテリ本虫 🐛📖",
        imageUrlOrEmoji: "🐛",
        rarity: "SSR",
        probability: 12,
        dialogue: "「なぜ私は右から左へ歩き続けるのか…この問いに答えが得られるまでは潰さないでくれたまえ。」"
      },
      {
        id: "gi_3",
        name: "レア：ただのよく跳ねる可愛い青虫 🐛",
        imageUrlOrEmoji: "🐛",
        rarity: "SR",
        probability: 25,
        dialogue: "「ぽよ〜ん！たくさん叩いて、もっとハイスコア目指してね！」"
      },
      {
        id: "gi_4",
        name: "ノーマル：ウマウマ美味しいみずみずしい葉っぱ 🍃",
        imageUrlOrEmoji: "🍃",
        rarity: "N",
        probability: 60,
        dialogue: "「（そよ風に揺れるただの新鮮な葉っぱ。LSI芋虫の好物だ。）」"
      }
    ],
    results: []
  },
  {
    id: "sample_pairing_quiz",
    title: "ゆかいなアニマルペアつなぎ絵文字クイズ！",
    description: "表示された可愛い絵文字と、その下に設定された正しい名前を指やマウスで『線』を引っ張って繋いで回答する極上ギミック。ペアを合わせてみよう！",
    type: "quiz",
    creatorName: "デフォルト",
    isPublic: true,
    themeColorMode: "auto",
    customColor: "#3b82f6",
    scoringAttributes: ["QuizScore"],
    createdAt: "2020-01-01T00:00:00.000Z",
    gimmicks: {
      enableLsiCaterpillar: false,
      caterpillarQuotes: [],
      caterpillarSquishTarget: 30,
      enableTapBeat: false,
      tapBeatEmojis: [],
      tapBeatSoundType: "synth",
      enableFreeImageInsertion: true
    },
    questions: [
      {
        id: "q_pairing_1",
        text: "左側の絵文字にぴったりの、正しい『ペア動物の名前』を線でつないでね！",
        type: "pairing",
        skipEnabled: false,
        sliderMin: 0,
        sliderMax: 100,
        sliderStep: 1,
        sliderLeftLabel: "",
        sliderRightLabel: "",
        sliderScores: {},
        choices: [],
        textRules: [],
        pairItems: [
          { id: "pi_1", leftEmojiOrUrl: "🐶", leftLabel: "", rightEmojiOrUrl: "", rightLabel: "いぬ" },
          { id: "pi_2", leftEmojiOrUrl: "🐱", leftLabel: "", rightEmojiOrUrl: "", rightLabel: "ねこ" },
          { id: "pi_3", leftEmojiOrUrl: "🐛", leftLabel: "", rightEmojiOrUrl: "", rightLabel: "いもむし" },
          { id: "pi_4", leftEmojiOrUrl: "🐸", leftLabel: "", rightEmojiOrUrl: "", rightLabel: "かえる" }
        ]
      }
    ],
    gachaItems: [],
    results: [
      {
        id: "pr_success",
        title: "全問正解！線引き動物アドバイザー 🏆",
        description: "すべてのペアを正確に見抜きました！あなたの直感と繊細なタッチ操作、そして動物たちへの愛は完璧です！",
        imageUrl: "https://images.unsplash.com/photo-1472491235688-bdc81a63246e?w=600&auto=format&fit=crop&q=60",
        conditionAttribute: "correct",
        conditionScoreMin: 1
      },
      {
        id: "pr_fail",
        title: "残念... 😢",
        description: "動物たちも首を傾げています。もう一度チャレンジして、正しいペアを見つけてあげましょう！",
        imageUrl: "🐛",
        conditionAttribute: "correct",
        conditionScoreMin: 0
      }
    ]
  }
];
