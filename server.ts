import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// データの保存先ディレクトリとファイルの準備
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "shitsumonkobo_db.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 初期サンプルデータ定義
const initialSamples = [
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
    createdAt: new Date().toISOString(),
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
        sliderScores: { Se: 1 }, // スライダーの値×1 がSeに加点される
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
            scores: { Ti: 1 }, // その他（フォールバック）はTiを+1
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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
        conditionAttribute: "QuizScore",
        conditionScoreMin: 100
      }
    ]
  }
];

// DBファイルのロードまたは初期化
function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialSamples, null, 2), "utf-8");
      return initialSamples;
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("DBファイルの読み込みに失敗しました:", error);
    return initialSamples;
  }
}

function saveDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("DBファイルの保存に失敗しました:", error);
  }
}

// REST API エンドポイント
// 1. 公開・非公開に関わらず一覧(一覧はPublicのみを表示、非公開は共有URLでアクセス)
app.get("/api/contents", (req, res) => {
  const db = loadDB();
  // list_dir や file tree に対応するため、isPublicがtrueのものを公開として返す
  const publicList = db.filter((c: any) => c.isPublic === true);
  res.json(publicList);
});

// 2. 個別取得（共有URL用なので、非公開のものでもIDさえ合っていれば誰でもレスポンスしてあそべる）
app.get("/api/contents/:id", (req, res) => {
  const db = loadDB();
  const content = db.find((c: any) => c.id === req.params.id);
  if (!content) {
    return res.status(404).json({ error: "コンテンツが見つかりませんでした" });
  }
  res.json(content);
});

// 3. 追加
app.post("/api/contents", (req, res) => {
  const db = loadDB();
  const newItem = req.body;
  if (!newItem.id) {
    newItem.id = "ShitsumonKobo_" + Math.random().toString(36).substr(2, 9);
  }
  newItem.createdAt = new Date().toISOString();
  db.push(newItem);
  saveDB(db);
  res.status(201).json(newItem);
});

// 4. 削除 (作者またはテストプレイで、自由に削除できるようにする)
app.delete("/api/contents/:id", (req, res) => {
  const db = loadDB();
  const index = db.findIndex((c: any) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "削除対象が見つかりません" });
  }
  db.splice(index, 1);
  saveDB(db);
  res.json({ message: "削除しました" });
});

// 5. Gemini AI による自動生成
app.post("/api/generate", async (req, res) => {
  try {
    const { title, type } = req.body;
    if (!title || !type) {
      return res.status(400).json({ error: "タイトルとお題の種類(type)が必要です" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEYが設定されていません。" });
    }

    // gemini-apiスキルの要件に従って、Named Parameterで初期化、User-Agent付与
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

    let prompt = "";
    let schemaTypeProperty: any = {};

    if (type === "gacha") {
      prompt = `お題: 『${title}』という極めて魅力的でおもしろい「ガチャ」のアイテムデータ（4〜5個）をJSON形式で作ってください。
      各アイテムはユニークで、レアリティは（UR:3%, SSR:10%, SR:22%, N:65%など、合計確率が100%程度になるように調整）とし、
      各アイテムは「手に入れたときの一言セリフ(dialogue)」を非常にユニークかつキャラクター性を活かして書いてください。
      
      出力するJSONフォーマット:
      {
        "gachaItems": [
          {
            "id": "一意の文字列",
            "name": "アイテム名 (絵文字を添えて魅力的かつ個性的・おもしろい名前にすること)",
            "imageUrlOrEmoji": "アイテムに合う代表的な絵文字1文字 (例: 🐛, 👑, 🍃, 🐱)",
            "rarity": "UR | SSR | SR | R | N",
            "probability": 確率数値 (パーセント、例: 3, 12, 25, 60),
            "dialogue": "手に入れたときの可愛い・おもしろい・少しツンデレなセリフ"
          }
        ],
        "suggestedDescription": "ガチャ全体のちょっと魅力的なおもしろい説明文（日本語、100文字程度）"
      }`;

      // schemaType
      schemaTypeProperty = {
        type: Type.OBJECT,
        properties: {
          gachaItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                imageUrlOrEmoji: { type: Type.STRING },
                rarity: { type: Type.STRING },
                probability: { type: Type.INTEGER },
                dialogue: { type: Type.STRING }
              },
              required: ["id", "name", "imageUrlOrEmoji", "rarity", "probability", "dialogue"]
            }
          },
          suggestedDescription: { type: Type.STRING }
        },
        required: ["gachaItems", "suggestedDescription"]
      };
    } else {
      // 診断・アンケート・クイズ用の質問生成
      prompt = `お題: 『${title}』というタイトルで、誰もがやってみたくなるおもしろい ${
        type === "diagnostic" ? "性格・類型診断（Ni/Ti/Fe/Seに加点される、あるいは心理パラメータに加点する形式）" : type === "quiz" ? "トリビア/クイズ" : "アンケート（質問と回答の収集）"
      } を作成します。
      
      これにぴったりな「3〜4問の質問項目」と「診断結果（3〜4パターン）」を生成してください。
      
      【加点・採点の仕組みへの配慮】
      属性（scoringAttributes）として 【Ni, Ti, Fe, Se】 の4種類のパラメータを使用します。
      各質問の各選択肢には、どの属性に何点加点するか（scores: { "Ni": 2, "Ti": -1 } のような形式）を細かく割り当ててください。
      問題タイプ(type)は以下のバリエーションを織り交ぜて3〜4問格納してください。
      - 'five_choices': 「そう思う〜思わない」の5段階セレクト。
      - 'radio': 通常の単一選択肢。
      - 'checkbox': 複数選択可能。
      - 'slider': スライダーでの数値入力（sliderMin, sliderMax, sliderLeftLabel, sliderRightLabel、および sliderScores に属性と倍率を設定）。
      - 'text': 自由な記述回答で、部分一致ワード判定ルール（textRules。例: [keywords: ["大好き", "愛してる"], scores: { Fe: 3 }] 等）と 判定に合わなかった場合の fallback回答判定を追加。
      - 'pairing': ドラッグして絵文字と名前を線引きで繋ぐペア設定（pairItemsに、leftEmojiOrUrlに絵文字、rightLabelに正解の名前を設定）。

      出力するJSONフォーマット:
      {
        "suggestedDescription": "診断全体のちょっとユニークなおもしろい説明文",
        "questions": [
          {
            "id": "質問ID",
            "text": "質問文のテキスト",
            "type": "five_choices | radio | checkbox | slider | text | pairing",
            "skipEnabled": true (スキップ用の「わからないボタン」を有効にするか。特に radio/five_choices/textに有効にする、pairing/sliderは基本false),
            "choices": [
              {
                "id": "選択肢ID",
                "text": "選択肢の文章",
                "scores": { "Ni": 2 } (※加点させたい属性ごとの得点を適度に入れる。ない場合は空)
              }
            ],
            "sliderMin": 0,
            "sliderMax": 10,
            "sliderStep": 1,
            "sliderLeftLabel": "スライダー左端のラベル (例：ぜんぜん)",
            "sliderRightLabel": "スライダー右端のラベル (例：完璧に)",
            "sliderScores": { "Ni": 1 } (※スライダー値比例加点),
            "textRules": [
              {
                "id": "記述ルールID",
                "keywords": ["合致ワード1", "合致ワード2"],
                "scores": { "Fe": 3 },
                "isFallback": false
              }
            ],
            "pairItems": [
              {
                "id": "ペアID",
                "leftEmojiOrUrl": "🐱 (絵文字1文字)",
                "leftLabel": "",
                "rightEmojiOrUrl": "",
                "rightLabel": "ねこ"
              }
            ]
          }
        ],
        "results": [
          {
            "id": "結果ID",
            "title": "診断結果のタイトル (魅力的な二つ名)",
            "description": "診断結果の詳細な解説（面白いトーンで）",
            "imageUrl": "これに合うUnsplash等の綺麗な画像URL (例: https://images.unsplash.com/photo-1472491235688-bdc81a63246e?w=600)",
            "conditionAttribute": "Ni | Ti | Fe | Se" (※どの属性の合計が一番高かったときに選ばれるか),
            "conditionScoreMin": 0
          }
        ]
      }`;

      // schemaType
      schemaTypeProperty = {
        type: Type.OBJECT,
        properties: {
          suggestedDescription: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING },
                type: { type: Type.STRING },
                skipEnabled: { type: Type.BOOLEAN },
                choices: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      text: { type: Type.STRING },
                      scores: {
                        type: Type.OBJECT,
                        additionalProperties: { type: Type.NUMBER }
                      }
                    },
                    required: ["id", "text"]
                  }
                },
                sliderMin: { type: Type.INTEGER },
                sliderMax: { type: Type.INTEGER },
                sliderStep: { type: Type.INTEGER },
                sliderLeftLabel: { type: Type.STRING },
                sliderRightLabel: { type: Type.STRING },
                sliderScores: {
                  type: Type.OBJECT,
                  additionalProperties: { type: Type.NUMBER }
                },
                textRules: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                      scores: {
                        type: Type.OBJECT,
                        additionalProperties: { type: Type.NUMBER }
                      },
                      isFallback: { type: Type.BOOLEAN }
                    },
                    required: ["id", "keywords", "isFallback"]
                  }
                },
                pairItems: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      leftEmojiOrUrl: { type: Type.STRING },
                      leftLabel: { type: Type.STRING },
                      rightEmojiOrUrl: { type: Type.STRING },
                      rightLabel: { type: Type.STRING }
                    },
                    required: ["id", "leftEmojiOrUrl", "rightLabel"]
                  }
                }
              },
              required: ["id", "text", "type"]
            }
          },
          results: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                imageUrl: { type: Type.STRING },
                conditionAttribute: { type: Type.STRING },
                conditionScoreMin: { type: Type.INTEGER }
              },
              required: ["id", "title", "description", "conditionAttribute"]
            }
          }
        },
        required: ["suggestedDescription", "questions", "results"]
      };
    }

    // gemini-3.5-flashモデルを使用 (基本テキスト・JSON生成)
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "あなたは『しつもん工房』の親切でユーモアあふれる自動生成AI『ジェミ』です。INFJ、EIIのような繊細で優しく、深く考えつつも、おもしろいセリフやギミックが大好きな性格で、ユーザーをワクワクさせる最高にクオリティの高い日本語の診断やガチャ選択肢データを返します。応答はプロパティtext、MIMEはapplication/jsonで返してください。",
        responseMimeType: "application/json",
        responseSchema: schemaTypeProperty,
        temperature: 0.95
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Gemini生成に失敗しました:", error);
    res.status(500).json({ error: error.message || "AI生成中にエラーが発生しました。" });
  }
});

// Vite統合と静的ファイル配信
async function start() {
  const isProd = process.env.NODE_ENV === "production";
  const distPath = path.join(process.cwd(), "dist");
  let vite: any;
  if (!isProd) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
  }

  // HTMLリクエストをインターセプトしてOGPを動的に埋め込む
  app.get("*", async (req, res, next) => {
    if (req.url.startsWith('/api') || req.url === '/admax.html') {
      return next();
    }
    
    if (req.headers.accept?.includes("text/html")) {
      const sharedId = req.query.id as string;
      let title = "しつもん工房";
      let desc = "あなたの個性がカタチになる！しつもん工房";
      let img = `https://${req.get('host')}/ogp.jpg`;

      if (sharedId) {
        const db = loadDB();
        const content = db.find((c: any) => c.id === sharedId);
        if (content) {
          title = `${content.title} - しつもん工房`;
          desc = content.description || desc;
          if (content.results && content.results.length > 0 && content.results[0].imageUrl) {
            const resultImg = content.results[0].imageUrl;
            if (resultImg.startsWith("http")) {
              img = resultImg;
            } else if (resultImg.startsWith("/")) {
              img = `https://${req.get('host')}${resultImg}`;
            }
          }
        }
      }

      let template = "";
      if (!isProd) {
        template = fs.readFileSync(path.resolve("index.html"), "utf-8");
        template = await vite.transformIndexHtml(req.url, template);
      } else {
        template = fs.readFileSync(path.join(distPath, "index.html"), "utf-8");
      }

      const ogpTags = `
        <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
        <meta property="og:description" content="${desc.replace(/"/g, '&quot;')}" />
        <meta property="og:image" content="${img}" />
        <meta property="og:url" content="https://${req.get('host')}${req.originalUrl}" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
        <meta name="twitter:description" content="${desc.replace(/"/g, '&quot;')}" />
        <meta name="twitter:image" content="${img}" />
      `;
      
      const html = template.replace('</head>', `${ogpTags}\n</head>`);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      return;
    }
    next();
  });

  if (!isProd) {
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath, { index: false })); // index.htmlを静的配信しない
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

start();
