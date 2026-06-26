import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { playSound } from "./SoundEngine";

interface TapItem {
  id: string;
  emoji: string;
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  size: number;
}

interface ClickPop {
  id: string;
  x: number;
  y: number;
  score: number;
}

interface TapBeatGameProps {
  emojis?: string[];
  onScoreGained: (points: number) => void;
  soundType?: 'bell' | 'synth' | 'bloop' | 'kick';
}

export default function TapBeatGame({
  emojis = ["🐱", "🐸", "🐛", "💡", "💖", "🔥"],
  onScoreGained,
  soundType = "synth",
}: TapBeatGameProps) {
  const [items, setItems] = useState<TapItem[]>([]);
  const [pops, setPops] = useState<ClickPop[]>([]);
  const [totalTaps, setTotalTaps] = useState(0);

  // 1. 初期アイテムの生成
  useEffect(() => {
    const list: TapItem[] = Array.from({ length: 6 }).map((_, i) => ({
      id: `tap_item_${i}_${Date.now()}`,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: Math.random() * 80 + 10, // 10% ~ 90%
      y: Math.random() * 50 + 20, // 20% ~ 70%
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2,
      size: Math.floor(Math.random() * 16) + 32, // 32px ~ 48px
    }));
    setItems(list);
  }, [emojis]);

  // 2. アイテムをふわふわ動かすアニメーションループ
  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) =>
        prev.map((item) => {
          let newX = item.x + item.speedX;
          let newY = item.y + item.speedY;
          let nextSpeedX = item.speedX;
          let nextSpeedY = item.speedY;

          // 壁の衝突判定 %
          if (newX < 5 || newX > 91) {
            nextSpeedX = -item.speedX;
            newX = Math.max(5, Math.min(newX, 91));
          }
          if (newY < 5 || newY > 80) {
            nextSpeedY = -item.speedY;
            newY = Math.max(5, Math.min(newY, 80));
          }

          return {
            ...item,
            x: newX,
            y: newY,
            speedX: nextSpeedX,
            speedY: nextSpeedY,
          };
        })
      );
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // 3. アイテムタップ処理
  const handleItemTap = (itemId: string, event: React.MouseEvent<HTMLDivElement>) => {
    // コンテナ座標
    const rect = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect) return;
    
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // 効果音
    playSound(soundType);

    // ポップアップ数値追加
    const popId = Math.random().toString();
    const addScore = 15; // 得点
    const newPop: ClickPop = {
      id: popId,
      x: clickX,
      y: clickY - 20,
      score: addScore,
    };
    setPops((prev) => [...prev, newPop]);

    // 総タップ数、得点コールバック
    setTotalTaps((t) => t + 1);
    onScoreGained(addScore);

    // タップされた絵文字をリフレッシュ（新しい位置・絵文字でリスポーン）
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            x: Math.random() * 80 + 10,
            y: Math.random() * 50 + 20,
            speedX: (Math.random() - 0.5) * 2.5,
            speedY: (Math.random() - 0.5) * 2.5,
          };
        }
        return item;
      })
    );

    // ポップアップ削除タイマー
    setTimeout(() => {
      setPops((prev) => prev.filter((p) => p.id !== popId));
    }, 850);
  };

  return (
    <div className="relative w-full h-[240px] bg-sky-50/50 backdrop-blur-sm rounded-2xl border border-sky-100 overflow-hidden shadow-inner flex flex-col justify-between p-4 mb-4 select-none">
      <div className="flex justify-between items-center z-10 pointers-events-none">
        <span className="text-xs bg-teal-50 text-teal-600 font-bold border border-teal-100/80 px-3 py-1 rounded-full flex items-center gap-1.5 font-sans">
          🔥 ピコピコたたきゲーム（たたいてスコア加点！）
        </span>
        <span className="text-xs font-mono text-slate-600">
          タップ回数: <strong className="text-teal-600 text-sm">{totalTaps}</strong>
        </span>
      </div>

      {/* ふわふわ浮遊する絵文字 */}
      <div className="absolute inset-0 z-0">
        {items.map((item) => (
          <div
            key={item.id}
            className="absolute select-none cursor-pointer hover:scale-110 active:scale-95 transition-transform drop-shadow"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              fontSize: `${item.size}px`,
              transform: "translate(-50%, -50%)",
            }}
            onMouseDown={(e) => handleItemTap(item.id, e)}
          >
            {item.emoji}
          </div>
        ))}

        {/* タップポップアップ（+15pt等の数字） */}
        <AnimatePresence>
          {pops.map((pop) => (
            <motion.div
              key={pop.id}
              initial={{ opacity: 0.9, scale: 0.5, y: pop.y }}
              animate={{ opacity: 0, scale: 1.4, y: pop.y - 45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute font-sans font-black text-amber-500 pointer-events-none text-base drop-shadow-sm z-30"
              style={{ left: pop.x }}
            >
              +{pop.score}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="text-center text-[11px] text-slate-500 z-10 bg-white/60 py-1.5 rounded-lg border border-sky-100 pointer-events-none font-sans">
        浮遊している絵文字をタップしてスコアを底上げしよう！
      </div>
    </div>
  );
}
