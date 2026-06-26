import { useState, useEffect } from "react";
import { ShitsumonKobo_Content, ShitsumonKobo_Question, ShitsumonKobo_GachaItem, ShitsumonKobo_ResultOption } from "../types";
import { playSound } from "./SoundEngine";
import PairingGame from "./PairingGame";
import TapBeatGame from "./TapBeatGame";
import LsiCaterpillar from "./LsiCaterpillar";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowRight, RotateCcw, Share2, Milestone, HelpCircle, CheckCircle2, Ticket, Check, X, BarChart } from "lucide-react";
import { savePlayLog, getPlayStats } from "../lib/playLogs";
import confetti from "canvas-confetti";

interface ContentPlayerProps {
  currentUser?: any;
  season?: { name: string; accentColor: string; bgGradient?: string; bgColor?: string; textColor?: string; accentBg?: string; icon: string };
  content: ShitsumonKobo_Content;
  onClose: () => void;
}

export default function ContentPlayer({ content, season, currentUser, onClose }: ContentPlayerProps) {
  // プレイ基本設定
  const [useRandomOrder, setUseRandomOrder] = useState(false);
  const [maxQuestionLimit, setMaxQuestionLimit] = useState<number>(content.questions.length);
  const [isStarted, setIsStarted] = useState(false);
  const [showEncounter, setShowEncounter] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [playLogs, setPlayLogs] = useState<any[]>([]);
  const [surveyStats, setSurveyStats] = useState<any[]>([]);
  const [feedbackModal, setFeedbackModal] = useState<{ show: boolean, isCorrect?: boolean, explanation?: string, type: 'quiz' | 'survey', mockStats?: Record<string, number> } | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  // 実行時質問リスト
  const [playQuestions, setPlayQuestions] = useState<ShitsumonKobo_Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  // 回答データ状態
  const [scores, setScores] = useState<Record<string, number>>({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [checkboxAnswers, setCheckboxAnswers] = useState<Record<string, Record<string, boolean>>>({});
  const [sliderAnswers, setSliderAnswers] = useState<Record<string, number>>({});
  const [pairingScores, setPairingScores] = useState<Record<string, number>>({});
  const [beatTapsScore, setBeatTapsScore] = useState(0);
  const [gimmickScores, setGimmickScores] = useState<Record<string, number>>({});
  const [showSecretLetter, setShowSecretLetter] = useState(false);
  const [secretLetterOpened, setSecretLetterOpened] = useState(false);

  // ガチャ状態
  const [gachaHistory, setGachaHistory] = useState<{ item: ShitsumonKobo_GachaItem; id: string }[]>([]);
  const [lastDrawn, setLastDrawn] = useState<ShitsumonKobo_GachaItem[]>([]);
  const [isGachaDrawRef, setIsGachaDrawing] = useState(false);
  const [gachaScore, setGachaScore] = useState(0);
  const [selectedGachaItem, setSelectedGachaItem] = useState<ShitsumonKobo_GachaItem | null>(null);

  // 初期化オプション上限
  useEffect(() => {
    setMaxQuestionLimit(content.questions.length);
  }, [content]);

  // しつもん開始
  const handleStart = () => {
    playSound("synth");
    
    // 質問シャッフル＆抽出ロジック
    let list = [...content.questions];
    if (useRandomOrder) {
      list = list.sort(() => Math.random() - 0.5);
    }
    
    // 抽出数の上限
    const limit = Math.min(maxQuestionLimit, list.length);
    if (limit > 0) {
      list = list.slice(0, limit);
    }

    setPlayQuestions(list);
    setCurrentIdx(0);
    setScores({});
    setTextAnswers({});
    setCheckboxAnswers({});
    setSliderAnswers({});
    setPairingScores({});
    setBeatTapsScore(0);
    setGimmickScores({});
    setSecretLetterOpened(false);
    setShowSecretLetter(false);
    setIsStarted(true);
    setIsFinished(false);
  };

  const currentQ = playQuestions[currentIdx];

  // 単一回答（ラジオ）選択時
  
  const triggerReaction = () => {
    if (content.gimmicks?.enableReactionEffect) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#38bdf8', '#34d399', '#f472b6', '#fbbf24']
      });
      playSound("synth");
    }
  };

  const handleRadioSelect = (choiceId: string) => {
    setTextAnswers(prev => ({ ...prev, [currentQ.id]: choiceId }));
    triggerReaction();
  };

  // 複数選択（チェックボックス）時
  const handleCheckboxChange = (choiceId: string, isChecked: boolean) => {
    playSound("synth");
    triggerReaction();
    setCheckboxAnswers(prev => {
      const qAns = prev[currentQ.id] || {};
      return {
        ...prev,
        [currentQ.id]: {
          ...qAns,
          [choiceId]: isChecked
        }
      };
    });
  };

  
  const proceedWithFeedbackCheck = () => {
    let showFb = false;
    let fbIsCorrect = false;

    if (content.type === 'quiz' && content.quizImmediateFeedback) {
      if (currentQ.type === 'radio' || currentQ.type === 'five_choices' || currentQ.type === 'dropdown') {
        const cId = textAnswers[currentQ.id];
        const c = currentQ.choices.find(c => c.id === cId);
        if (c && c.isCorrect) fbIsCorrect = true;
      } else if (currentQ.type === 'checkbox') {
        const ansMap = checkboxAnswers[currentQ.id] || {};
        let allCorrect = true;
        let anySelected = false;
        currentQ.choices.forEach(c => {
          if (ansMap[c.id]) anySelected = true;
          if (c.isCorrect && !ansMap[c.id]) allCorrect = false;
          if (!c.isCorrect && ansMap[c.id]) allCorrect = false;
        });
        if (anySelected && allCorrect) fbIsCorrect = true;
      } else if (currentQ.type === 'pairing') {
        fbIsCorrect = (pairingScores[currentQ.id] === 100);
      } else if (currentQ.type === 'text') {
        const val = textAnswers[currentQ.id] || "";
        const rule = currentQ.textRules?.find(r => !r.isFallback && r.keywords.some(kw => val.includes(kw)));
        if (rule && rule.isCorrect) fbIsCorrect = true;
      }
      
      let fbExplanation = fbIsCorrect ? currentQ.correctFeedback : currentQ.incorrectFeedback;
      fbExplanation = fbExplanation || "";

      setFeedbackModal({ show: true, type: 'quiz', isCorrect: fbIsCorrect, explanation: fbExplanation });
      playSound("synth");
      return;
    }
    
    // フィードバック表示不要な場合
    if (currentQ.type === 'text') commitTextAnswer();
    else if (currentQ.type === 'slider') commitSliderAnswer();
    else goToNext();
  };

  const closeFeedbackAndNext = () => {
    setFeedbackModal(null);
    if (currentQ.type === 'text') commitTextAnswer();
    else if (currentQ.type === 'slider') commitSliderAnswer();
    else goToNext();
  };

  // 記述判定用の一致計算
  const evalTextResult = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return {};

    // 質問ルールと比較
    const rules = currentQ.textRules;
    const matchRule = rules.find(rule => 
      !rule.isFallback && rule.keywords.some(kw => trimmed.includes(kw))
    );

    if (matchRule) {
      return matchRule.scores;
    }

    // 規定一致に入らなかった場合はフォールバック
    const fbRule = rules.find(rule => rule.isFallback);
    return fbRule ? fbRule.scores : {};
  };

  // 記述(テキスト)変更時
  const handleTextChange = (text: string) => {
    setTextAnswers(prev => ({ ...prev, [currentQ.id]: text }));
  };

  // 記述(テキスト)確定遷移
  const commitTextAnswer = () => {
    playSound("synth");
    goToNext();
  };

  // スライダー変更時
  const handleSliderChange = (val: number) => {
    setSliderAnswers(prev => ({ ...prev, [currentQ.id]: val }));
  };

  // スライダー確定
  const commitSliderAnswer = () => {
    playSound("synth");
    goToNext();
  };

  // 線つなぎペア引き時スコア
  const handlePairingGameComplete = (quizScore: number) => {
    setPairingScores(prev => ({ ...prev, [currentQ.id]: quizScore }));
    playSound("bell");
  };

  // 全質問回答の一括集計処理（二重加点を防ぎ、いつでも戻って再回答ができる堅牢な設計）
    const doAggregateScores = () => {
    const finalScores: Record<string, number> = {};
    
    // attributes 初期化
    content.scoringAttributes.forEach(attr => {
      finalScores[attr] = 0;
    });

    if (content.type === 'quiz') {
      finalScores['correct'] = 0;
    }

    playQuestions.forEach(q => {
      if (q.type === 'five_choices' || q.type === 'radio' || q.type === 'dropdown') {
        const choiceId = textAnswers[q.id];
        const selectedChoice = q.choices.find(c => c.id === choiceId);
        if (selectedChoice) {
          if (content.type === 'quiz' && selectedChoice.isCorrect) {
            finalScores['correct'] += 1;
          }
          if (selectedChoice.scores) {
            Object.entries(selectedChoice.scores).forEach(([attr, val]) => {
              finalScores[attr] = (finalScores[attr] || 0) + Number(val);
            });
          }
        }
      } else if (q.type === 'checkbox') {
        const qAns = checkboxAnswers[q.id] || {};
        let allCorrect = true;
        let anySelected = false;
        q.choices.forEach(choice => {
          if (qAns[choice.id]) {
            anySelected = true;
            if (choice.scores) {
              Object.entries(choice.scores).forEach(([attr, val]) => {
                finalScores[attr] = (finalScores[attr] || 0) + Number(val);
              });
            }
          }
          if (content.type === 'quiz') {
            if ((choice.isCorrect && !qAns[choice.id]) || (!choice.isCorrect && qAns[choice.id])) {
              allCorrect = false;
            }
          }
        });
        if (content.type === 'quiz' && anySelected && allCorrect) {
          finalScores['correct'] += 1;
        }
      } else if (q.type === 'pairing') {
        const pairingScore = pairingScores[q.id] || 0;
        if (content.type === 'quiz') {
           // ペアリングの場合はペア成立数を追加
           finalScores['correct'] += pairingScore;
        }
      } else if (q.type === 'text') {
        const textValue = textAnswers[q.id] || '';
        const matchingRule = q.textRules.find(r => !r.isFallback && r.keywords.some(kw => textValue.includes(kw)));
        if (matchingRule) {
           if (content.type === 'quiz' && matchingRule.isCorrect) finalScores['correct'] += 1;
           if (matchingRule.scores) {
              Object.entries(matchingRule.scores).forEach(([attr, val]) => {
                finalScores[attr] = (finalScores[attr] || 0) + Number(val);
              });
           }
        } else {
           const fallback = q.textRules.find(r => r.isFallback);
           if (fallback && fallback.scores) {
              Object.entries(fallback.scores).forEach(([attr, val]) => {
                finalScores[attr] = (finalScores[attr] || 0) + Number(val);
              });
           }
        }
      } else if (q.type === 'slider') {
         const val = sliderAnswers[q.id] || 3;
         if (q.sliderScores) {
            Object.entries(q.sliderScores).forEach(([attr, multiplier]) => {
              finalScores[attr] = (finalScores[attr] || 0) + (val * Number(multiplier));
            });
         }
      }
    });

    return finalScores;
  };

  // 前の問題へ戻る
  const goToPrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      playSound("bloop");
    }
  };

  // 次の問題へ、または終了
  const goToNext = () => {
    // ランダム遭遇 (約15%の確率で発生)
    if (content.gimmicks?.enableSecretLetter && !secretLetterOpened && Math.random() < 0.20 && currentIdx > 0 && currentIdx < playQuestions.length - 1) {
      setShowSecretLetter(true);
      playSound("synth");
    } else if (content.gimmicks?.enableRandomEvent && Math.random() < 0.15 && currentIdx < playQuestions.length - 1) {
      setShowEncounter(true);
      playSound("bell");
      setTimeout(() => setShowEncounter(false), 3000);
    }

    if (currentIdx + 1 < playQuestions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // 終了時にオンデマンド一括集算して state に正確なスコアを一撃で格納
      const finishedScores = doAggregateScores();
      setScores(finishedScores);
      setIsFinished(true);
      playSound("bell");
    }
  };

  // わからない（スキップ）
  const handleSkip = () => {
    playSound("bloop");
    goToNext();
  };

  const resetPlay = () => {
    setIsStarted(false);
    setIsFinished(false);
    setCurrentIdx(0);
    setScores({});
    setTextAnswers({});
    setCheckboxAnswers({});
    setSliderAnswers({});
    setPairingScores({});
    setBeatTapsScore(0);
    setGimmickScores({});
    setShowSecretLetter(false);
    setSecretLetterOpened(false);
    setGachaHistory([]);
    setLastDrawn([]);
    setGachaScore(0);
    setSelectedGachaItem(null);
    setFeedbackModal(null);
  };

  // ---------------- Gacha Logic ----------------

  const drawGacha = (count: number) => {
    if (isGachaDrawRef) return;
    
    // たたきゲームオンの場合はポイント消費
    if (content.gimmicks?.enableTapBeat) {
      const cost = count * 10;
      if (beatTapsScore < cost) {
        alert(`ポイントが足りないよ！必要なポイント: ${cost} pt\n（現在: ${beatTapsScore} pt）`);
        return;
      }
      setBeatTapsScore(prev => prev - cost);
    }

    setIsGachaDrawing(true);
    playSound("synth");
    
    const items = content.gachaItems;
    if (items.length === 0) {
      setIsGachaDrawing(false);
      return;
    }

    // ロード演出
    setTimeout(() => {
      const drawnList: ShitsumonKobo_GachaItem[] = [];
      const drawOnce = () => {
        // 確率による重みつき抽選
        const totalProb = items.reduce((acc, curr) => acc + curr.probability, 0);
        let rand = Math.random() * totalProb;
        
        for (const item of items) {
          if (rand < item.probability) {
            return item;
          }
          rand -= item.probability;
        }
        return items[items.length - 1]; // 安全弁
      };

      for (let i = 0; i < count; i++) {
        drawnList.push(drawOnce());
      }

      setLastDrawn(drawnList);
      
      // コレクション歴史に積む
      const timestamped = drawnList.map(item => ({
        item,
        id: "draw_" + Math.random().toString(36).substring(2, 9)
      }));
      setGachaHistory(prev => [...timestamped, ...prev].slice(0, 50)); // 最大50件
      
      // 合計ポイントに足す
      setGachaScore(s => s + count * 10);
      setIsGachaDrawing(false);
      playSound("bell");
    }, 800);
  };

  // ---------------- 計算結果診断のパターンの統合 ----------------
  const calculateResult = (): ShitsumonKobo_ResultOption => {
    const finalScores = doAggregateScores();

    // たたきゲームのボーナス
    if (beatTapsScore > 0) {
      if (content.gimmicks?.tapBeatAttributeMultiplier && Object.keys(content.gimmicks.tapBeatAttributeMultiplier).length > 0) {
        Object.entries(content.gimmicks.tapBeatAttributeMultiplier).forEach(([attr, multi]) => {
          if (attr !== 'gacha_point') {
            finalScores[attr] = (finalScores[attr] || 0) + (beatTapsScore * multi);
          }
        });
      } else {
        const key = content.scoringAttributes[0] || "BonusPoints";
        finalScores[key] = (finalScores[key] || 0) + beatTapsScore;
      }
    }

    // 評価
    let matchOptions = content.results.filter(r => {
      const type = r.conditionType || 'threshold';
      
      if (type === 'threshold') {
        const score = finalScores[r.conditionAttribute] || 0;
        return score >= r.conditionScoreMin;
      }
      
      if (type === 'expression' && r.advancedCondition) {
        try {
          let evalStr = r.advancedCondition;
          Object.entries(finalScores).forEach(([k, v]) => {
            evalStr = evalStr.replace(new RegExp(`\\b${k}\\b`, 'g'), v.toString());
          });
          evalStr = evalStr.replace(/[a-zA-Z_]+/g, '0');
          return new Function('return ' + evalStr)();
        } catch(e) {
          return false;
        }
      }

      if (type === 'attribute_order' && r.conditionOrder && r.conditionOrder.length > 0) {
        // 並び順判定
        const sortedAttrs = Object.keys(finalScores).sort((a, b) => finalScores[b] - finalScores[a]);
        // 指定された順序が上位から一致しているか確認
        return r.conditionOrder.every((attr, idx) => sortedAttrs[idx] === attr);
      }

      if (type === 'attribute_sum' && r.conditionSumAttributes && r.conditionSumAttributes.length > 0) {
        const sum = r.conditionSumAttributes.reduce((acc, attr) => acc + (finalScores[attr] || 0), 0);
        return sum >= r.conditionScoreMin;
      }

      return false;
    });

    if (matchOptions.length > 0) {
      // 複数マッチした場合は、thresholdならscoreMinが高い順、他は登録順（最初）を優先する
      const sorted = matchOptions.sort((a, b) => {
        if (a.conditionType === 'threshold' && b.conditionType === 'threshold') {
          return b.conditionScoreMin - a.conditionScoreMin;
        }
        return 0; // 他の条件はそのまま
      });
      return sorted[0];
    }

    // 完全なフォールバック
    return content.results[0] || {
      id: "fallback_result",
      title: "知的好奇心のあふれる探索者 🌟",
      description: "すべてのアライメントが均衡している、とてもユニークな心境を示しています！",
      imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600",
      conditionAttribute: "",
      conditionScoreMin: 0
    };
  };

  const finalResult = isFinished && content.type !== 'survey' ? calculateResult() : null;

  // 終了時にログ保存
  const loadSurveyStats = async () => {
      const logs = await getPlayStats(content.id);
      setSurveyStats(logs);
    };

  useEffect(() => {
    if (isFinished) {
      const saveAndLoad = async () => {
        try {
          await savePlayLog(content.id, content.creatorXHandle, {
            type: content.type,
            scores: scores,
            resultId: finalResult?.id,
            resultTitle: finalResult?.title,
            answers: { ...textAnswers, ...checkboxAnswers, ...sliderAnswers, ...pairingScores }
          });
          
          if (content.type === 'survey' && (content.surveyShowStats !== false)) {
            loadSurveyStats();
          }
        } catch (e) {
          console.error("Play log save failed:", e);
        }
      };
      saveAndLoad();
    }
  }, [isFinished]);

  // ---------------- SNSシェア(X/Twitter) ----------------
  const loadDashboard = async () => {
    const logs = await getPlayStats(content.id);
    setPlayLogs(logs);
    setShowDashboard(true);
  };

  const handleXShare = () => {
    let shareText = "";
    if (content.type === 'survey') {
      shareText = `【しつもん工房 アンケート】\nお題：${content.title}\n回答しました！\n\nみんなも「しつもん工房」で回答してね！`;
    } else {
      if (!finalResult) return;
      shareText = `【しつもん工房 診断発表】\nお題：${content.title}\n結果：${finalResult.title}\n\n${finalResult.description.substring(0, 80)}…\nみんなも「しつもん工房」で自分の個性と繋がって遊んでみよう！`;
    }
    const appUrl = `${window.location.origin}/?id=${content.id}`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(appUrl)}`;
    window.open(shareUrl, "_blank");
  };

  const [copiedLink, setCopiedLink] = useState(false);
  const handleCopyLink = () => {
    const appUrl = `${window.location.origin}/?id=${content.id}`;
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div 
      className={`min-h-[500px] flex flex-col justify-between rounded-3xl border overflow-hidden shadow-xl relative w-full font-sans ${content.themeColorMode === "custom" ? "text-slate-900 border-white/20" : `bg-white/95 text-slate-800 border-white/40 shadow-${season?.textColor?.split("-")[1] || "sky"}-500/10`}`}
      style={content.themeColorMode === 'custom' && content.customColor ? { backgroundColor: content.customColor } : undefined}
    >
      
      
      {/* 🌦 背景エフェクト */}
      {content.gimmicks?.weatherEffect && content.gimmicks.weatherEffect !== 'none' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl opacity-50 z-0">
          {Array.from({ length: 20 }).map((_, i) => (
             <motion.div
               key={i}
               initial={{ y: -50, x: Math.random() * 400 }}
               animate={{ 
                 y: 800, 
                 x: Math.random() * 400 + (Math.random() < 0.5 ? -100 : 100),
                 rotate: Math.random() * 360
               }}
               transition={{ 
                 duration: Math.random() * 3 + 5, 
                 repeat: Infinity, 
                 ease: "linear",
                 delay: Math.random() * 5 
               }}
               className="absolute"
             >
               {content.gimmicks.weatherEffect === 'snow' ? "❄️"
               : content.gimmicks.weatherEffect === 'petals' ? "🌸"
               : content.gimmicks.weatherEffect === 'stars' ? "✨"
               : content.gimmicks.weatherEffect === 'rain' ? <div className="w-0.5 h-6 bg-sky-400 opacity-50 rotate-12"></div>
               : ""}
             </motion.div>
          ))}
        </div>
      )}

      {/* 芋虫ギミックの召喚 */}
      {content.gimmicks.enableLsiCaterpillar && (
        <LsiCaterpillar 
          quotes={content.gimmicks.caterpillarQuotes} 
          squishTarget={content.gimmicks.caterpillarSquishTarget} 
          mascot={content.gimmicks.lsiMascotImageOrEmoji || "🐛"} 
          onTap={() => {
            if (content.gimmicks.caterpillarAttributeMultiplier) {
              setGimmickScores(prev => {
                const next = { ...prev };
                Object.entries(content.gimmicks.caterpillarAttributeMultiplier || {}).forEach(([attr, val]) => {
                  next[attr] = (next[attr] || 0) + Number(val);
                });
                return next;
              });
            }
          }}
          onSquish={() => {
            if (content.gimmicks.caterpillarAttributeMultiplier) {
              setGimmickScores(prev => {
                const next = { ...prev };
                Object.entries(content.gimmicks.caterpillarAttributeMultiplier || {}).forEach(([attr, val]) => {
                  next[attr] = (next[attr] || 0) + (Number(val) * 5); // 潰した時はボーナス5倍
                });
                return next;
              });
            }
          }}
        />
      )}

      {/* ヘッダー */}
      <div className={` ${content.themeColorMode === "custom" ? "bg-black/10" : season?.accentBg || "bg-sky-50/80"} px-6 py-4 border-b border-white/20 flex justify-between items-center flex-shrink-0 z-10 backdrop-blur-md`}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-sky-500/10 text-sky-600 font-bold px-2 py-0.5 rounded border border-sky-500/20">
            {content.type === 'diagnostic' ? '🔮 診断' : content.type === 'quiz' ? '🎯 クイズ' : content.type === 'survey' ? '📊 アンケート' : '🎁 ガチャ'}
          </span>
          <h3 className="text-md font-bold text-slate-900 tracking-tight leading-none">
            {content.title}
          </h3>
        </div>
        <button 
          onClick={onClose}
          className="text-xs bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 px-3.5 py-1.5 rounded-lg border border-slate-200 transition-colors shadow-sm cursor-pointer animate-fade-in"
        >
          ぬける
        </button>
      </div>

      {/* メインプレイグラウンド */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col justify-center space-y-6">
        
        {/* =============== 未スタートの説明画面 =============== */}
        {!isStarted && !isFinished && (
          <div className="max-w-xl mx-auto w-full space-y-6 text-center animate-fade-in">
            
            {/* ガチャと診断等でイラスト分け */}
            <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-2xl mx-auto flex items-center justify-center border border-teal-100">
              {content.type === 'gacha' ? <Ticket size={40} className="animate-bounce" /> : <Milestone size={40} />}
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{content.title}</h1>
              <p className="text-slate-400 text-xs font-mono leading-none flex items-center justify-center gap-2">
                作成者: {content.creatorName || "名無しの職人"}
                {content.creatorXHandle && (
                  <a href={`https://x.com/${content.creatorXHandle}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-slate-400 hover:text-sky-500 bg-slate-100 px-2 py-1 rounded-full transition-colors text-[10px]" onClick={(e) => e.stopPropagation()}>
                    <X size={10} /> {content.creatorXHandle}
                  </a>
                )}
              </p>
            </div>

            <div className="bg-sky-50/40 border border-sky-100/70 rounded-2xl p-5 text-sm text-slate-600 leading-relaxed text-left">
              {content.description || "このしつもんに対する説明はありません。早速はじめて、個性に触れてみましょう！"}
            </div>



            <div className="pt-2">
              <button
                onClick={handleStart}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm px-8 py-3.5 rounded-2xl shadow-md border border-emerald-400/20 active:scale-95 transition-all text-center tracking-wide inline-flex items-center gap-1.5 cursor-pointer"
              >
                しつもんを解きにいく！ <ArrowRight size={16} />
              </button>
            
      </div>
          </div>
        )}

        {/* =============== 回報進行中の画面 =============== */}
        {isStarted && !isFinished && content.type !== 'gacha' && (
          <div className="max-w-xl mx-auto w-full space-y-6">
            
            {/* 進捗プログレス */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>PROGRESS: {currentIdx + 1} / {playQuestions.length}</span>
                <span>{Math.round(((currentIdx) / playQuestions.length) * 100)}% 完了</span>
              </div>
              <div className="w-full h-1.5 bg-sky-100 rounded-full overflow-hidden">
                <div 
                  className="bg-sky-500 h-full transition-all duration-300"
                  style={{ width: (((currentIdx) / playQuestions.length) * 100) + '%' }}
                />
              </div>
            </div>

            {/* たたきゲームのインクルード (ON設定のみ) */}
            {content.gimmicks.enableTapBeat && (
              <TapBeatGame 
                emojis={content.gimmicks.tapBeatEmojis} 
                onScoreGained={(pts) => {
                  setBeatTapsScore(s => s + (content.type === 'gacha' && content.gimmicks.tapBeatGachaPoints ? content.gimmicks.tapBeatGachaPoints : pts));
                  if (content.gimmicks.tapBeatAttributeMultiplier) {
                    setGimmickScores(prev => {
                      const next = { ...prev };
                      Object.entries(content.gimmicks.tapBeatAttributeMultiplier || {}).forEach(([attr, val]) => {
                        next[attr] = (next[attr] || 0) + Number(val);
                      });
                      return next;
                    });
                  }
                }} 
                soundType={content.gimmicks.tapBeatSoundType}
              />
            )}

            {/* 質問本体カード */}
            <div className="bg-white border border-sky-100/80 rounded-3xl p-6 md:p-8 space-y-5 shadow-sm relative">
              <h2 className="text-lg font-bold text-slate-900 leading-relaxed select-text">
                {currentQ.text}
              </h2>

              {/* 1. リカート5択 */}
              {currentQ.type === 'five_choices' && (
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex justify-between text-[10px] text-sky-500 font-sans px-2">
                    <span>そう思わない</span>
                    <span>そう思う</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 md:gap-2">
                    {currentQ.choices.map((choice, cIdx) => {
                      const isSelected = textAnswers[currentQ.id] === choice.id;
                      return (
                        <button
                          key={choice.id}
                          onClick={() => handleRadioSelect(choice.id)}
                          className={`py-2 px-1 rounded-xl border text-[9px] md:text-xs font-bold text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[80px] md:min-h-[90px] leading-tight select-none ${
                            isSelected 
                              ? "bg-sky-550 bg-sky-500 border-sky-400 text-white shadow-md scale-102" 
                              : "bg-white border-sky-100 text-slate-600 hover:bg-sky-50 hover:border-sky-300"
                          }`}
                        >
                          <div className="text-[10px] md:text-xs font-black opacity-80 mb-0.5">{cIdx + 1}</div>
                          <div className="w-full text-center whitespace-normal break-all line-clamp-3 overflow-hidden px-0.5">
                            {choice.text}
                          </div>
                        </button>
                      );
                    })}
                  
      </div>
                </div>
              )}

              
              {/* ドロップダウン (プルダウン選択) */}
              {currentQ.type === 'dropdown' && (
                <div className="pt-2">
                  <select
                    value={textAnswers[currentQ.id] || ''}
                    onChange={(e) => {
                      setTextAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }));
                      playSound("bloop");
                    }}
                    className="w-full py-4 px-4 rounded-xl border border-sky-100 bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer appearance-none shadow-sm"
                  >
                    <option value="" disabled>項目を選択してください</option>
                    {currentQ.choices.map((choice) => (
                      <option key={choice.id} value={choice.id}>{choice.text}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 2. 通常ラジオボタン (単一選択) */}
              {currentQ.type === 'radio' && (
                <div className="flex flex-col gap-2.5 pt-2">
                  {currentQ.choices.map((choice) => {
                    const isSelected = textAnswers[currentQ.id] === choice.id;
                    return (
                      <button
                        key={choice.id}
                        onClick={() => handleRadioSelect(choice.id)}
                        className={`w-full py-3 px-4 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? "bg-sky-50 border-sky-400 text-sky-700" 
                            : "bg-white border-sky-100 text-slate-600 hover:bg-sky-50"
                        }`}
                      >
                        <span>{choice.text}</span>
                        {isSelected && <Check size={16} className="text-sky-500" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 3. 複数選択 (チェックボックス) */}
              {currentQ.type === 'checkbox' && (
                <div className="flex flex-col gap-2.5 pt-2">
                  {currentQ.choices.map((choice) => {
                    const cAns = checkboxAnswers[currentQ.id] || {};
                    const isSelected = !!cAns[choice.id];
                    return (
                      <button
                        key={choice.id}
                        onClick={() => handleCheckboxChange(choice.id, !isSelected)}
                        className={`w-full py-3 px-4 rounded-xl border text-xs font-semibold text-left transition-all flex items-center gap-3 cursor-pointer ${
                          isSelected 
                            ? "bg-sky-50 border-sky-400 text-sky-700" 
                            : "bg-white border-sky-100 text-slate-600 hover:bg-sky-50"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-sky-500 border-sky-500' : 'border-slate-300'}`}>
                          {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <span>{choice.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 4. スライダー */}
              {currentQ.type === 'slider' && (
                <div className="space-y-4 pt-3">
                  <div className="flex justify-between text-xs text-slate-500 font-bold">
                    <span>{currentQ.sliderLeftLabel}</span>
                    <span>{currentQ.sliderRightLabel}</span>
                  </div>
                  <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100">
                    <input
                      type="range"
                      min={currentQ.sliderMin}
                      max={currentQ.sliderMax}
                      step={currentQ.sliderStep}
                      value={sliderAnswers[currentQ.id] ?? currentQ.sliderMin}
                      onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="text-center font-mono font-bold text-lg text-emerald-600 mt-2">
                      現在の度合い: {sliderAnswers[currentQ.id] ?? currentQ.sliderMin}
                    </div>
                  
      </div>
                </div>
              )}

              {/* 5. 部分一致文字記述式判定 */}
              {currentQ.type === 'text' && (
                <div className="space-y-2 pt-2">
                  <textarea
                    rows={3}
                    value={textAnswers[currentQ.id] || ""}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder="ここに自由にテキストを打ち込んでね（例：好き、がっかり等）"
                    className="w-full bg-white border border-sky-100 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                  <div className="text-right text-[10px] text-slate-400">
                    字数: {(textAnswers[currentQ.id] || "").length} 字
                  
      </div>
                </div>
              )}

              {/* 6. 線つなぎペア引き */}
              {currentQ.type === 'pairing' && (
                <div className="pt-2">
                  <PairingGame 
                    items={currentQ.pairItems} 
                    onComplete={handlePairingGameComplete}
                  />
                </div>
              )}

              {/* フッターアクション (もどる・スキップ・決定して次へ の完璧なナビゲーション) */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center pt-5 border-t border-sky-100 select-none">
                {/* 左：もどるボタン */}
                <div className="flex-1 flex justify-start">
                  {currentIdx > 0 ? (
                    <button
                      onClick={goToPrev}
                      className="w-full sm:w-auto text-xs bg-white border border-sky-100 hover:bg-sky-50/50 hover:text-sky-600 text-slate-500 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      ← 前のしつもんに戻る
                    </button>
                  ) : (
                    <div className="hidden sm:block w-3" />
                  )}
                </div>

                {/* 中央：スキップ（わからない）ボタン */}
                <div className="flex justify-center">
                  {currentQ.skipEnabled ? (
                    <button
                      onClick={handleSkip}
                      className="w-full sm:w-auto text-xs bg-white hover:bg-sky-50 border border-sky-100/60 text-slate-400 hover:text-slate-500 py-2.5 px-4 rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-sm"
                    >
                      <HelpCircle size={13} /> わからない (スキップする)
                    </button>
                  ) : (
                    <div className="hidden sm:block w-3" />
                  )}
                </div>

                {/* 右：次へ / 決定ボタン */}
                <div className="flex-1 flex justify-end">
                  {(() => {
                    // 回答済みチェック
                    let isAnswered = false;
                    if (currentQ.type === 'five_choices' || currentQ.type === 'radio') {
                      isAnswered = !!textAnswers[currentQ.id];
                    } else if (currentQ.type === 'checkbox') {
                      isAnswered = Object.values(checkboxAnswers[currentQ.id] || {}).some(val => val === true);
                    } else if (currentQ.type === 'slider' || currentQ.type === 'pairing') {
                      isAnswered = true; // 常に値がある or ペアゲーム
                    } else if (currentQ.type === 'text') {
                      isAnswered = !!(textAnswers[currentQ.id] || "").trim();
                    }

                    // スキップ無効で、未回答の場合は入力を促す
                    const isProceedDisabled = !isAnswered && !currentQ.skipEnabled;

                    return (
                      <button
                        disabled={isProceedDisabled}
                        onClick={proceedWithFeedbackCheck}
                        className={`w-full sm:w-auto text-xs font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${
                          isProceedDisabled
                            ? "bg-slate-50 border border-slate-205 border-slate-205 border-slate-200 text-slate-400 cursor-not-allowed"
                            : "bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-101 border border-emerald-400/20"
                        }`}
                      >
                        {isProceedDisabled ? (
                          <span>どれか選択すると、次へ進めます</span>
                        ) : (
                          <>
                            <span>決定して、次へ進む</span>
                            <ArrowRight size={13} />
                          </>
                        )}
                      </button>
                    );
                  })()}
                </div>
              </div>
            
      </div>
          </div>
        )}

        {/* =============== ガチャ用の専用画面 =============== */}
        {isStarted && !isFinished && content.type === 'gacha' && (
          <div className="max-w-2xl mx-auto w-full space-y-6 animate-fade-in">
            
            {/* たたきゲームのインクルード (ON設定のみ：ガチャでもたたけると最高！) */}
            {content.gimmicks.enableTapBeat && (
              <TapBeatGame 
                emojis={content.gimmicks.tapBeatEmojis} 
                onScoreGained={(pts) => {
                  setBeatTapsScore(s => s + (content.type === 'gacha' && content.gimmicks.tapBeatGachaPoints ? content.gimmicks.tapBeatGachaPoints : pts));
                  if (content.gimmicks.tapBeatAttributeMultiplier) {
                    setGimmickScores(prev => {
                      const next = { ...prev };
                      Object.entries(content.gimmicks.tapBeatAttributeMultiplier || {}).forEach(([attr, val]) => {
                        next[attr] = (next[attr] || 0) + Number(val);
                      });
                      return next;
                    });
                  }
                }} 
                soundType={content.gimmicks.tapBeatSoundType}
              />
            )}

            {/* ガチャ引きコントローラ */}
            <div className="bg-white border border-sky-100 rounded-3xl p-6 text-center space-y-6 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.06)_0%,transparent_60%)]" />
              
              <div className="space-y-1.5 flex flex-col items-center z-10 relative">
                <span className="text-xs bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full font-bold inline-block">
                  🏛️ しつもんガチャの台
                </span>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto mt-2">
                  「ガチャを引く」を叩くと、確率に応じた景品がセリフ付きで一気に飛び出すよ！
                </p>
                {beatTapsScore > 0 && (
                  <div className="text-xs text-emerald-500 font-bold animate-pulse mt-2">
                    現在のあそび成果: {beatTapsScore} pt
                  </div>
                )}
              </div>

              {/* 引きボタン */}
              <div className="flex gap-4 justify-center z-10 relative">
                <button
                  disabled={isGachaDrawRef}
                  onClick={() => drawGacha(1)}
                  className="bg-sky-500 hover:bg-sky-600 text-white font-black text-sm px-6 py-3 rounded-2xl flex items-center gap-1 border border-sky-400/20 hover:scale-103 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-lg"
                >
                  <Ticket size={16} /> 1回引く {content.gimmicks.enableTapBeat ? '(10pt)' : '(無料)'}
                </button>
                <button
                  disabled={isGachaDrawRef}
                  onClick={() => drawGacha(10)}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-sm px-7 py-3 rounded-2xl flex items-center gap-1 border border-amber-400/20 hover:scale-103 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-lg"
                >
                  <Sparkles size={16} /> 10連ガチャ {content.gimmicks.enableTapBeat ? '(100pt)' : ''}
                </button>
              </div>

              {/* 描画アニメーション */}
              <AnimatePresence>
                {isGachaDrawRef && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: [0.8, 1.05, 1] }}
                    exit={{ opacity: 0 }}
                    className="p-10 bg-white border border-sky-100 rounded-2xl flex flex-col items-center justify-center space-y-3 z-30 shadow-md"
                  >
                    <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-sky-600 font-bold animate-pulse">
                      ピカピカキラキラ！ポコッポコッ！
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 引き当て結果の一覧 */}
              {!isGachaDrawRef && lastDrawn.length > 0 && (
                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-500 border-b border-sky-100/80 pb-2">🎉 今回引き当てたお宝</div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-h-[250px] overflow-y-auto p-1">
                    {lastDrawn.map((itm, iidx) => {
                      // レア度別のカラー
                      const badgeColor = 
                        itm.rarity === 'UR' ? 'bg-rose-500 text-white' :
                        itm.rarity === 'SSR' ? 'bg-amber-400 text-slate-800' : 
                        itm.rarity === 'SR' ? 'bg-fuchsia-500 text-white' : 
                        itm.rarity === 'R' ? 'bg-sky-500 text-white' : 'bg-slate-500 text-white';
                        
                      return (
                        <motion.div
                          key={`drawn-${iidx}`}
                          onClick={() => { playSound("bloop"); setSelectedGachaItem(itm); }}
                          initial={{ opacity: 0, y: 15, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: iidx * 0.05 }}
                          className={`p-3 rounded-xl bg-white border flex flex-col items-center justify-between text-center relative shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-transform ${
                            ['UR', 'SSR'].includes(itm.rarity) ? 'border-amber-300 ring-2 ring-amber-300/30 bg-amber-50/10' : 'border-sky-100 hover:border-sky-300'
                          }`}
                        >
                          <span className={`absolute top-1 text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none scale-90 shadow-sm ${badgeColor}`}>
                            {itm.rarity}
                          </span>
                          
                          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 my-1 mt-3">
                            {itm.imageUrlOrEmoji.startsWith("http") ? (
                              <img src={itm.imageUrlOrEmoji} alt="" className="w-10 h-10 object-contain rounded" />
                            ) : (
                              <span className="text-2xl">{itm.imageUrlOrEmoji || "🎁"}</span>
                            )}
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-800 line-clamp-1">{itm.name}</span>
                            <span className="text-[8px] text-slate-500 block">確率: {itm.probability}%</span>
                          </div>

                          {itm.dialogue && (
                            <div className="mt-1 text-[8px] text-slate-600 font-mono italic p-1 bg-slate-50 rounded leading-tight w-full line-clamp-2 border border-slate-100" title={itm.dialogue}>
                              {itm.dialogue}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  
      </div>
                </div>
              )}
            </div>

            {/* お持ち帰り履歴図鑑 */}
            {gachaHistory.length > 0 && (
              <div className="bg-white/80 border border-sky-100 p-4 rounded-xl space-y-2 shadow-sm">
                <span className="text-xs font-bold text-slate-600 block">📜 ガチャ入手履歴図鑑 (最大50件保存中):</span>
                <div className="flex flex-wrap gap-2 max-h-[85px] overflow-y-auto p-1">
                  {gachaHistory.map((hist) => (
                    <span 
                      key={hist.id} 
                      onClick={() => { playSound("bloop"); setSelectedGachaItem(hist.item); }}
                      className="bg-white border border-slate-200 text-[10px] px-2.5 py-1 rounded-full text-slate-600 flex items-center gap-1 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
                      title={hist.item.dialogue}
                    >
                      <span>{hist.item.imageUrlOrEmoji.startsWith("http") ? "🖼️" : hist.item.imageUrlOrEmoji}</span>
                      <strong className="text-slate-800">{hist.item.name.substring(0, 8)}</strong>
                      <span className="text-[8px] text-slate-500">{hist.item.rarity}</span>
                    </span>
                  ))}
                
      </div>
              </div>
            )}
          </div>
        )}

        {/* =============== 回答終了の結果画面 =============== */}
        
        {/* =============== アンケートの専用終了画面 =============== */}
        {isFinished && content.type === 'survey' && (
          <div className="max-w-2xl mx-auto w-full space-y-6">
            <div className="bg-white border border-sky-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden text-center">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 via-emerald-400 to-sky-400" />
              
              <div className="space-y-2">
                <div className="text-sm font-bold text-teal-600 bg-teal-50 inline-block px-3 py-1 rounded-full border border-teal-100">
                  ご協力ありがとうございました！
                </div>
                <h3 className="text-2xl font-black text-slate-800">
                  アンケート完了
                </h3>
              </div>

              <div className="text-sm text-slate-600">
                あなたの回答が送信されました。ご協力ありがとうございます。
              </div>

              {(content.surveyShowStats !== false) && (
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left space-y-4">
                  <h4 className="font-bold text-slate-700 text-sm text-center">📊 現在の投票率</h4>
                  
                  {(!surveyStats) ? (
                    <div className="text-center text-slate-500 text-xs py-4">
                      集計中...
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {content.questions.filter(q => q.type === 'radio' || q.type === 'checkbox' || q.type === 'five_choices' || q.type === 'dropdown').map(q => {
                        const counts: Record<string, number> = {};
                        let totalAnswers = 0;

                        q.choices?.forEach(c => counts[c.id] = 0);

                        // DB fetch might take a moment, or DB might be empty.
                        // If we have surveyStats from DB, use them. Since we just saved our answer, it might be in there.
                        // To prevent complete emptiness, if surveyStats is empty, use currentAnswerObj.
                        const currentAnswerObj = {
                          answers: { ...textAnswers, ...checkboxAnswers, ...sliderAnswers, ...pairingScores }
                        };
                        const allStats = surveyStats && surveyStats.length > 0 ? surveyStats : [currentAnswerObj];
                        
                        allStats.forEach(log => {
                          const ans = log.answers?.[q.id];
                          if (ans) {
                            if (q.type === 'radio' || q.type === 'five_choices' || q.type === 'dropdown' || typeof ans === 'string') {
                              if (counts[ans] !== undefined) counts[ans]++;
                              totalAnswers++;
                            } else if (q.type === 'checkbox' || typeof ans === 'object') {
                              let answered = false;
                              Object.entries(ans).forEach(([cId, val]) => {
                                if (val && counts[cId] !== undefined) {
                                  counts[cId]++;
                                  answered = true;
                                }
                              });
                              if (answered) totalAnswers++;
                            }
                          }
                        });

                        if (totalAnswers === 0) return null;

                        return (
                          <div key={q.id} className="space-y-3">
                            <h5 className="text-xs font-bold text-slate-700 text-left border-b border-slate-200 pb-1">{q.text}</h5>
                            <div className="space-y-2">
                              {q.choices?.map(c => {
                                const count = counts[c.id] || 0;
                                const percent = Math.round((count / totalAnswers) * 100);
                                return (
                                  <div key={c.id} className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold text-slate-600">
                                      <span>{c.text}</span>
                                      <span>{percent}% ({count}票)</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                      <div className="h-full bg-teal-400" style={{ width: `${percent}%` }} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6">
                <button
                  onClick={resetPlay}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all shadow-sm border border-slate-200 cursor-pointer text-sm w-full sm:w-auto flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={14} /> もう一度回答する
                </button>
                <button
                  onClick={handleCopyLink}
                  className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all shadow-sm border border-sky-200 cursor-pointer text-sm w-full sm:w-auto flex items-center justify-center gap-1.5"
                >
                  <Ticket size={14} /> {copiedLink ? "コピーしました！" : "URLをコピーする"}
                </button>
                <button
                  onClick={handleXShare}
                  className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer text-sm w-full sm:w-auto flex items-center justify-center gap-1.5"
                >
                  <Share2 size={14} /> Xでシェアする
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =============== 回答終了の結果画面 =============== */}
        {isFinished && finalResult && content.type !== 'survey' && (
          <div className="max-w-2xl mx-auto w-full space-y-6">
            <div className="bg-white border border-sky-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden text-center">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 via-sky-400 to-indigo-400" />
              
              <div className="space-y-1">
                <span className="text-[10px] bg-teal-50 text-teal-600 border border-teal-100 px-3 py-1 rounded-full font-bold inline-block font-mono">
                  ✨ しつもん工房 測定完了 ✨
                </span>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight pt-1 leading-tight">
                  {finalResult.title}
                </h1>
              </div>

              {/* 結果メインイメージ */}
              {finalResult.imageUrl && (
                <div className="h-[220px] md:h-[260px] w-full rounded-2xl overflow-hidden border border-sky-100 relative shadow-inner">
                  <img 
                    src={finalResult.imageUrl} 
                    alt={finalResult.title} 
                    className="w-full h-full object-cover select-none" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white/80 to-transparent" />
                </div>
              )}

              {/* 解説テキスト */}
              <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-6 text-sm text-slate-700 leading-relaxed text-left space-y-4 max-w-xl mx-auto shadow-sm">
                <p className="whitespace-pre-wrap select-text font-sans">
                  {finalResult.description}
                </p>

                {/* 採点詳細グラフメーター (みつき流属性別表示) */}
                <div className="pt-2 border-t border-sky-200/50 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block font-mono">
                    📊 集計されたあなたの各パラメータ詳細：
                  </span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {content.scoringAttributes.map((attr, idx) => {
                      const finalScore = scores[attr] || 0;
                      return (
                        <div key={attr} className="bg-white p-2 rounded-lg border border-sky-100 shadow-sm">
                          <div className="flex justify-between text-[10px] text-slate-600 font-bold mb-1">
                            <span>{attr}</span>
                            <span className="font-mono text-teal-600 text-xs">
                              {finalScore > 0 ? `+${finalScore}` : finalScore}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-sky-50 rounded-full overflow-hidden">
                            <div 
                              className="bg-sky-400 h-full rounded-full" 
                              style={{ width: `${Math.min(Math.max((finalScore + 5) * 10, 5), 100)}%` }} // 最小補正
                            />
                          
      </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex flex-wrap gap-3 justify-center select-none">
                <button
                  onClick={handleStart}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-6 py-3 rounded-xl border border-sky-200 flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer w-full sm:w-auto"
                >
                  <RotateCcw size={13} /> もう一度しつもんを解く
                </button>
                <button
                  onClick={handleCopyLink}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-6 py-3 rounded-xl border border-sky-200 flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer w-full sm:w-auto"
                >
                  <Ticket size={13} /> {copiedLink ? "URLをコピーしました！" : "URLをコピー"}
                </button>
                <button
                  onClick={handleXShare}
                  className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer w-full sm:w-auto"
                >
                  <Share2 size={13} /> 結果をXに投稿する
                </button>
              </div>
            
      </div>
          </div>
        )}

      </div>

      {/* フッター */}
      <div className={` ${content.themeColorMode === "custom" ? "bg-black/10" : season?.accentBg || "bg-sky-50/80"} px-6 py-4 flex-shrink-0 border-t border-white/20 flex justify-between items-center text-xs ${season?.textColor || "text-slate-500"} z-10 select-none backdrop-blur-md`}>
        <span>みんなの遊び場「しつもん工房」 © 制作室</span>
        {isStarted && !isFinished && content.type !== 'gacha' && (
          <span className="font-mono text-[10px] text-slate-400">
            問題: {currentIdx + 1}/{playQuestions.length}
          </span>
        )}
      </div>

      {/* ガチャ拡大モーダル */}
      <AnimatePresence>
        {selectedGachaItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSelectedGachaItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative text-center border border-sky-100 flex flex-col items-center gap-4 max-h-[85vh] overflow-y-auto scrollbar-thin"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-4 right-4 cursor-pointer text-slate-400 hover:text-slate-600 font-bold p-2 text-sm" onClick={() => setSelectedGachaItem(null)}>
                ✕
              </div>
              
              <span className={`text-[10px] font-black px-3 py-1 rounded-full shadow-sm text-white flex-shrink-0 ${
                  selectedGachaItem.rarity === 'UR' ? 'bg-rose-500' :
                  selectedGachaItem.rarity === 'SSR' ? 'bg-amber-400 text-slate-800' : 
                  selectedGachaItem.rarity === 'SR' ? 'bg-fuchsia-500' : 
                  selectedGachaItem.rarity === 'R' ? 'bg-sky-500' : 'bg-slate-500'
                }`}>
                {selectedGachaItem.rarity}
              </span>

              <div className="w-28 h-28 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 shadow-inner flex-shrink-0">
                {selectedGachaItem.imageUrlOrEmoji.startsWith("http") ? (
                  <img src={selectedGachaItem.imageUrlOrEmoji} alt="" className="w-20 h-20 object-contain rounded-xl" />
                ) : (
                  <span className="text-5xl">{selectedGachaItem.imageUrlOrEmoji || "🎁"}</span>
                )}
              </div>

              <div className="space-y-1 w-full flex-shrink-0">
                <h3 className="text-lg font-bold text-slate-800 break-all">{selectedGachaItem.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold">排出確率: {selectedGachaItem.probability}%</p>
              </div>

              {selectedGachaItem.dialogue && (
                <div className="w-full bg-sky-50 border border-sky-100 p-4 rounded-2xl text-slate-700 text-xs font-semibold leading-relaxed shadow-sm text-left max-h-[160px] overflow-y-auto whitespace-pre-wrap break-all">
                  「{selectedGachaItem.dialogue}」
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    
      {/* ランダム遭遇イベント */}
      <AnimatePresence>
        {showSecretLetter && !secretLetterOpened && (
          <motion.div 
            initial={{ y: -100, opacity: 0, rotate: -10 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 100, opacity: 0, scale: 0.5 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-white border border-rose-200 shadow-xl rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer w-64 text-center"
            onClick={() => {
              playSound("bell");
              setSecretLetterOpened(true);
              setShowSecretLetter(false);
              if (content.gimmicks.secretLetterAttributeMultiplier) {
                setGimmickScores(prev => {
                  const next = { ...prev };
                  Object.entries(content.gimmicks.secretLetterAttributeMultiplier || {}).forEach(([attr, val]) => {
                    next[attr] = (next[attr] || 0) + Number(val);
                  });
                  return next;
                });
              }
              // Show modal or just alert for simplicity, wait, let's show an alert for now or a feedback modal
              setFeedbackModal({ 
                show: true, 
                type: 'survey', 
                mockStats: undefined, 
                explanation: content.gimmicks.secretLetterText || "手紙を読みました！ポイントが加算されたよ！",
                isCorrect: true // Just a visual styling
              });
            }}
          >
            <div className="text-4xl">✉️</div>
            <div className="text-sm font-bold text-slate-700">謎の手紙が落ちてきた！</div>
            <div className="text-[10px] text-slate-400">タップして開ける</div>
          </motion.div>
        )}
        
        {showEncounter && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 flex items-center gap-4 cursor-pointer"
            onClick={() => { setShowEncounter(false); playSound("synth"); }}
          >
            <div className="text-4xl animate-bounce">
              {(content.gimmicks?.randomEventEmojiOrImage || "🐱").startsWith("http") ? (
                <img src={content.gimmicks.randomEventEmojiOrImage} alt="" className="w-10 h-10 object-contain" />
              ) : (
                content.gimmicks?.randomEventEmojiOrImage || "🐱"
              )}
            </div>
            <div className="text-sm font-bold text-slate-700">
              {content.gimmicks?.randomEventText || "猫が現れた！"}
              <br/><span className="text-[10px] text-slate-400 font-normal">特に意味はないようだ… (タップで閉じる)</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
