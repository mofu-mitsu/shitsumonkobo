import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { playSound } from "./SoundEngine";

interface LsiCaterpillarProps {
  quotes?: string[];
  squishTarget?: number;
  mascot?: string;
  onSquish?: () => void;
  onTap?: () => void;
}

export default function LsiCaterpillar({
  quotes = ["僕は、感覚と主観的論理の塊なのだ…", "そんなにタップしないでほしい、僕潰れちゃうから…"],
  squishTarget = 30,
  mascot = "🐛",
  onSquish,
  onTap
}: LsiCaterpillarProps) {
  const [posX, setPosX] = useState(110); // 画面右端外側からの位置 (%)
  const [quote, setQuote] = useState<string | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const [isSquished, setIsSquished] = useState(false);
  const quoteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 芋虫をゆっくり左に動かすタイマー
  useEffect(() => {
    if (isSquished) return;

    const interval = setInterval(() => {
      setPosX((prev) => {
        if (prev < -20) {
          return 110; // 左に消えたら右から再登場
        }
        return prev - 0.4; // 速度
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isSquished]);

  // タップされた時の処理
  const handleTap = () => {
    if (isSquished) return;

    playSound("kick");
    const nextCount = tapCount + 1;
    setTapCount(nextCount);

    // ランダムなセリフを表示
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(`${randomQuote} (ちから: ${nextCount}/${squishTarget})`);

    // セリフ表示時間をリセット
    if (quoteTimeoutRef.current) clearTimeout(quoteTimeoutRef.current);
    quoteTimeoutRef.current = setTimeout(() => {
      setQuote(null);
    }, 3000);

    // 規定数タップで潰れる
    if (nextCount >= squishTarget) {
      setIsSquished(true);
      setQuote("💥 ぎゃーーー！潰されたァーー！！！");
      playSound("bell");
      if (onSquish) onSquish();
    } else {
      if (onTap) onTap();
    }
  };

  // 復活するボタン
  const handleRevive = () => {
    setIsSquished(false);
    setTapCount(0);
    setPosX(110);
    setQuote("ふふん、新芽🌿を食べて僕は何度でも蘇るのだ！");
    playSound("synth");
  };

  return (
    <div className="fixed bottom-20 left-0 right-0 h-28 overflow-hidden pointer-events-none z-50">
      <div 
        className="absolute bottom-0 transition-all duration-100 ease-linear pointer-events-auto cursor-pointer flex flex-col items-center"
        style={{ left: `${posX}%` }}
        onClick={handleTap}
        title="LSI芋虫🐛をタップしてみてね！"
      >
        {/* 吹き出し */}
        <AnimatePresence>
          {quote && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.8 }}
              className="mb-2 bg-white/90 backdrop-blur-md border border-sky-100 text-slate-700 rounded-2xl px-4 py-2 text-xs max-w-xs shadow-md whitespace-pre-wrap relative text-center leading-relaxed"
            >
              {quote}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-sky-100 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 芋虫本体・アニメーション */}
        {!isSquished ? (
          <motion.div
            animate={{
              scaleY: [1, 0.8, 1.1, 1],
              x: [0, -5, 2, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
            }}
            className="text-4xl select-none"
          >
            {mascot.startsWith("http") || mascot.startsWith("data:") 
      ? <img src={mascot} className="w-10 h-10 object-contain filter drop-shadow-md" alt="mascot" draggable={false} />
      : mascot}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center pointer-events-auto">
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.5, 0.2], rotate: [0, 90, 180], opacity: [1, 1, 0] }}
              transition={{ duration: 0.5 }}
              className="text-4xl select-none"
            >
              💥💦
            </motion.div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRevive();
              }}
              className="mt-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md cursor-pointer transition-colors"
            >
              🌱 復活させてあげる
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
