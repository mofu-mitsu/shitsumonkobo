import React, { useState, useEffect, useRef } from "react";
import { ShitsumonKobo_PairItem } from "../types";
import { playSound } from "./SoundEngine";

interface PairingGameProps {
  items: ShitsumonKobo_PairItem[];
  onComplete: (score: number) => void;
  readOnly?: boolean;
}

export default function PairingGame({ items, onComplete, readOnly = false }: PairingGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 表示用にシャッフルされた左リストと右リスト
  const [leftList, setLeftList] = useState<ShitsumonKobo_PairItem[]>([]);
  const [rightList, setRightList] = useState<ShitsumonKobo_PairItem[]>([]);

  // 選択・接続の状態
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [selectedRightId, setSelectedRightId] = useState<string | null>(null);
  
  // すでにつなぎ終わった線のマップ `{ [leftId]: rightId }`
  const [connections, setConnections] = useState<Record<string, string>>({});
  
  // ドラッグ/引っ張り中のマウス位置 (コンテナ座標系)
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrentPos, setDragCurrentPos] = useState<{ x: number; y: number } | null>(null);

  // 各リスト要素の位置キャッシュ (線を描くため)
  const [elementPositions, setElementPositions] = useState<Record<string, { x: number; y: number }>>({});

  // 1. 各要素をシャッフルして配置 (初期化)
  useEffect(() => {
    if (items.length === 0) return;
    
    // ディープコピーしてシャッフル
    const left = [...items].sort(() => Math.random() - 0.5);
    const right = [...items].sort(() => Math.random() - 0.5);
    
    setLeftList(left);
    setRightList(right);
    setConnections({});
    setSelectedLeftId(null);
    setSelectedRightId(null);
  }, [items]);

  // 2. ウィンドウサイズ変更時にエレメントの座標を再計算
  const updatePositions = () => {
    if (!containerRef.current) return;
    const svgElement = containerRef.current.querySelector('svg');
    const baseRect = svgElement ? svgElement.getBoundingClientRect() : containerRef.current.getBoundingClientRect();
    const newPos: Record<string, { x: number; y: number }> = {};

    // 左側のドット位置を取得
    leftList.forEach((item) => {
      const el = document.getElementById(`dot-left-${item.id}`);
      if (el) {
        const r = el.getBoundingClientRect();
        newPos[`left-${item.id}`] = {
          x: r.left + r.width / 2 - baseRect.left,
          y: r.top + r.height / 2 - baseRect.top
        };
      }
    });

    // 右側のドット位置を取得
    rightList.forEach((item) => {
      const el = document.getElementById(`dot-right-${item.id}`);
      if (el) {
        const r = el.getBoundingClientRect();
        newPos[`right-${item.id}`] = {
          x: r.left + r.width / 2 - baseRect.left,
          y: r.top + r.height / 2 - baseRect.top
        };
      }
    });

    setElementPositions(newPos);
  };

  useEffect(() => {
    // 初回・状態変更時に複数タイミングで遅延実行し、描画を安定させる
    const timer1 = setTimeout(updatePositions, 50);
    const timer2 = setTimeout(updatePositions, 200);
    const timer3 = setTimeout(updatePositions, 1000);

    window.addEventListener("resize", updatePositions);

    // ResizeObserverをセットアップしてコンテナサイズ変更に自動追随する
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        updatePositions();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener("resize", updatePositions);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [leftList, rightList, connections]);

  // 左側のノードクリック
  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    if (readOnly) return;
    playSound("synth");
    
    // すでにその左ノードから線が伸びていたら、削除して再接続できるようにする
    if (connections[id]) {
      const newConns = { ...connections };
      delete newConns[id];
      setConnections(newConns);
    }
    
    setSelectedLeftId(id);
    setSelectedRightId(null);

    // ポインターをキャプチャして要素外でも追従できるようにする
    const target = e.target as HTMLElement;
    target.setPointerCapture(e.pointerId);

    // ドラッグのための初期位置を設定
    if (containerRef.current) {
      const svgElement = containerRef.current.querySelector('svg');
      const baseRect = svgElement ? svgElement.getBoundingClientRect() : containerRef.current.getBoundingClientRect();
      const pos = {
        x: e.clientX - baseRect.left,
        y: e.clientY - baseRect.top
      };
      setDragStartPos(pos);
      setDragCurrentPos(pos);
    }
  };

  // 右側のノードクリックで接続
  const handleRightClick = (id: string) => {
    if (readOnly || !selectedLeftId) return;

    // もし右側が他の左側と接続済みなら、その接続を解除
    const updatedConns = { ...connections };
    Object.keys(updatedConns).forEach((lId) => {
      if (updatedConns[lId] === id) {
        delete updatedConns[lId];
      }
    });

    updatedConns[selectedLeftId] = id;
    setConnections(updatedConns);
    
    // 正否判定
    if (selectedLeftId === id) {
      // 絵文字とラベルが一致している（正しいペアである）
      playSound("bell");
    } else {
      playSound("bloop");
    }

    setSelectedLeftId(null);
    setSelectedRightId(null);
    setDragStartPos(null);
    setDragCurrentPos(null);

    // 全て接続されたらトリガー
    const totalConnected = Object.keys(updatedConns).length;
    if (totalConnected === items.length) {
      let correctCount = 0;
      Object.entries(updatedConns).forEach(([lId, rId]) => {
        if (lId === rId) correctCount++;
      });
      // 1ペアにつき25pt (満点100pt目安)
      const finalScore = Math.round((correctCount / items.length) * 100);
      onComplete(finalScore);
    }
  };

  // マウス/タッチ移動中の線引っ張りトレース
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!selectedLeftId || !dragStartPos || !containerRef.current) return;
    const svgElement = containerRef.current.querySelector('svg');
    const baseRect = svgElement ? svgElement.getBoundingClientRect() : containerRef.current.getBoundingClientRect();
    setDragCurrentPos({
      x: e.clientX - baseRect.left,
      y: e.clientY - baseRect.top
    });
  };

  // マウス/タッチを離してキャンセル、または接続
  const handlePointerUp = (e: React.PointerEvent) => {
    if (selectedLeftId && dragCurrentPos) {
      // release pointer capture
      const target = e.target as HTMLElement;
      if (target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
      }
      
      const element = document.elementFromPoint(e.clientX, e.clientY);
      
      const rightNode = element?.closest('[data-right-id]');
      if (rightNode) {
        const rightId = rightNode.getAttribute('data-right-id');
        if (rightId) {
          handleRightClick(rightId);
          return; // handleRightClick clears the drag state
        }
      }
    }
    // 直接的なドラッグ完了はクリックイベントでハンドリングすることが多いが、
    // ドラッグ追従線を消す（接続しなかった場合）のためにリリースでリセット
    setDragStartPos(null);
    setDragCurrentPos(null);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-lg mx-auto bg-white/95 backdrop-blur-md rounded-3xl border border-sky-100 p-6 select-none shadow-xl shadow-sky-100/40"
      style={{ touchAction: 'none' }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-bold text-cyan-800 font-sans">
          🎯 ドラッグして、ぴったりの関係を「線」でつなごう！
        </h4>
        <button
          onClick={() => {
            setConnections({});
            setSelectedLeftId(null);
            setSelectedRightId(null);
            playSound("synth");
          }}
          className="text-xs bg-sky-50 text-cyan-800 font-bold px-3 py-1.5 rounded-xl border border-sky-100 hover:bg-sky-100 active:scale-95 transition-all cursor-pointer"
        >
          リセット
        </button>
      </div>

      <div className="grid grid-cols-2 gap-16 relative min-h-[220px]">
        {/* 動的接続SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          
          {/* 既存の接続線 */}
          {Object.entries(connections).map(([leftId, rightId]) => {
            const start = elementPositions[`left-${leftId}`];
            const end = elementPositions[`right-${rightId}`];
            if (!start || !end) return null;
            
            // つなぎ目が合っている（正解）か
            const isCorrect = leftId === rightId;
            const strokeColor = isCorrect ? "#10b981" : "#ef4444";

            return (
              <g key={`conn-${leftId}`}>
                <path
                  d={`M ${start.x} ${start.y} C ${(start.x + end.x) / 2} ${start.y}, ${(start.x + end.x) / 2} ${end.y}, ${end.x} ${end.y}`}
                  stroke={strokeColor}
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  className="shadow-sm"
                />
                <circle cx={start.x} cy={start.y} r="6" fill={strokeColor} />
                <circle cx={end.x} cy={end.y} r="6" fill={strokeColor} />
              </g>
            );
          })}

          {/* クイックな引っ張りドラッグ線 */}
          {selectedLeftId && dragStartPos && dragCurrentPos && (
            <path
              d={`M ${elementPositions[`left-${selectedLeftId}`]?.x || dragStartPos.x} ${elementPositions[`left-${selectedLeftId}`]?.y || dragStartPos.y} L ${dragCurrentPos.x} ${dragCurrentPos.y}`}
              stroke="url(#lineGrad)"
              strokeWidth="4"
              strokeDasharray="5,5"
              fill="none"
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* 左カラム (絵文字/画像 + ラベル) */}
        <div className="flex flex-col gap-6 justify-center z-20">
          {leftList.map((item) => {
            const isConnected = !!connections[item.id];
            const isSelected = selectedLeftId === item.id;
            return (
              <div 
                key={`left-${item.id}`}
                className={`flex items-center justify-between p-3 rounded-xl shadow-md transition-all border cursor-pointer select-none ${
                  isSelected 
                    ? "border-cyan-500 bg-cyan-50/90 ring-2 ring-cyan-400/50 scale-102" 
                    : isConnected 
                    ? "border-emerald-300 bg-emerald-50/60" 
                    : "border-sky-100 bg-white/90 hover:border-sky-300"
                }`}
                onPointerDown={(e) => handlePointerDown(item.id, e)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 flex items-center justify-center bg-sky-50 rounded-lg overflow-hidden border border-sky-100/50">
                    {item.leftEmojiOrUrl.startsWith("http") || item.leftEmojiOrUrl.startsWith("data:") ? (
                      <img src={item.leftEmojiOrUrl} alt="" onLoad={updatePositions} className="w-10 h-10 object-contain rounded" />
                    ) : (
                      <span className="text-2xl">{item.leftEmojiOrUrl || "✨"}</span>
                    )}
                  </div>
                  {item.leftLabel && (
                    <span className="text-xs font-bold text-slate-700 max-w-[80px] truncate" title={item.leftLabel}>
                      {item.leftLabel}
                    </span>
                  )}
                </div>
                
                <div 
                  id={`dot-left-${item.id}`}
                  className={`w-6 h-6 rounded-full border-2 transition-all ml-2 flex-shrink-0 flex items-center justify-center ${
                    isSelected 
                      ? "bg-cyan-500 border-white scale-125" 
                      : isConnected 
                      ? "bg-emerald-500 border-white" 
                      : "bg-sky-300 border-white hover:scale-125"
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-white/50 pointer-events-none" />
                </div>
              </div>
            );
          })}
        </div>

        {/* 右カラム (絵文字/画像 + ラベル) */}
        <div className="flex flex-col gap-6 justify-center z-20">
          {rightList.map((item) => {
            // この右側ノードをターゲットにしている接続があるか
            const targetLeftId = Object.keys(connections).find(key => connections[key] === item.id);
            const isConnected = !!targetLeftId;
            
            return (
              <div 
                key={`right-${item.id}`}
                data-right-id={item.id}
                className={`flex items-center gap-3 justify-start p-3 rounded-xl shadow-md cursor-pointer transition-all border ${
                  isConnected 
                    ? "border-emerald-300 bg-emerald-50/60" 
                    : "border-sky-100 bg-white/90 hover:border-sky-300"
                }`}
                onClick={() => handleRightClick(item.id)}
              >
                <div 
                  id={`dot-right-${item.id}`}
                  className={`w-5 h-5 rounded-full border-2 transition-all mr-2 ${
                    isConnected ? "bg-emerald-500 border-white" : "bg-sky-200 border-white"
                  }`}
                />
                
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 flex items-center justify-center bg-sky-50 rounded-lg overflow-hidden border border-sky-100/50">
                    {item.rightEmojiOrUrl?.startsWith("http") || item.rightEmojiOrUrl?.startsWith("data:") ? (
                      <img src={item.rightEmojiOrUrl} alt="" onLoad={updatePositions} className="w-10 h-10 object-contain rounded" />
                    ) : (
                      <span className="text-2xl">{item.rightEmojiOrUrl || "❓"}</span>
                    )}
                  </div>
                  {item.rightLabel && (
                    <span className="text-xs font-bold text-slate-700 max-w-[80px] truncate" title={item.rightLabel}>
                      {item.rightLabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 完了ステータス */}
      <div className="mt-6 text-center">
        {Object.keys(connections).length === items.length ? (
          <div className="bg-emerald-50 text-emerald-700 py-2.5 px-4 rounded-2xl border border-emerald-200 font-bold text-sm shadow-sm">
            ✨ すべてのペアが繋がりました！
          </div>
        ) : (
          <div className="text-xs text-slate-500 bg-cyan-50/50 py-2.5 px-4 rounded-2xl border border-sky-100">
            💡 左側の丸（○）から右側の丸（○）に向かってドラッグ or クリックで線をつなぎましょう。
          </div>
        )}
      </div>
    </div>
  );
}
