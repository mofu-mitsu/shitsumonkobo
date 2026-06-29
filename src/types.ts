/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// テーブル競合や連携に備えて、命名を「ShitsumonKobo_」で統一しています。
export interface ShitsumonKobo_Choice {
  id: string;
  text: string;
  scores: Record<string, number>; // { Ni: 3, Ti: 1 } のような加点設定
}

export interface ShitsumonKobo_TextRule {
  id: string;
  keywords: string[]; // 例: ["好き", "大好き", "愛してる"]
  scores: Record<string, number>; // 該当したときの加点
  isFallback: boolean; // フォールバック回答として扱うか
}

export interface ShitsumonKobo_PairItem {
  id: string;
  leftEmojiOrUrl: string; // 左側の絵文字または画像
  leftLabel: string;      // 左の名前
  rightEmojiOrUrl: string; // 正解となる右側の絵文字または画像
  rightLabel: string;     // 右側の名前
}

export type ShitsumonKobo_QuestionType =
  | 'five_choices'       // そう思う・思わないの5択
  | 'radio'              // 単一選択（ラジオボタン）
  | 'checkbox'           // 複数選択（チェックボックス）
  | 'dropdown'           // プルダウン（セレクト）
  | 'slider'             // スライダー
  | 'text'               // 記述質問（判定ルール付き）
  | 'pairing';           // ペア線つなぎ

export interface ShitsumonKobo_Choice {
  id: string;
  text: string;
  scores: Record<string, number>; // { Ni: 3, Ti: 1 } のような加点設定
  isCorrect?: boolean; // クイズ用の正解フラグ
}

export interface ShitsumonKobo_TextRule {
  id: string;
  keywords: string[]; // 例: ["好き", "大好き", "愛してる"]
  scores: Record<string, number>; // 該当したときの加点
  isFallback: boolean; // フォールバック回答として扱うか
  isCorrect?: boolean; // クイズ用の正解フラグ
}

export interface ShitsumonKobo_PairItem {
  id: string;
  leftEmojiOrUrl: string; // 左側の絵文字または画像
  leftLabel: string;      // 左の名前
  rightEmojiOrUrl: string; // 正解となる右側の絵文字または画像
  rightLabel: string;     // 右側の名前
}

export interface ShitsumonKobo_Question {
  id: string;
  text: string;
  type: ShitsumonKobo_QuestionType;
  choices: ShitsumonKobo_Choice[];
  skipEnabled: boolean;  // わからないボタン（質問スキップ）
  sliderMin: number;
  sliderMax: number;
  sliderStep: number;
  sliderLeftLabel: string; // スライダーの左側ラベル (そう思わない など)
  sliderRightLabel: string; // スライダーの右側ラベル (そう思う など)
  sliderScores: Record<string, number>; // スライダーの値に比例して乗算される属性加点設定
  textRules: ShitsumonKobo_TextRule[];
  pairItems: ShitsumonKobo_PairItem[];
  imageUrlOrEmoji?: string; // 質問と一緒に表示する画像や絵文字
  correctFeedback?: string; // クイズで正解時のコメント
  incorrectFeedback?: string; // クイズで不正解時のコメント
}

export type ShitsumonKobo_ResultConditionType = 'threshold' | 'expression' | 'attribute_order' | 'attribute_sum' | 'max_expression';

export interface ShitsumonKobo_ResultOption {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  conditionAttribute: string; // この属性が一番高いとき or 閾値を満たした時
  conditionScoreMin: number;
  conditionScoreMax?: number; // 特定スコア範囲（クイズの正解数などに対応するため）
  advancedCondition?: string;
  conditionType?: ShitsumonKobo_ResultConditionType;
  conditionOrder?: string[];
  conditionSumAttributes?: string[];
}

export interface ShitsumonKobo_GachaItem {
  id: string;
  name: string;
  imageUrlOrEmoji: string;
  rarity: 'UR' | 'SSR' | 'SR' | 'R' | 'N';
  probability: number; // 排出確率 (%)
  dialogue?: string;   // 排出時のセリフ
}

export interface ShitsumonKobo_GimmickConfig {
  
  enableLsiCaterpillar: boolean; // マスコットギミックをオンにするか
  lsiMascotImageOrEmoji?: string; // デフォルトは🐛、カスタマイズ可能

  // 新規追加ギミック
  enableAchievements?: boolean; // 実績機能
  achievements?: { id: string; conditionAttribute: string; conditionScoreMin: number; title: string }[];
  
  enableRandomEvent?: boolean; // ランダムイベント（猫が現れるなど）
  randomEventEmojiOrImage?: string; 
  randomEventText?: string;
  
  secretNpcEvent?: { questionIndex: number; npcCameoText: string; npcEmoji: string }[]; // Q数経過で乱入するNPC
  
  secretMessage?: string; // 最後に手紙が届くギミック
  enableSecretLetter?: boolean; // 手紙ギミック
  secretLetterText?: string;
  secretLetterAttributeMultiplier?: Record<string, number>; // 手紙を開いたときに加算されるポイント

  caterpillarQuotes: string[];  // 芋虫がタップされたときに吐き出すセリフ
  caterpillarSquishTarget: number; // 何回タップで潰せるか (デフォルト30)
  caterpillarEmoji?: string;    // カスタマイズされた芋虫の絵文字
  caterpillarName?: string;     // カスタマイズされた芋虫の名前
  caterpillarAttributeMultiplier?: Record<string, number>; // タップ/撃破時に加算される属性スコア
  
  enableTapBeat: boolean;       // 絵文字や画像を叩くとスコアが上がる
  tapBeatEmojis: string[];      // 降ってくる/画面に固定されるタップ対象
  tapBeatSoundType: 'bell' | 'synth' | 'bloop' | 'kick'; // 効果音の種類
  tapBeatAttributeMultiplier?: Record<string, number>; // タップごとに加算される属性スコア（例: Se に 1 ずつ）
  tapBeatGachaPoints?: number;  // ガチャモードの時に加算されるガチャポイント
  
  enableReactionEffect?: boolean; // 選択肢押下時のリアクション（🎉💥など）
  weatherEffect?: 'none' | 'rain' | 'snow' | 'petals' | 'leaves' | 'stars'; // 背景イベント（CSSアニメで降らせる）
  timeOfDayEffect?: boolean; // カレンダー進行のように朝→昼→夕方→夜と背景色を変える
  
  enableFreeImageInsertion: boolean; // 自由な画像挿入
}

export type ShitsumonKobo_ContentType = 'diagnostic' | 'quiz' | 'survey' | 'gacha';

export interface ShitsumonKobo_Content {
  id: string;
  title: string;
  description: string;
  type: ShitsumonKobo_ContentType;
  quizMode?: 'instant' | 'summary'; // クイズモード：即時判定か、最後にまとめて結果か
  surveyShowStats?: boolean; // アンケートモードで終了時に投票率を表示するか
  creatorName: string;
  creatorId?: string; // ログインユーザーのID
  creatorXHandle?: string; // Xのハンドルネーム
  isPublic: boolean;
  themeColorMode: 'auto' | 'custom';
  customColor: string; // 1600万色から自由に設定できるHEXカラー
  questions: ShitsumonKobo_Question[];
  gachaItems: ShitsumonKobo_GachaItem[];
  scoringAttributes: string[]; // ['Ni', 'Ti', 'Fe', 'Se'] などの属性リスト
  results: ShitsumonKobo_ResultOption[];
  gimmicks: ShitsumonKobo_GimmickConfig;
  createdAt: string;
  randomizeQuestions?: boolean;    // 質問順をランダムにするか
  limitQuestionsCount?: number;   // 出題質問数を制限（0 or undefinedなら全問）
  quizImmediateFeedback?: boolean; // クイズでその場で正誤を出すかどうか
  enableGachaScorePayment?: boolean; // たたきゲームの得点でガチャを回せるようにするか
}
