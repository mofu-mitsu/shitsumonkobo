import React, { useState } from "react";
import { 
  ShitsumonKobo_Content, 
  ShitsumonKobo_Question, 
  ShitsumonKobo_Choice, 
  ShitsumonKobo_TextRule, 
  ShitsumonKobo_PairItem, 
  ShitsumonKobo_GachaItem, 
  ShitsumonKobo_ResultOption,
  ShitsumonKobo_ContentType,
  ShitsumonKobo_QuestionType
} from "../types";
import { playSound } from "./SoundEngine";
import { AnimatePresence, motion } from "motion/react";
import ContentPlayer from "./ContentPlayer";
import { User } from "firebase/auth";
import { Settings, Save, Play, Share2, Plus, Download, Upload, Eye, Edit2, Trash2, Globe, Heart, Compass, Pocket, ArrowRight, Palette, Ticket, Milestone, Sparkles, Layers, ListTodo, Sliders, X } from 'lucide-react';



const parseSimpleAttributes = (str: string): Record<string, number> => {
  if (!str) return {};
  if (str.trim().startsWith('{')) {
    try { return JSON.parse(str); } catch(e) { return {}; }
  }
  const parts = str.trim().split(/[\s,]+/);
  const res: Record<string, number> = {};
  for(let i=0; i<parts.length; i+=2) {
    if(parts[i] && parts[i+1] && !isNaN(Number(parts[i+1]))) {
      res[parts[i]] = Number(parts[i+1]);
    }
  }
  return res;
};

const stringifySimpleAttributes = (obj: Record<string, number> | undefined): string => {
  if (!obj) return "";
  return Object.entries(obj).map(([k, v]) => `${k} ${v}`).join(" ");
};


interface ContentCreatorProps {
  currentUser?: User | null;
  season?: { name: string; accentColor: string; bgGradient: string; icon: string };
  onSave: (content: ShitsumonKobo_Content) => void;
  onCancel: () => void;
  initialContent?: ShitsumonKobo_Content | null;
  showAlert?: (title: string, message: string, type?: 'alert'|'error', icon?: React.ReactNode) => void;
}

export default function ContentCreator({ season, onSave, onCancel, initialContent, currentUser, showAlert }: ContentCreatorProps) {
  // テーマ色の決定
  const [content, setContent] = useState<ShitsumonKobo_Content>(() => {
    if (initialContent) return { ...initialContent };
    return {
      id: "ShitsumonKobo_" + Math.random().toString(36).substring(2, 9),
      title: "",
      description: "",
      type: "diagnostic",
      creatorName: "",
      isPublic: false,
      themeColorMode: "auto",
      customColor: "#3b82f6",
      scoringAttributes: ["Ni", "Ti", "Fe", "Se"],
      questions: [],
      gachaItems: [],
      results: [],
      gimmicks: {
        enableLsiCaterpillar: true,
        caterpillarQuotes: [
          "感覚と主観的論理の塊なのだ…🐛",
          "そんなにタップしないで、潰れちゃうから…",
          "ここをタップするとセリフを吐き出すよ！",
          "何回も叩かれたら、潰れちゃうかも…！？"
        ],
        caterpillarSquishTarget: 30,
        enableTapBeat: false,
        tapBeatEmojis: ["🐱", "🐸", "🐹", "🐷"],
        tapBeatSoundType: "synth",
        enableFreeImageInsertion: true
      },
      createdAt: new Date().toISOString()
    };
  });

  // 決定されたテーマカラー
  const activeColor = content.themeColorMode === 'custom' ? content.customColor : (season?.accentColor || "#3b82f6");

  // UI管理状態
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newAttributeText, setNewAttributeText] = useState("");
  const [activeTab, setActiveTab] = useState<'meta' | 'questions' | 'gacha' | 'results' | 'gimmicks'>('meta');

  // AI自動生成 APIの呼び出し
  const handleAIGenerate = async () => {
    if (!content.title.trim()) {
      if (showAlert) {
        showAlert("タイトルが必要です", "AIに作成してもらうには、まず「タイトル（お題）」を何でも入力してください！\n例: 『私のねこ度診断』『INTJなテストクイズ』", "alert");
      } else {
        alert("AIに作成してもらうには、まず「タイトル（お題）」を何でも入力してください！\n例: 『私のねこ度診断』『INTJなテストクイズ』");
      }
      return;
    }
    
    setIsGenerating(true);
    playSound("synth");
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: content.title,
          type: content.type
        })
      });
      
      if (!response.ok) {
        throw new Error("AI生成サーバーが応答しなかったか、APIキーが設定されていない可能性があります。");
      }
      
      const payload = await response.json();
      playSound("bell");

      setContent(prev => ({
        ...prev,
        description: payload.suggestedDescription || prev.description,
        questions: payload.questions || [],
        results: payload.results || [],
        gachaItems: payload.gachaItems || [],
      }));
      
      // 生成終了後、自動的に次のタブにナビゲート
      if (content.type === "gacha") {
        setActiveTab("gacha");
      } else {
        setActiveTab("questions");
      }
      
    } catch (error: any) {
      console.error(error);
      if (showAlert) {
        showAlert("生成エラー", `ジェミAI生成エラー: ${error.message || "作成に失敗しました。"}\n※ローカルでのノーコード手動作成は、このまま引き続き行えます！`, "error");
      } else {
        alert(`ジェミAI生成エラー: ${error.message || "作成に失敗しました。"}\n※ローカルでのノーコード手動作成は、このまま引き続き行えます！`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // 属性値の追加
  const addAttribute = () => {
    const trimmed = newAttributeText.trim();
    if (trimmed && !content.scoringAttributes.includes(trimmed)) {
      setContent(prev => ({
        ...prev,
        scoringAttributes: [...prev.scoringAttributes, trimmed]
      }));
      setNewAttributeText("");
      playSound("synth");
    }
  };

  // 属性値の削除
  const removeAttribute = (attr: string) => {
    setContent(prev => ({
      ...prev,
      scoringAttributes: prev.scoringAttributes.filter(a => a !== attr)
    }));
    playSound("bloop");
  };

  // 質問の追加
  const addQuestion = (qType: ShitsumonKobo_QuestionType) => {
    const defaultChoices = 
      qType === 'pairing' ? [] :
      qType === 'five_choices' ? [
        { id: "c_1_" + Math.random().toString(36).substring(2, 9), text: "強くそう思う", scores: {} },
        { id: "c_2_" + Math.random().toString(36).substring(2, 9), text: "少しそう思う", scores: {} },
        { id: "c_3_" + Math.random().toString(36).substring(2, 9), text: "どちらとも言えない", scores: {} },
        { id: "c_4_" + Math.random().toString(36).substring(2, 9), text: "あまりそう思わない", scores: {} },
        { id: "c_5_" + Math.random().toString(36).substring(2, 9), text: "全くそう思わない", scores: {} }
      ] : [
        { id: "c_" + Math.random().toString(36).substring(2, 9), text: "選択肢1", scores: {} },
        { id: "c_" + Math.random().toString(36).substring(2, 9), text: "選択肢2", scores: {} }
      ];

    const newQ: ShitsumonKobo_Question = {
      id: "q_" + Math.random().toString(36).substring(2, 9),
      text: qType === 'five_choices' ? "（ここに質問テキストを入力してね）" : `新質問 (${qType === 'pairing' ? '線つなぎペア' : '通常質問'})`,
      type: qType,
      skipEnabled: qType === 'five_choices' || qType === 'radio' || qType === 'text' || qType === 'dropdown',
      sliderMin: 0,
      sliderMax: 10,
      sliderStep: 1,
      sliderLeftLabel: "思わない",
      sliderRightLabel: "そう思う",
      sliderLeftAttribute: "",
      sliderLeftMaxScore: 5,
      sliderRightAttribute: "",
      sliderRightMaxScore: 5,
      sliderScores: {},
      choices: defaultChoices,
      textRules: qType === 'text' ? [
        { id: "tr_" + Math.random().toString(36).substring(2, 9), keywords: ["大好き", "嬉しい"], scores: {}, isFallback: false },
        { id: "tr_" + Math.random().toString(36).substring(2, 9), keywords: [], scores: {}, isFallback: true }
      ] : [],
      pairItems: qType === 'pairing' ? [
        { id: "pi_1_" + Math.random().toString(36).substring(2, 9), leftEmojiOrUrl: "🐶", leftLabel: "", rightEmojiOrUrl: "", rightLabel: "いぬ" },
        { id: "pi_2_" + Math.random().toString(36).substring(2, 9), leftEmojiOrUrl: "🐱", leftLabel: "", rightEmojiOrUrl: "", rightLabel: "ねこ" }
      ] : []
    };

    setContent(prev => ({
      ...prev,
      questions: [...prev.questions, newQ]
    }));
    playSound("synth");
  };

  // 質問の更新
  
  const handleImageUpload = (e: any, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result && typeof ev.target.result === 'string') {
        callback(ev.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const updateQuestion = (qId: string, updatedFields: Partial<ShitsumonKobo_Question>) => {
    setContent(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === qId ? { ...q, ...updatedFields } : q)
    }));
  };

  // 選択肢の追加
  const addChoice = (qId: string) => {
    const newChoice: ShitsumonKobo_Choice = {
      id: "c_" + Math.random().toString(36).substring(2, 9),
      text: "新規選択肢",
      scores: {}
    };
    setContent(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === qId) {
          return { ...q, choices: [...q.choices, newChoice] };
        }
        return q;
      })
    }));
    playSound("synth");
  };

  // 選択肢の更新
  const updateChoice = (qId: string, choiceId: string, text: string, scores: Record<string, number>, isCorrect?: boolean) => {
    setContent(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === qId) {
          return {
            ...q,
            choices: q.choices.map(c => c.id === choiceId ? { ...c, text, scores, isCorrect: isCorrect !== undefined ? isCorrect : c.isCorrect } : c)
          };
        }
        return q;
      })
    }));
  };

  // 選択肢の削除
  const removeChoice = (qId: string, choiceId: string) => {
    setContent(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === qId) {
          return { ...q, choices: q.choices.filter(c => c.id !== choiceId) };
        }
        return q;
      })
    }));
    playSound("bloop");
  };

  // 記述式テキスト判定ルールの追加
  const addTextRule = (qId: string, isFallback = false) => {
    const newRule: ShitsumonKobo_TextRule = {
      id: "tr_" + Math.random().toString(36).substring(2, 9),
      keywords: isFallback ? [] : ["判定語"],
      scores: {},
      isFallback
    };
    setContent(prev => {
      return {
        ...prev,
        questions: prev.questions.map(q => {
          if (q.id === qId) {
            const tempRules = [...q.textRules];
            const fallbackIdx = tempRules.findIndex(r => r.isFallback);
            if (fallbackIdx !== -1 && !isFallback) {
              // フォールバックルールが見つかれば、その直前に挿入する
              tempRules.splice(fallbackIdx, 0, newRule);
            } else {
              tempRules.push(newRule);
            }
            return {
              ...q,
              textRules: tempRules
            };
          }
          return q;
        })
      };
    });
    playSound("synth");
  };

  // 線つなぎペア項目の追加
  const addPairItem = (qId: string) => {
    const newItem: ShitsumonKobo_PairItem = {
      id: "pi_" + Math.random().toString(36).substring(2, 9),
      leftEmojiOrUrl: "✨",
      leftLabel: "",
      rightEmojiOrUrl: "",
      rightLabel: "正解の名前"
    };
    setContent(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === qId) {
          return { ...q, pairItems: [...q.pairItems, newItem] };
        }
        return q;
      })
    }));
    playSound("synth");
  };

  // ガチャ項目の追加
  const addGachaItem = () => {
    const newItem: ShitsumonKobo_GachaItem = {
      id: "gi_" + Math.random().toString(36).substring(2, 9),
      name: "新ガチャアイテム 🎁",
      imageUrlOrEmoji: "🎁",
      rarity: "SSR",
      probability: 10,
      dialogue: "「あなたが私を引き当ててくれたのですね！」"
    };
    setContent(prev => ({
      ...prev,
      gachaItems: [...prev.gachaItems, newItem]
    }));
    playSound("synth");
  };

  // 診断結果パターンの追加
  const addResultOption = () => {
    const newResult: ShitsumonKobo_ResultOption = {
      id: "r_" + Math.random().toString(36).substring(2, 9),
      title: "診断結果の仮の名前",
      description: "結果の詳しい説明文をここに入力してください。",
      conditionAttribute: content.type === 'quiz' ? 'correct' : (content.scoringAttributes[0] || 'A'),
      conditionScoreMin: 1,
      conditionType: content.type === 'quiz' ? 'threshold' : 'max_expression',
      imageUrl: "✨",
      isFallback: false
    };
    setContent(prev => ({
      ...prev,
      results: [...prev.results, newResult]
    }));
    playSound("synth");
  };

  // 保存処理
  const handleSave = async () => {
    if (!content.title.trim()) {
      if (showAlert) {
        showAlert("入力エラー", "しつもんのタイトルを入力してください！", "error");
      } else {
        alert("しつもんのタイトルを入力してください！");
      }
      return;
    }

    if (content.type !== 'gacha') {
      if (content.questions.length === 0) {
        if (showAlert) {
          showAlert("入力エラー", "質問を1つ以上追加してください！", "error");
        } else {
          alert("質問を1つ以上追加してください！");
        }
        return;
      }
    }

    setIsSaving(true);
    playSound("bell");
    try {
      await onSave(content);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl max-w-4xl mx-auto flex flex-col h-[750px]">
      {/* ヘッダー */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 flex-wrap select-none">
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold border border-slate-200 px-2.5 py-0.5 rounded-full">
              🛠️ しつもん工房 制作室
            </span>
            <span 
              className="text-[10px] font-bold border px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs"
              style={{ 
                color: activeColor, 
                borderColor: activeColor + "30", 
                backgroundColor: activeColor + "10" 
              }}
            >
              <span>{season?.icon || "❄️"}</span>
              <span>{content.themeColorMode === 'custom' ? 'カスタムカラー調色中' : `${season?.name || "冬"}デザイン適応中`}</span>
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-800 mt-1.5 font-sans">
            {initialContent ? "作った診断を編集する" : "新しい診断・クイズ・ガチャを作る"}
          </h2>
        </div>
        <div className="flex gap-2">
          <button 
            disabled={isSaving}
            onClick={onCancel}
            className="text-xs bg-white hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-xl border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            閉じる
          </button>
          
          <button 
            type="button"
            onClick={() => { setIsPreviewMode(true); playSound("synth"); }}
            className="text-xs bg-sky-100 hover:bg-sky-200 text-sky-700 font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer mr-2"
          >
            <Play size={14} /> プレビュー
          </button>
          <button 
            disabled={isSaving}
            onClick={handleSave}
            className="text-xs text-white font-bold px-5 py-2 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            style={{ backgroundColor: activeColor }}
          >
            {isSaving ? (
              <span className="flex items-center gap-1">
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                公開保存中...
              </span>
            ) : (
              <>
                <Save size={14} /> 保存して公開する
              </>
            )}
          </button>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-slate-50 px-4 py-1.5 flex gap-1.5 border-b border-slate-200 overflow-x-auto flex-shrink-0">
        <button 
          onClick={() => { setActiveTab('meta'); playSound("synth"); }}
          className={`flex items-center gap-1 text-xs px-3.5 py-2.5 rounded-t-xl font-bold transition-all whitespace-nowrap cursor-pointer border-b-2 ${
            activeTab === 'meta' 
              ? 'bg-white text-slate-850 shadow-sm border-t' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 border-b-transparent'
          }`}
          style={activeTab === 'meta' ? { borderBottomColor: activeColor, borderTopColor: activeColor + "30" } : {}}
        >
          <Layers size={13} style={{ color: activeColor }} /> 1. 基本設定
        </button>

        {content.type !== 'gacha' && (
          <button 
            onClick={() => { setActiveTab('questions'); playSound("synth"); }}
            className={`flex items-center gap-1 text-xs px-3.5 py-2.5 rounded-t-xl font-bold transition-all whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'questions' 
                ? 'bg-white text-slate-850 shadow-sm border-t' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 border-b-transparent'
            }`}
            style={activeTab === 'questions' ? { borderBottomColor: activeColor, borderTopColor: activeColor + "30" } : {}}
          >
            <ListTodo size={13} style={{ color: activeColor }} /> 2. 質問の編集
          </button>
        )}

        {content.type === 'gacha' && (
          <button 
            onClick={() => { setActiveTab('gacha'); playSound("synth"); }}
            className={`flex items-center gap-1 text-xs px-3.5 py-2.5 rounded-t-xl font-bold transition-all whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'gacha' 
                ? 'bg-white text-slate-850 shadow-sm border-t' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 border-b-transparent'
            }`}
            style={activeTab === 'gacha' ? { borderBottomColor: activeColor, borderTopColor: activeColor + "30" } : {}}
          >
            <Sparkles size={13} style={{ color: activeColor }} /> 2. ガチャ景品
          </button>
        )}

        {(content.type === 'diagnostic' || content.type === 'quiz' || content.type === 'survey') && (
          <button 
            onClick={() => { setActiveTab('results'); playSound("synth"); }}
            className={`flex items-center gap-1 text-xs px-3.5 py-2.5 rounded-t-xl font-bold transition-all whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'results' 
                ? 'bg-white text-slate-850 shadow-sm border-t' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 border-b-transparent'
            }`}
            style={activeTab === 'results' ? { borderBottomColor: activeColor, borderTopColor: activeColor + "30" } : {}}
          >
            <Sliders size={13} style={{ color: activeColor }} /> 3. {content.type === 'survey' ? '終了画面' : '結果バリエーション'}
          </button>
        )}

        <button 
          onClick={() => { setActiveTab('gimmicks'); playSound("synth"); }}
          className={`flex items-center gap-1 text-xs px-3.5 py-2.5 rounded-t-xl font-bold transition-all whitespace-nowrap cursor-pointer border-b-2 ${
            activeTab === 'gimmicks' 
              ? 'bg-white text-slate-850 shadow-sm border-t' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 border-b-transparent'
          }`}
          style={activeTab === 'gimmicks' ? { borderBottomColor: activeColor, borderTopColor: activeColor + "30" } : {}}
        >
          🎮 ギミック
        </button>
      </div>

      {/* スクロール可能なメインエディタ */}
      <div className="flex-1 overflow-y-auto p-6 bg-white border-b border-sky-100 text-slate-800 font-sans">
        
        {/* 未ログイン時の警告とログインボタン */}
        {!currentUser && (
          <div className="mb-6 bg-rose-50 border border-rose-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in">
            <div className="flex items-start gap-2">
              <span className="text-xl">💡</span>
              <div className="text-xs text-rose-800 leading-relaxed">
                <p className="font-bold text-sm mb-0.5">現在、ゲスト(匿名)として作成中です。</p>
                <p>
                  このまま公開できますが、ブラウザの履歴を消すと<strong>後で編集できなくなります</strong>。<br className="hidden sm:block" />
                  Googleでログインすると、いつでも自分の作品を編集したり、みんなの回答データ(ログ)を見ることができます！
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  const { loginWithGoogle } = await import("../lib/firebase");
                  await loginWithGoogle();
                } catch (e: any) {
                  if (e?.code === 'auth/operation-not-allowed') {
                    if (showAlert) {
                      showAlert('設定エラー', 'FirebaseコンソールのAuthentication設定で、Googleプロバイダを有効にしてください。', 'error');
                    } else {
                      alert('FirebaseコンソールのAuthentication設定で、Googleプロバイダを有効にしてください。');
                    }
                  } else {
                    console.log("Login popup closed or failed:", e);
                  }
                }
              }}
              className="whitespace-nowrap flex-shrink-0 bg-white hover:bg-slate-50 border border-rose-200 text-rose-600 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
              Googleでログインして作成
            </button>
          </div>
        )}

        {/* =============== タブ1: 基本設定 =============== */}
        {activeTab === 'meta' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🏺 しつもんのタイトル・お題（必須）</label>
                  <input
                    type="text"
                    placeholder="例: あなたの認知心理性格診断、たたきゲーム"
                    value={content.title}
                    onChange={(e) => setContent({ ...content, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🛡️ タイプ</label>
                  <select
                    value={content.type}
                    onChange={(e) => {
                      const newType = e.target.value as ShitsumonKobo_ContentType;
                      setContent({ ...content, type: newType, questions: [], gachaItems: [], results: [] });
                      playSound("synth");
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-400 cursor-pointer"
                  >
                    <option value="diagnostic">🔮 心理テスト・性格診断</option>
                    <option value="quiz">🎯 クイズ・問答ゲーム</option>
                    <option value="survey">📊 汎用アンケート</option>
                    <option value="gacha">🎁 おもしろガチャ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">✍️ 作者の名前 (匿名でもOK)</label>
                  <input
                    type="text"
                    placeholder="匿名希望"
                    value={content.creatorName}
                    onChange={(e) => setContent({ ...content, creatorName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📝 説明文</label>
                  <textarea
                    rows={3}
                    placeholder="このしつもんで遊ぶ人向けの説明を入力してね！"
                    value={content.description}
                    onChange={(e) => setContent({ ...content, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 h-[100px] resize-none transition-colors"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">🍂 カラー着色モード</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setContent({ ...content, themeColorMode: "auto" })}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          content.themeColorMode === "auto" 
                            ? "bg-slate-100 text-slate-800 border-sky-400" 
                            : "bg-white text-slate-550 border-slate-200"
                        }`}
                      >
                        🌥️ Auto (季節自動)
                      </button>
                      <button
                        onClick={() => setContent({ ...content, themeColorMode: "custom" })}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          content.themeColorMode === "custom" 
                            ? "bg-slate-100 text-slate-800 border-sky-400" 
                            : "bg-white text-slate-550 border-slate-200"
                        }`}
                      >
                        🎨 1600万色カスタム
                      </button>
                    </div>
                  </div>

                  {content.themeColorMode === "custom" && (
                    <div className="w-24">
                      <label className="block text-xs font-bold text-slate-700 mb-1">カスタムカラー</label>
                      <input
                        type="color"
                        value={content.customColor}
                        onChange={(e) => setContent({ ...content, customColor: e.target.value })}
                        className="w-full h-[32px] bg-white border border-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">🎵 BGM設定 (最初はオフで始まります)</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setContent({ ...content, bgmMode: 'none' })}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          (!content.bgmMode || content.bgmMode === 'none')
                            ? "bg-slate-100 text-slate-800 border-sky-400" 
                            : "bg-white text-slate-550 border-slate-200"
                        }`}
                      >
                        🔇 なし
                      </button>
                      <button
                        onClick={() => setContent({ ...content, bgmMode: 'preset', bgmPreset: content.bgmPreset || 'relax' })}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          content.bgmMode === 'preset'
                            ? "bg-slate-100 text-slate-800 border-sky-400" 
                            : "bg-white text-slate-550 border-slate-200"
                        }`}
                      >
                        🎶 テンプレBGM
                      </button>
                      <button
                        onClick={() => setContent({ ...content, bgmMode: 'custom' })}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          content.bgmMode === 'custom'
                            ? "bg-slate-100 text-slate-800 border-sky-400" 
                            : "bg-white text-slate-550 border-slate-200"
                        }`}
                      >
                        🔗 好きなBGM(URL)
                      </button>
                    </div>
                  </div>

                  {content.bgmMode === 'preset' && (
                    <div className="flex gap-2">
                      {['relax', 'pop', 'cyber', '8bit'].map(p => (
                        <button
                          key={p}
                          onClick={() => setContent({ ...content, bgmPreset: p as any })}
                          className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                            content.bgmPreset === p
                              ? "bg-sky-50 text-sky-800 border-sky-300"
                              : "bg-white text-slate-500 border-slate-200"
                          }`}
                        >
                          {p === 'relax' ? '🍃 リラックス' : p === 'pop' ? '🎈 ポップ' : p === 'cyber' ? '⚡ サイバー' : '👾 8bit'}
                        </button>
                      ))}
                    </div>
                  )}

                  {content.bgmMode === 'custom' && (
                    <div>
                      <input
                        type="url"
                        placeholder="https://... (mp3/wavの直接URL)"
                        value={content.bgmUrl || ''}
                        onChange={(e) => setContent({ ...content, bgmUrl: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-700">🔓 全体に公開する</span>
                    <p className="text-[10px] text-slate-500">オンにすると公開ギャラリーに自動で載ります。</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={content.isPublic}
                    onChange={(e) => setContent({ ...content, isPublic: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 出題詳細オプション（全問か、ランダムかなど、作成者が決められるようにする) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  ⚙️ プレイヤーの出題設定
                </h4>
                
                <p className="text-[11px] text-slate-500">
                  回答者がプレイする際の問題順や問題制限などを細かく決定できます。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 select-none">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-700">🔀 質問順ランダム</div>
                    <div className="text-[9px] text-slate-500">質問の出題順をランダムにします。</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!content.randomizeQuestions}
                    onChange={(e) => setContent({ ...content, randomizeQuestions: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                  <div className="text-xs font-bold text-slate-700">📊 出題する質問の最大数</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="0（制限なし）"
                      value={content.limitQuestionsCount || ""}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setContent({ ...content, limitQuestionsCount: val });
                      }}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 w-full text-center font-mono focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">問 (0で全問)</span>
                  </div>
                </div>

                {content.type === 'quiz' && (
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 select-none">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-700">💡 その場で正誤を表示</div>
                      <div className="text-[9px] text-slate-500">クイズ回答直後に即時フィードバック。</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!content.quizImmediateFeedback}
                      onChange={(e) => setContent({ ...content, quizImmediateFeedback: e.target.checked })}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 診断パラメータ（評価属性）の編集 */}
            {content.type === "diagnostic" && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    📈 診断計算用の採点パラメータ属性 (例: Ni, Ti, Fe, Se)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    質問の回答ごとに加点・集計されるスコアリングのキーです。自由に増やしたり名前を変えたりできます！
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {content.scoringAttributes.map(attr => (
                    <span 
                      key={attr}
                      className="bg-white border border-slate-200 text-slate-750 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm animate-fade-in"
                    >
                      {attr}
                      <button 
                        onClick={() => removeAttribute(attr)}
                        className="text-slate-400 hover:text-red-500 transition-colors ml-1"
                        title="削除"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 max-w-sm">
                  <input
                    type="text"
                    placeholder="新しい属性名 (例: Fe, Se, 理系度)"
                    value={newAttributeText}
                    onChange={(e) => setNewAttributeText(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addAttribute(); } }}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none flex-1"
                  />
                  <button 
                    onClick={addAttribute}
                    className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
                  >
                    追加
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =============== タブ2: しつもんの編集 =============== */}
        {activeTab === 'questions' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-4 rounded-xl border border-slate-200 gap-3">
              <span className="text-xs text-slate-600">
                質問を作成します。タイプ別に入力ボックスや加算微調整スライダーが使えます。
              </span>
              <div className="flex flex-wrap gap-1.5 justify-end font-bold">
                <button 
                  onClick={() => addQuestion("five_choices")}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  ＋ 5択(そう思う)
                </button>
                <button 
                  onClick={() => addQuestion("radio")}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  ＋ ラジオボタン
                </button>
                
                <button 
                  onClick={() => addQuestion("checkbox")}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  ＋ 複数チェック
                </button>
                <button 
                  onClick={() => addQuestion("dropdown")}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  ＋ プルダウン
                </button>
                <button 
                  onClick={() => addQuestion("slider")}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  ＋ スライダー
                </button>
                <button 
                  onClick={() => addQuestion("pairing")}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  ＋ 線つなぎペア
                </button>
                <button 
                  onClick={() => addQuestion("text")}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  ＋ 記述式テキスト
                </button>
              </div>
            </div>

            {/* 質問リストループ */}
            <div className="space-y-4">
              {content.questions.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                  <span className="text-xs text-slate-400">作成された質問がありません。右上の「＋」ボタンから追加してね！</span>
                </div>
              ) : (
                content.questions.map((q, idx) => (
                  <div key={q.id} className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm animate-fade-in relative">
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {q.type === 'five_choices' ? '5択リカート' :
                         q.type === 'radio' ? '単一選択' :
                         q.type === 'checkbox' ? '複数チェック' :
                         q.type === 'slider' ? '数値スライダー' :
                         q.type === 'dropdown' ? 'プルダウン' :
                         q.type === 'pairing' ? '線つなぎペア' : '記述式'}
                      </span>
                      <button 
                        onClick={() => {
                          setContent(prev => ({
                            ...prev,
                            questions: prev.questions.filter(item => item.id !== q.id)
                          }));
                          playSound("bloop");
                        }}
                        className="text-slate-400 hover:text-red-500 font-bold p-1 hover:bg-red-50 rounded-lg transition-colors"
                        title="質問削除"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="flex gap-2 items-center">
                      <span className="font-mono text-xs text-indigo-500 font-bold">Q{idx + 1}.</span>
                      <input
                        type="text"
                        value={q.text}
                        onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-1.5 text-xs text-slate-800 font-bold flex-1 placeholder-slate-400 focus:outline-none"
                        placeholder="質問の質問文を入力してね"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                       <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                          <input
                            type="text"
                            value={q.imageUrlOrEmoji || ""}
                            onChange={(e) => updateQuestion(q.id, { imageUrlOrEmoji: e.target.value })}
                            className="bg-transparent text-xs text-slate-700 font-bold flex-1 px-2 focus:outline-none placeholder-slate-400"
                            placeholder="絵文字(🎈) または URL"
                          />
                          <label className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 py-1 rounded-lg cursor-pointer transition-colors font-bold whitespace-nowrap">
                            画像アップロード
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, (base64) => updateQuestion(q.id, { imageUrlOrEmoji: base64 }))}
                            />
                          </label>
                       </div>
                       {q.imageUrlOrEmoji && q.imageUrlOrEmoji.startsWith("data:") && (
                         <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative">
                           <img src={q.imageUrlOrEmoji} className="w-full h-full object-cover" alt="" />
                           <button onClick={() => updateQuestion(q.id, {imageUrlOrEmoji: ''})} className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 flex items-center justify-center text-[8px]">&times;</button>
                         </div>
                       )}
                    </div>


                    {/* わからないボタン(スキップ)の設定 */}
                    {['radio', 'five_choices', 'text', 'dropdown'].includes(q.type) && (
                      <div className="flex items-center gap-2 pl-2">
                        <input
                          type="checkbox"
                          id={`skip-${q.id}`}
                          checked={q.skipEnabled}
                          onChange={(e) => updateQuestion(q.id, { skipEnabled: e.target.checked })}
                          className="w-3.5 h-3.5 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                        />
                        <label htmlFor={`skip-${q.id}`} className="text-[10px] text-slate-500 cursor-pointer font-bold">
                          「わからない（質問をスキップして進む）」ボタンを有効にする
                        </label>
                      </div>
                    )}

                    {/* 分岐条件（前の質問の回答に応じて表示） */}
                    <div className="mt-2 space-y-2 p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                      <label className="block text-xs font-bold text-amber-700 mb-1">
                        🌿 分岐条件 (特定の条件を満たした時だけこの質問を表示)
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          value={q.conditionParentId || ""}
                          onChange={(e) => updateQuestion(q.id, { conditionParentId: e.target.value })}
                          className="flex-1 bg-white border border-amber-200 text-xs px-2 py-1.5 rounded-lg text-slate-700"
                        >
                          <option value="">常に表示する (条件なし)</option>
                          {content.questions.slice(0, idx).map(prevQ => (
                            <option key={prevQ.id} value={prevQ.id}>Q{content.questions.findIndex(a=>a.id===prevQ.id)+1}: {prevQ.text}</option>
                          ))}
                        </select>
                        
                        {q.conditionParentId && (
                          <>
                            <select
                              value={q.conditionOperator || "equals"}
                              onChange={(e) => updateQuestion(q.id, { conditionOperator: e.target.value as any })}
                              className="w-full sm:w-28 bg-white border border-amber-200 text-xs px-2 py-1.5 rounded-lg text-slate-700"
                            >
                              <option value="equals">と一致する</option>
                              <option value="not_equals">と一致しない</option>
                            </select>
                            
                            <input
                              type="text"
                              value={q.conditionValue || ""}
                              onChange={(e) => updateQuestion(q.id, { conditionValue: e.target.value })}
                              placeholder="選択肢のテキストなど"
                              className="flex-1 bg-white border border-amber-200 text-xs px-2 py-1.5 rounded-lg text-slate-700 placeholder-slate-400"
                            />
                          </>
                        )}
                      </div>
                    </div>

                    {content.type === 'quiz' && (
                      <div className="mt-2 space-y-2 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                        <div>
                          <label className="block text-[10px] font-bold text-emerald-600 mb-1">
                            ✨ 正解時の解説文（任意）
                          </label>
                          <textarea
                            placeholder="例: 正解は○○でした！理由は..."
                            value={q.correctFeedback || ''}
                            onChange={(e) => updateQuestion(q.id, { correctFeedback: e.target.value })}
                            className="w-full bg-white border border-emerald-200 rounded-lg p-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-400 min-h-[50px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-rose-500 mb-1">
                            ❌ 不正解時の解説文（任意）
                          </label>
                          <textarea
                            placeholder="例: あなたが選んだのは間違いです。なぜなら..."
                            value={q.incorrectFeedback || ''}
                            onChange={(e) => updateQuestion(q.id, { incorrectFeedback: e.target.value })}
                            className="w-full bg-white border border-rose-200 rounded-lg p-2 text-xs text-slate-700 focus:outline-none focus:border-rose-400 min-h-[50px]"
                          />
                        </div>
                      </div>
                    )}

                    {/* ================= type === five_choices, radio, checkbox, dropdown ================= */}
                    {['five_choices', 'radio', 'checkbox', 'dropdown'].includes(q.type) && (
                      <div className="space-y-3 pl-3 border-l-2 border-slate-200">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500">選択肢と加点調整：</span>
                          <button
                            onClick={() => addChoice(q.id)}
                            className="text-[10px] bg-white text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                          >
                            ＋ 選択肢を追加
                          </button>
                        </div>

                        {q.choices.map((choice) => (
                          <div key={choice.id} className="bg-white border border-slate-200 p-3 rounded-xl space-y-2 shadow-xs">
                            <div className="flex gap-2">
                              
                              {content.type === 'quiz' && (
                                <label className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                  <input 
                                    type="checkbox" 
                                    checked={choice.isCorrect || false}
                                    onChange={e => updateChoice(q.id, choice.id, choice.text, choice.scores, e.target.checked)}
                                    className="cursor-pointer"
                                  />
                                  正解設定
                                </label>
                              )}

                              {/* 選択肢テキスト */}
                              <input
                                type="text"
                                value={choice.text}
                                onChange={(e) => {
                                  updateChoice(q.id, choice.id, e.target.value, choice.scores);
                                }}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 flex-1 placeholder-slate-400 focus:outline-none"
                                placeholder="選択肢のテキスト"
                              />
                              <button
                                onClick={() => removeChoice(q.id, choice.id)}
                                className="text-slate-400 hover:text-red-500 px-1.5 cursor-pointer"
                                title="削除"
                              >
                                ×
                              </button>
                            </div>

                            {content.type !== 'quiz' && content.type !== 'survey' && (

                            <div className="space-y-1.5">
                              <span className="text-[10px] text-slate-500 font-bold block">
                                選択時のパラメータ加点調整
                              </span>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {content.scoringAttributes.map((attr) => {
                                  const scoreVal = choice.scores[attr] || 0;
                                  return (
                                    <div key={attr} className="bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200 flex flex-col justify-center">
                                      <div className="flex justify-between text-[10px] text-slate-600">
                                        <span className="font-bold">{attr}</span>
                                        <span className="font-mono text-emerald-600 font-bold">
                                          {scoreVal > 0 ? `+${scoreVal}` : scoreVal}
                                        </span>
                                      </div>
                                      <input
                                        type="range"
                                        min="-5"
                                        max="5"
                                        step="1"
                                        value={scoreVal}
                                        onChange={(e) => {
                                          const nextScores = { ...choice.scores };
                                          const v = parseInt(e.target.value);
                                          if (v === 0) {
                                            delete nextScores[attr];
                                          } else {
                                            nextScores[attr] = v;
                                          }
                                          updateChoice(q.id, choice.id, choice.text, nextScores);
                                        }}
                                        className="w-full mt-1 accent-indigo-500 cursor-pointer h-1 rounded text-indigo-500"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
)}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ================= type === slider ================= */}
                    {q.type === 'slider' && (
                      <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-4 pl-3 border-l-2 border-slate-250 shadow-xs">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-1">最小値</label>
                            <input
                              type="number"
                              value={q.sliderMin}
                              onChange={(e) => updateQuestion(q.id, { sliderMin: parseInt(e.target.value) || 0 })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-1">最大値</label>
                            <input
                              type="number"
                              value={q.sliderMax}
                              onChange={(e) => updateQuestion(q.id, { sliderMax: parseInt(e.target.value) || 10 })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-1">ステップ段階</label>
                            <input
                              type="number"
                              value={q.sliderStep}
                              onChange={(e) => updateQuestion(q.id, { sliderStep: parseInt(e.target.value) || 1 })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                          <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <label className="block text-xs font-bold text-slate-700">⬅️ 左側のラベル</label>
                            <input
                              type="text"
                              value={q.sliderLeftLabel}
                              onChange={(e) => updateQuestion(q.id, { sliderLeftLabel: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                              placeholder="例：感情的"
                            />
                            {content.type !== 'quiz' && (
                              <div className="pt-2 border-t border-slate-200 mt-2">
                                <label className="block text-[10px] text-slate-500 font-bold mb-1">左端に近づいた時の加点先</label>
                                <select
                                  value={q.sliderLeftAttribute || ""}
                                  onChange={(e) => updateQuestion(q.id, { sliderLeftAttribute: e.target.value })}
                                  className="w-full bg-white border border-slate-200 text-xs px-2 py-1.5 rounded-lg mb-2"
                                >
                                  <option value="">加点しない</option>
                                  {content.scoringAttributes.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                                <div className="flex justify-between items-center">
                                  <label className="text-[10px] text-slate-500 font-bold">最大加点 (一番左の時)</label>
                                  <input
                                    type="number"
                                    value={q.sliderLeftMaxScore || 0}
                                    onChange={(e) => updateQuestion(q.id, { sliderLeftMaxScore: parseFloat(e.target.value) || 0 })}
                                    className="w-16 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono text-center"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <label className="block text-xs font-bold text-slate-700">➡️ 右側のラベル</label>
                            <input
                              type="text"
                              value={q.sliderRightLabel}
                              onChange={(e) => updateQuestion(q.id, { sliderRightLabel: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                              placeholder="例：論理的"
                            />
                            {content.type !== 'quiz' && (
                              <div className="pt-2 border-t border-slate-200 mt-2">
                                <label className="block text-[10px] text-slate-500 font-bold mb-1">右端に近づいた時の加点先</label>
                                <select
                                  value={q.sliderRightAttribute || ""}
                                  onChange={(e) => updateQuestion(q.id, { sliderRightAttribute: e.target.value })}
                                  className="w-full bg-white border border-slate-200 text-xs px-2 py-1.5 rounded-lg mb-2"
                                >
                                  <option value="">加点しない</option>
                                  {content.scoringAttributes.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                                <div className="flex justify-between items-center">
                                  <label className="text-[10px] text-slate-500 font-bold">最大加点 (一番右の時)</label>
                                  <input
                                    type="number"
                                    value={q.sliderRightMaxScore || 0}
                                    onChange={(e) => updateQuestion(q.id, { sliderRightMaxScore: parseFloat(e.target.value) || 0 })}
                                    className="w-16 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono text-center"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {content.type === 'quiz' && (
                          <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl mt-3 space-y-2">
                            <label className="block text-xs font-bold text-indigo-700">🎯 正解の範囲 (この範囲なら正解)</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={q.sliderCorrectMin ?? q.sliderMin}
                                onChange={(e) => updateQuestion(q.id, { sliderCorrectMin: parseFloat(e.target.value) || 0 })}
                                className="w-20 bg-white border border-indigo-200 rounded-lg px-3 py-1.5 text-xs font-mono text-center"
                              />
                              <span className="text-xs text-indigo-500 font-bold">〜</span>
                              <input
                                type="number"
                                value={q.sliderCorrectMax ?? q.sliderMax}
                                onChange={(e) => updateQuestion(q.id, { sliderCorrectMax: parseFloat(e.target.value) || 0 })}
                                className="w-20 bg-white border border-indigo-200 rounded-lg px-3 py-1.5 text-xs font-mono text-center"
                              />
                            </div>
                            <p className="text-[9px] text-indigo-500">※ピッタリ当てさせるなら、最小と最大を同じ数字にしてね。</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ================= type === text (記述ルール式) ================= */}
                    {q.type === 'text' && (
                      <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-4 pl-3 border-l-2 border-slate-250 shadow-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-700">
                            ✏️ 部分判定用文字ルール & フォールバック（その他全体の処理）：
                          </span>
                          <button
                            onClick={() => addTextRule(q.id, false)}
                            className="text-[10px] bg-white text-slate-75 * border border-slate-25 * px-2 px-2.5 py-1 rounded-lg hover:bg-slate-50 shadow-sm transition-colors cursor-pointer"
                          >
                            ＋ 単語一致ルール追加
                          </button>
                        </div>

                        {q.textRules.map((rule, ruleIdx) => (
                          <div key={rule.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                            <div className="flex justify-between items-center text-[10px] text-slate-600 font-bold">
                              <span>
                                {rule.isFallback ? "🎨 残りのすべての入力に対する加点（フォールバック）" : (() => {
                                  const currentRuleNum = q.textRules.slice(0, ruleIdx).filter(r => !r.isFallback).length + 1;
                                  return `🔑 ルール ${currentRuleNum}`;
                                })()}
                              </span>
                              {!rule.isFallback && (
                                <button
                                  onClick={() => {
                                    updateQuestion(q.id, { textRules: q.textRules.filter(tr => tr.id !== rule.id) });
                                    playSound("bloop");
                                  }}
                                  className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                >
                                  削除
                                </button>
                              )}
                            </div>

                            {!rule.isFallback && (
                              <div>
                                <label className="block text-[9px] text-slate-500 mb-0.5">
                                  部分判定キー（どれか1つの言葉が含まれる場合にヒット、半角カンマ区切り）
                                </label>
                                <input
                                  type="text"
                                  value={rule.keywords.join(",")}
                                  onChange={(e) => {
                                    const nextRules = q.textRules.map(tr => {
                                      if (tr.id === rule.id) {
                                        return { ...tr, keywords: e.target.value.split(",").map(k => k.trim()).filter(Boolean) };
                                      }
                                      return tr;
                                    });
                                    updateQuestion(q.id, { textRules: nextRules });
                                  }}
                                  placeholder="例: 好き,大好き,愛してる,Fe"
                                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-850 placeholder-slate-400 focus:outline-none"
                                />
                              </div>
                            )}

                            {/* 記述一致時加点 */}
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-500 block font-sans">
                                一致時の属性加算値
                              </span>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {content.scoringAttributes.map((attr) => {
                                  const scoreVal = rule.scores[attr] || 0;
                                  return (
                                    <div key={attr} className="bg-white px-2 py-1 rounded-lg border border-slate-200 flex justify-between items-center">
                                      <span className="text-[10px] text-slate-500 font-bold">{attr}</span>
                                      <input
                                        type="number"
                                        value={scoreVal}
                                        onChange={(e) => {
                                          const nextRules = q.textRules.map(tr => {
                                            if (tr.id === rule.id) {
                                              const nextScores = { ...tr.scores };
                                              nextScores[attr] = parseInt(e.target.value) || 0;
                                              return { ...tr, scores: nextScores };
                                            }
                                            return tr;
                                          });
                                          updateQuestion(q.id, { textRules: nextRules });
                                        }}
                                        className="bg-slate-50 text-center text-xs text-emerald-600 font-bold border border-slate-200 rounded w-10 py-0.5"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ================= type === pairing (線つなぎペア) ================= */}
                    {q.type === 'pairing' && (
                      <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-4 pl-3 border-l-2 border-slate-200 shadow-xs">
                        
                        {content.type !== 'quiz' && content.type !== 'survey' && (
                          <div className="mb-4">
                            <label className="block text-[10px] text-slate-500 font-bold mb-1">
                              💯 満点（全問正解）だった場合の加点・属性 (例: A 10 B 5)
                            </label>
                            <input
                              type="text"
                              value={stringifySimpleAttributes(q.pairingAttributeScores)}
                              onChange={(e) => {
                                try {
                                  const parsed = e.target.value ? parseSimpleAttributes(e.target.value) : undefined;
                                  const updatedQs = content.questions.map(qu => qu.id === q.id ? { ...qu, pairingAttributeScores: parsed } : qu);
                                  setContent({ ...content, questions: updatedQs });
                                } catch(e) {}
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
                              placeholder="例: Score 10 Ni 5"
                            />
                            <p className="text-[9px] text-slate-400 mt-1">※正解ペア数に応じて、ここに入力した加点が割合で配分されます。</p>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-700">
                            🔗 つなぐペアの設定 (左の画像/文字と、右の画像/文字の両方を自由に作れます)：
                          </span>
                          <button
                            onClick={() => addPairItem(q.id)}
                            className="text-[10px] bg-white text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                          >
                            ＋ ペア項目を追加
                          </button>
                        </div>

                        {q.pairItems.map((pItem) => (
                          <div key={pItem.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-stretch justify-between gap-4 relative shadow-xs">
                            {/* 左カラムの編集 */}
                            <div className="flex-1 space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                              <span className="text-[10px] font-bold text-teal-600 block border-b border-slate-200 pb-0.5 font-sans">◀ 左のカードの設定</span>
                              
                              <div className="space-y-1">
                                <label className="text-[9px] text-slate-500 block font-bold">画像URL または 絵文字</label>
                                <input
                                  type="text"
                                  value={pItem.leftEmojiOrUrl}
                                  onChange={(e) => {
                                    const nextItems = q.pairItems.map(pi => pi.id === pItem.id ? { ...pi, leftEmojiOrUrl: e.target.value } : pi);
                                    updateQuestion(q.id, { pairItems: nextItems });
                                  }}
                                  className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 w-full placeholder-slate-400 focus:outline-none focus:border-teal-400"
                                  placeholder="例：🐶 または https://... もしくは下からアップロード"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] text-slate-500 block font-bold">画像をローカルからアップロード</label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const base64String = reader.result as string;
                                      const nextItems = q.pairItems.map(pi => pi.id === pItem.id ? { ...pi, leftEmojiOrUrl: base64String } : pi);
                                      updateQuestion(q.id, { pairItems: nextItems });
                                      playSound("bell");
                                    };
                                    reader.readAsDataURL(file);
                                  }}
                                  className="text-[9px] text-slate-500 w-full cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] text-slate-500 block font-bold">名前 (ラベル・任意)</label>
                                <input
                                  type="text"
                                  value={pItem.leftLabel || ""}
                                  onChange={(e) => {
                                    const nextItems = q.pairItems.map(pi => pi.id === pItem.id ? { ...pi, leftLabel: e.target.value } : pi);
                                    updateQuestion(q.id, { pairItems: nextItems });
                                  }}
                                  className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 w-full placeholder-slate-400 focus:outline-none"
                                  placeholder="例：いぬ"
                                />
                              </div>

                              <div className="flex justify-center p-1 bg-slate-50 rounded">
                                {pItem.leftEmojiOrUrl.startsWith("http") || pItem.leftEmojiOrUrl.startsWith("data:") ? (
                                  <img src={pItem.leftEmojiOrUrl} alt="" className="h-8 max-w-full rounded object-contain" />
                                ) : (
                                  <span className="text-xl">{pItem.leftEmojiOrUrl || "✨"}</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-center text-slate-400 text-xs font-bold font-mono">
                              🔀
                              <br className="hidden md:block"/>
                              ペア
                              <br className="hidden md:block"/>
                              連結
                            </div>

                            {/* 右カラムの編集 */}
                            <div className="flex-1 space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                              <span className="text-[10px] font-bold text-cyan-600 block border-b border-slate-200 pb-0.5">▶ 右のカードの設定</span>
                              
                              <div className="space-y-1">
                                <label className="text-[9px] text-slate-500 block font-bold">画像URL または 絵文字</label>
                                <input
                                  type="text"
                                  value={pItem.rightEmojiOrUrl || ""}
                                  onChange={(e) => {
                                    const nextItems = q.pairItems.map(pi => pi.id === pItem.id ? { ...pi, rightEmojiOrUrl: e.target.value } : pi);
                                    updateQuestion(q.id, { pairItems: nextItems });
                                  }}
                                  className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 w-full placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                                  placeholder="例：🍖 または https://... もしくは下からアップロード"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] text-slate-500 block font-bold">画像をローカルからアップロード</label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const base64String = reader.result as string;
                                      const nextItems = q.pairItems.map(pi => pi.id === pItem.id ? { ...pi, rightEmojiOrUrl: base64String } : pi);
                                      updateQuestion(q.id, { pairItems: nextItems });
                                      playSound("bell");
                                    };
                                    reader.readAsDataURL(file);
                                  }}
                                  className="text-[9px] text-slate-500 w-full cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] text-slate-500 block font-bold">名前 (ラベル・任意)</label>
                                <input
                                  type="text"
                                  value={pItem.rightLabel || ""}
                                  onChange={(e) => {
                                    const nextItems = q.pairItems.map(pi => pi.id === pItem.id ? { ...pi, rightLabel: e.target.value } : pi);
                                    updateQuestion(q.id, { pairItems: nextItems });
                                  }}
                                  className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 w-full placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                                  placeholder="例：エサ"
                                />
                              </div>

                              <div className="flex justify-center p-1 bg-slate-50 rounded">
                                {pItem.rightEmojiOrUrl?.startsWith("http") || pItem.rightEmojiOrUrl?.startsWith("data:") ? (
                                  <img src={pItem.rightEmojiOrUrl} alt="" className="h-8 max-w-full rounded object-contain" />
                                ) : (
                                  <span className="text-xl">{pItem.rightEmojiOrUrl || "❓"}</span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                const nextItems = q.pairItems.filter(pi => pi.id !== pItem.id);
                                updateQuestion(q.id, { pairItems: nextItems });
                                playSound("bloop");
                              }}
                              className="absolute top-2 right-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-colors cursor-pointer text-sm font-bold bg-white border border-slate-200 rounded-full w-6 h-6 flex items-center justify-center shadow-xs"
                              title="ペア削除"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* =============== タブ: ガチャの景品 =============== */}
        {activeTab === 'gacha' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500">
                ガチャの景品を登録します。確率の合計値が100%になるのがベストです。現在：
                <strong className={`ml-1 text-sm ${Math.abs(content.gachaItems.reduce((acc, curr) => acc + curr.probability, 0) - 100) < 0.1 ? 'text-emerald-600 font-bold' : 'text-amber-500 font-bold'}`}>
                  {content.gachaItems.reduce((acc, curr) => acc + curr.probability, 0)}%
                </strong>
              </span>
              <button
                onClick={addGachaItem}
                className="bg-indigo-600/90 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
              >
                ＋ 新登録
              </button>
            </div>

            {content.gachaItems.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                ガチャ景品がありません。追加するか、AIに「ガチャ」のおもしろ生成を頼んでみてね！
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 text-slate-800">
                {content.gachaItems.map((item, idx) => (
                  <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-5 relative shadow-xs">
                    <button 
                      onClick={() => {
                        setContent(prev => ({ ...prev, gachaItems: prev.gachaItems.filter(gi => gi.id !== item.id) }));
                        playSound("bloop");
                      }}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="削除"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold mb-1">🎁 景品名</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const updated = content.gachaItems.map(gi => gi.id === item.id ? { ...gi, name: e.target.value } : gi);
                            setContent({ ...content, gachaItems: updated });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-[10px] text-slate-500 font-bold mb-1">レア度</label>
                          <select
                            value={item.rarity}
                            onChange={(e) => {
                              const updated = content.gachaItems.map(gi => gi.id === item.id ? { ...gi, rarity: e.target.value as any } : gi);
                              setContent({ ...content, gachaItems: updated });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700"
                          >
                            <option value="UR">UR 超特賞</option>
                            <option value="SSR">SSR 大当たり</option>
                            <option value="SR">SR 中当たり</option>
                            <option value="R">R 小当たり</option>
                            <option value="N">N 通常種</option>
                          </select>
                        </div>

                        <div className="w-20">
                          <label className="block text-[10px] text-slate-500 font-bold mb-1">出現率(%)</label>
                          <input
                            type="number"
                            value={item.probability}
                            onChange={(e) => {
                              const updated = content.gachaItems.map(gi => gi.id === item.id ? { ...gi, probability: parseFloat(e.target.value) || 0 } : gi);
                              setContent({ ...content, gachaItems: updated });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-center font-mono font-bold text-emerald-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold mb-1">🐛 絵文字／画像URL</label>
                        <input
                          type="text"
                          value={item.imageUrlOrEmoji}
                          onChange={(e) => {
                            const updated = content.gachaItems.map(gi => gi.id === item.id ? { ...gi, imageUrlOrEmoji: e.target.value } : gi);
                            setContent({ ...content, gachaItems: updated });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                          placeholder="絵文字1文字または画像URL"
                        />
                      </div>
                      
                      <div className="text-center p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-center min-h-[50px] shadow-xs">
                        {item.imageUrlOrEmoji.startsWith("http") ? (
                          <img src={item.imageUrlOrEmoji} alt="" className="max-h-12 max-w-full rounded object-contain" />
                        ) : (
                          <span className="text-4xl">{item.imageUrlOrEmoji || "🎁"}</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold mb-1">🗣️ 排出された時の一喝セリフ</label>
                        <textarea
                          rows={3}
                          value={item.dialogue || ""}
                          onChange={(e) => {
                            const updated = content.gachaItems.map(gi => gi.id === item.id ? { ...gi, dialogue: e.target.value } : gi);
                            setContent({ ...content, gachaItems: updated });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 resize-none h-24 focus:outline-none"
                          placeholder="例: 「よく私を見つけ出したな。褒めて遣わす！」"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =============== タブ3: 結果パターン =============== */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            {content.type === 'survey' && (
              <div className="bg-sky-50 p-4 rounded-xl space-y-3 mb-4 border border-sky-100">
                <div className="font-bold text-sky-800 text-sm border-b border-sky-100 pb-2">アンケート設定</div>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={content.surveyShowStats ?? true}
                    onChange={(e) => setContent({...content, surveyShowStats: e.target.checked})}
                  />
                  <span>アンケート終了後に全員の投票割合（％）を公開する</span>
                </label>
              </div>
            )}
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500">
                {content.type === 'survey' ? 'アンケート回答完了後に表示するサンクスページ（終了画面）を作成します。' : '心理テストやクイズの得点・パラメータに応じた「結果カード」を構成します。'}
              </span>
              <button
                onClick={addResultOption}
                className="bg-indigo-600/90 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
              >
                ＋ 新しい判定パターン
              </button>
            </div>

            {content.results.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                判定結果がありません。AIに自動生成させるか、手動で設定してください！
              </div>
            ) : (
              <div className="space-y-5 text-slate-800">
                {content.results.map((result, idx) => (
                  <div key={result.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 relative shadow-xs">
                    <button 
                      onClick={() => {
                        setContent(prev => ({ ...prev, results: prev.results.filter(r => r.id !== result.id) }));
                        playSound("bloop");
                      }}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="削除"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">👑 結果の二つ名（タイトル）</label>
                          <input
                            type="text"
                            value={result.title}
                            onChange={(e) => {
                              const updated = content.results.map(r => r.id === result.id ? { ...r, title: e.target.value } : r);
                              setContent({ ...content, results: updated });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                            placeholder="例: ニヒルな Ni 優位・精密機械タイプ"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">📝 結果の詳細解説テキスト</label>
                          <textarea
                            rows={3}
                            value={result.description}
                            onChange={(e) => {
                              const updated = content.results.map(r => r.id === result.id ? { ...r, description: e.target.value } : r);
                              setContent({ ...content, results: updated });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 resize-none h-[120px] focus:outline-none"
                            placeholder="あなたがどれだけ素晴らしいパラメータを示したか、おもしろい解説を熱く語る！"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">🖼️ 結果画像URL (任意)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={result.imageUrl || ""}
                              onChange={(e) => {
                                const updated = content.results.map(r => r.id === result.id ? { ...r, imageUrl: e.target.value } : r);
                                setContent({ ...content, results: updated });
                              }}
                              className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                              placeholder="Unsplashや手持ち画像リンク等"
                            />
                            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 transition-colors whitespace-nowrap">
                              画像アップロード
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      const updated = content.results.map(r => r.id === result.id ? { ...r, imageUrl: ev.target?.result as string } : r);
                                      setContent({ ...content, results: updated });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {content.type !== 'survey' && (
                          <>
                            <div className="flex flex-col gap-3">
                              <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">判定方法</label>
                                <select
                                  value={result.conditionType || 'threshold'}
                                  onChange={(e) => {
                                    const val = e.target.value as any;
                                    const updated = content.results.map(r => r.id === result.id ? { ...r, conditionType: val } : r);
                                    setContent({ ...content, results: updated });
                                  }}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700"
                                >
                                  <option value="max_expression">計算式の最大値 (例: Ni + Ti が一番高い結果になる)</option>
                                  <option value="threshold">最低点数 (単一パラメータ)</option>
                                  <option value="attribute_order">属性のスコア順 (例: A &gt; B &gt; C)</option>
                                  <option value="expression">高度な条件式 (例: A + B &gt;= 5)</option>
                                  <option value="random">🎲 ランダムに出現 (確率均等)</option>
                                </select>
                              </div>

                              <div className="flex items-center gap-2 mt-1">
                                <input
                                  type="checkbox"
                                  checked={!!result.isFallback}
                                  onChange={(e) => {
                                    const updated = content.results.map(r => r.id === result.id ? { ...r, isFallback: e.target.checked } : r);
                                    setContent({ ...content, results: updated });
                                  }}
                                  className="w-3.5 h-3.5"
                                />
                                <span className="text-[10px] text-slate-500 font-bold">どの条件にも当てはまらない時に出す結果（フォールバック）にする</span>
                              </div>

                              {result.conditionType === 'random' && (
                                <p className="text-[10px] text-slate-500 mt-1">
                                  ※ ランダム設定された結果の中から、どれか1つがランダムに選ばれます。他の条件を満たすものが1つもなかった場合のみ判定されます。
                                </p>
                              )}

                              {result.conditionType === 'attribute_order' && !result.isFallback && (
                                <div className="mt-2">
                                  <label className="block text-xs font-bold text-slate-600 mb-1">🔀 並び替え条件</label>
                                  <input
                                    type="text"
                                    value={result.conditionOrder?.join(' > ') || ''}
                                    onChange={(e) => {
                                      const orderArr = e.target.value.split(/[^a-zA-Z0-9_]+/).filter(Boolean);
                                      const updated = content.results.map(r => r.id === result.id ? { ...r, conditionOrder: orderArr } : r);
                                      setContent({ ...content, results: updated });
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono placeholder-slate-400 focus:outline-none focus:border-sky-400"
                                    placeholder="例: L > V > F > E"
                                  />
                                  <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                                    タイトルや説明文に <code className="bg-slate-100 text-pink-500 px-1 rounded">{"{SORT}"}</code> と入れると、判定された実際の並び替え結果が自動で挿入されます！<br/>
                                    <span className="opacity-80">※ 記号（&gt;、,、-、空白）は自動で区切られます。</span>
                                  </p>
                                </div>
                              )}

                              {(result.conditionType === 'threshold' || !result.conditionType) && !result.isFallback && (
                                <div className="flex gap-3">
                                  <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-600 mb-1">📯 判定に使うパラメータ</label>
                                    <select
                                      value={result.conditionAttribute}
                                      onChange={(e) => {
                                        const updated = content.results.map(r => r.id === result.id ? { ...r, conditionAttribute: e.target.value } : r);
                                        setContent({ ...content, results: updated });
                                      }}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700"
                                    >
                                      {content.type === 'quiz' ? (
                                        <option value="correct">正解数 (correct)</option>
                                      ) : content.scoringAttributes.length > 0 ? (
                                        content.scoringAttributes.map(attr => (
                                          <option key={attr} value={attr}>{attr}</option>
                                        ))
                                      ) : (
                                        <option value="">パラメータ未設定</option>
                                      )}
                                    </select>
                                  </div>
  
                                  <div className="w-24">
                                    <label className="block text-xs font-bold text-slate-600 mb-1">最低点数要件</label>
                                    <input
                                      type="number"
                                      value={result.conditionScoreMin}
                                      onChange={(e) => {
                                        const updated = content.results.map(r => r.id === result.id ? { ...r, conditionScoreMin: parseInt(e.target.value) || 0 } : r);
                                        setContent({ ...content, results: updated });
                                      }}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 text-center focus:outline-none"
                                    />
                                  </div>
                                </div>
                              )}

                              {(result.conditionType === 'expression' || result.conditionType === 'max_expression') && !result.isFallback && (
                                <div>
                                  <label className="block text-[10px] font-bold text-indigo-600 mb-1">
                                    ⚙️ 【上級】高度な条件式
                                  </label>
                                  <input
                                    type="text"
                                    value={result.advancedCondition || ""}
                                    onChange={(e) => {
                                      const updated = content.results.map(r => r.id === result.id ? { ...r, advancedCondition: e.target.value } : r);
                                      setContent({ ...content, results: updated });
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono placeholder-slate-400 focus:outline-none"
                                    placeholder={result.conditionType === 'max_expression' ? "例: Ni + Ti" : "例: Ti + Ne >= 5"}
                                  />
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    <span className="text-[9px] text-slate-400 font-bold mr-1 self-center">テンプレ:</span>
                                    {content.scoringAttributes.length >= 2 ? (
                                      <>
                                        <button onClick={() => setContent({ ...content, results: content.results.map(r => r.id === result.id ? { ...r, advancedCondition: `${content.scoringAttributes[0]} + ${content.scoringAttributes[1]}` + (result.conditionType === 'max_expression' ? "" : " >= 5") } : r)})} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[9px] font-mono border border-slate-200 transition-colors">加算</button>
                                        {result.conditionType !== 'max_expression' && (
                                          <button onClick={() => setContent({ ...content, results: content.results.map(r => r.id === result.id ? { ...r, advancedCondition: `${content.scoringAttributes[0]} > ${content.scoringAttributes[1]}` } : r)})} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[9px] font-mono border border-slate-200 transition-colors">比較</button>
                                        )}
                                      </>
                                    ) : null}
                                    <button onClick={() => setContent({ ...content, results: content.results.map(r => r.id === result.id ? { ...r, advancedCondition: "" } : r)})} className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded text-[9px] font-mono border border-rose-100 ml-auto transition-colors">クリア</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        {result.imageUrl && (
                          <div className="h-[80px] bg-white border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center shadow-xs">
                            <img src={result.imageUrl} alt="" className="h-full w-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =============== タブ4: 楽しいギミック設定 =============== */}
        {activeTab === 'gimmicks' && (
          <div className="space-y-6">
            
            {/* LSIマスコットのトグル */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm text-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    🐾 画面を歩くマスコットギミック
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    画面下部を右から左へ歩き回るマスコット（タップすると一言）を出現させます！
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={content.gimmicks.enableLsiCaterpillar}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    gimmicks: { ...prev.gimmicks, enableLsiCaterpillar: e.target.checked }
                  }))}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {content.gimmicks.enableLsiCaterpillar && (
                <div className="space-y-3 pl-3 border-l-2 border-slate-200">
                  <div className="flex gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-1">マスコット画像/絵文字</label>
                      <input
                        type="text"
                        value={content.gimmicks.lsiMascotImageOrEmoji || '🐛'}
                        onChange={e => setContent({ ...content, gimmicks: { ...content.gimmicks, lsiMascotImageOrEmoji: e.target.value }})}
                        className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-center"
                        placeholder="🐛"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] text-slate-500 font-bold mb-1">マスコットの名前</label>
                      <input
                        type="text"
                        value={content.gimmicks.caterpillarName || 'イモムシ'}
                        onChange={e => setContent({ ...content, gimmicks: { ...content.gimmicks, caterpillarName: e.target.value }})}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">潰すまでに要する累積タップ数</label>
                      <input
                        type="number"
                        value={content.gimmicks.caterpillarSquishTarget}
                        onChange={(e) => {
                          const target = parseInt(e.target.value) || 30;
                          setContent(prev => ({
                            ...prev,
                            gimmicks: { ...prev.gimmicks, caterpillarSquishTarget: target }
                          }));
                        }}
                        className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 w-20 text-center font-mono focus:outline-none"
                      />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">🎯 潰した時に加算される属性・ポイント数 (例: Score 10 Se 5)</label>
                    <input
                      type="text"
                      placeholder="例: Score 10 Ni 5"
                      value={stringifySimpleAttributes(content.gimmicks.caterpillarAttributeMultiplier)}
                      onChange={(e) => {
                        try {
                          const parsed = e.target.value ? parseSimpleAttributes(e.target.value) : undefined;
                          setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, caterpillarAttributeMultiplier: parsed } }));
                        } catch(e) {}
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 mb-3 focus:outline-none"
                    />
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">💬 タップされたときのセリフ (1行に1文ずつ)</label>
                    <textarea
                      rows={4}
                      value={(content.gimmicks.caterpillarQuotes || []).join("\n")}
                      onChange={(e) => {
                        const lines = e.target.value.split("\n");
                        setContent(prev => ({
                          ...prev,
                          gimmicks: { ...prev.gimmicks, caterpillarQuotes: lines }
                        }));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 resize-none focus:outline-none mb-3"
                      placeholder="セリフを登録してね！"
                    />
                    
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">💀 潰されたときの断末魔セリフ</label>
                    <input
                      type="text"
                      value={content.gimmicks.caterpillarSquishQuote || ""}
                      onChange={(e) => {
                        setContent(prev => ({
                          ...prev,
                          gimmicks: { ...prev.gimmicks, caterpillarSquishQuote: e.target.value }
                        }));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none"
                      placeholder="例: ぐえっ！"
                    />
                  </div>
                </div>
              )}
            </div>


            

            {/* その他のエフェクト */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm text-slate-800">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                ✨ お楽しみ演出ギミック
              </h4>
              
               <div className="flex items-center justify-between py-2">
                <div>
                  <h5 className="text-[12px] font-bold text-slate-700">😊 選択リアクション</h5>
                  <p className="text-[10px] text-slate-500">選択肢を押した瞬間にキラキラ紙吹雪が舞う！</p>
                </div>
                <input
                  type="checkbox"
                  checked={content.gimmicks.enableReactionEffect || false}
                  onChange={(e) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, enableReactionEffect: e.target.checked } }))}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div className="flex-1 pr-4">
                  <h5 className="text-[12px] font-bold text-slate-700">🌦 背景イベント</h5>
                  <p className="text-[10px] text-slate-500">回答中に背景で雪や花びらを降らせます。</p>
                </div>
                <select
                  value={content.gimmicks.weatherEffect || "none"}
                  onChange={(e) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, weatherEffect: e.target.value as any } }))}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700"
                >
                  <option value="none">なし</option>
                  <option value="snow">❄️ 雪</option>
                  <option value="petals">🌸 花びら</option>
                  <option value="stars">✨ 星</option>
                  <option value="rain">☔ 雨</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div className="flex-1 pr-4">
                  <h5 className="text-[12px] font-bold text-slate-700">✉️ 突然のお手紙ギミック</h5>
                  <p className="text-[10px] text-slate-500">回答中にランダムで手紙が落ちてきて、開くとポイントが加算されます。</p>
                </div>
                <input
                  type="checkbox"
                  checked={content.gimmicks.enableSecretLetter || false}
                  onChange={(e) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, enableSecretLetter: e.target.checked } }))}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
              {content.gimmicks.enableSecretLetter && (
                <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-3 shadow-xs mb-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">手紙の内容</label>
                    <textarea
                      placeholder="「いつもありがとう！これを受け取ってね！」"
                      value={content.gimmicks.secretLetterText || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, secretLetterText: e.target.value } }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">開いた時に加算される属性ポイント (例: Score 10 Se 5)</label>
                    <input
                      type="text"
                      placeholder='例: Score 10 Ni 2'
                      value={stringifySimpleAttributes(content.gimmicks.secretLetterAttributeMultiplier)}
                      onChange={(e) => {
                        try {
                          const parsed = e.target.value ? parseSimpleAttributes(e.target.value) : undefined;
                          setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, secretLetterAttributeMultiplier: parsed } }));
                        } catch(e) {}
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400 transition-colors"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div className="flex-1 pr-4">
                  <h5 className="text-[12px] font-bold text-slate-700">🐱 ランダム遭遇イベント</h5>
                  <p className="text-[10px] text-slate-500">回答中に突然キャラクターが乱入してくるかも！？</p>
                </div>
                <input
                  type="checkbox"
                  checked={content.gimmicks.enableRandomEvent || false}
                  onChange={(e) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, enableRandomEvent: e.target.checked } }))}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
              {content.gimmicks.enableRandomEvent && (
                <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-3 shadow-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">キャラクター（絵文字・画像URL）</label>
                    <input
                      type="text"
                      placeholder="🐱"
                      value={content.gimmicks.randomEventEmojiOrImage || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, randomEventEmojiOrImage: e.target.value } }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">登場時のセリフ</label>
                    <input
                      type="text"
                      placeholder="「やあ！調子はどうだい？」"
                      value={content.gimmicks.randomEventText || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, randomEventText: e.target.value } }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* TapBeat(絵文字たたき)のトグル */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm text-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    🔥 ピコピコ絵文字たたきスコア加点ゲーム
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    画面のなかに浮遊する絵文字をタップすることで、得点を一気に重ねられるミニゲームギミックです。
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={content.gimmicks.enableTapBeat}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    gimmicks: { ...prev.gimmicks, enableTapBeat: e.target.checked }
                  }))}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {content.gimmicks.enableTapBeat && (
                <div className="space-y-3 pl-3 border-l-2 border-slate-200">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">出現させる浮遊絵文字たち (半角カンマ区切り)</label>
                    <input
                      type="text"
                      value={content.gimmicks.tapBeatEmojis.join(",")}
                      onChange={(e) => {
                        const emojis = e.target.value.split(",").map(em => em.trim()).filter(Boolean);
                        setContent(prev => ({
                          ...prev,
                          gimmicks: { ...prev.gimmicks, tapBeatEmojis: emojis }
                        }));
                      }}
                      className="bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-850 w-full placeholder-slate-400 focus:outline-none"
                      placeholder="例: 🐱,🐸,🦁,🐛"
                    />
                  </div>

                  {(content.type === 'diagnostic' || content.type === 'quiz') && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">🎯 叩いた回数 × (加算する属性とポイント数) (例: Score 1 Se 5)</label>
                      <input
                        type="text"
                        placeholder='例: Se 1 Score 5'
                        value={stringifySimpleAttributes(content.gimmicks.tapBeatAttributeMultiplier)}
                        onChange={(e) => {
                          try {
                            const parsed = e.target.value ? parseSimpleAttributes(e.target.value) : undefined;
                            setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, tapBeatAttributeMultiplier: parsed } }));
                          } catch(err) {}
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400 transition-colors"
                      />
                    </div>
                  )}

                  {content.type === 'gacha' && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">💰 叩いた回数 × (加算されるガチャポイント)</label>
                      <input
                        type="number"
                        placeholder="例: 10"
                        value={content.gimmicks.tapBeatGachaPoints || ""}
                        onChange={(e) => setContent({ ...content, gimmicks: { ...content.gimmicks, tapBeatGachaPoints: parseInt(e.target.value) || undefined } })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400 transition-colors"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">叩いたときの鳴り響くサウンド</label>
                    <select
                      value={content.gimmicks.tapBeatSoundType}
                      onChange={(e) => {
                        const sType = e.target.value as any;
                        setContent(prev => ({
                          ...prev,
                          gimmicks: { ...prev.gimmicks, tapBeatSoundType: sType }
                        }));
                        playSound(sType);
                      }}
                      className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-700 focus:outline-none"
                    >
                      <option value="synth">ピコピコシンセ音 🎹</option>
                      <option value="bell">シャリーン！ベル音 🔔</option>
                      <option value="kick">ポコッ！打楽器キック音 🥁</option>
                      <option value="bloop">ププッ！警告レトロ音 👾</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* フッター */}
      <div className="bg-slate-50 px-6 py-4 flex-shrink-0 text-right border-t border-slate-200">
        <span className="text-[10px] text-slate-400">
          しつもん工房 — 自由な回答からつながる無限の選択肢 🚀
        </span>
      </div>

      {/* プレビューモーダル */}
      <AnimatePresence>
        {isPreviewMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl relative w-full mt-10 md:mt-0 md:max-w-md h-[80vh] flex flex-col border border-sky-100"
            >
              <div className="bg-slate-800 text-white p-3 flex justify-between items-center z-10 sticky top-0">
                <div className="text-xs font-bold flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                   プレビューモード
                </div>
                <button 
                  onClick={() => { setIsPreviewMode(false); playSound("bloop"); }}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-auto bg-slate-50 relative pointer-events-auto">
                <ContentPlayer content={content} onClose={() => setIsPreviewMode(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
