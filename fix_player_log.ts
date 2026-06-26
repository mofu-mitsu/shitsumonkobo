import * as fs from 'fs';

let playerStr = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf8');

if (!playerStr.includes("savePlayLog")) {
  playerStr = playerStr.replace(
    /import \{ Check, X, BarChart \} from "lucide-react";/,
    'import { Check, X, BarChart } from "lucide-react";\nimport { savePlayLog, getPlayStats } from "../lib/playLogs";'
  );
}

if (!playerStr.includes('useEffect(() => { if (isFinished) {')) {
  playerStr = playerStr.replace(
    /const finalResult = isFinished && content.type !== 'survey' \? calculateResult\(\) : null;/,
    `const finalResult = isFinished && content.type !== 'survey' ? calculateResult() : null;

  // 終了時にログ保存
  useEffect(() => {
    if (isFinished) {
      savePlayLog(content.id, content.creatorXHandle, {
        type: content.type,
        scores: attributeScores,
        resultId: finalResult?.id,
        resultTitle: finalResult?.title,
        answers: answers
      });
    }
  }, [isFinished]);`
  );
}

// StatsDashboard を表示する機能
if (!playerStr.includes('const [showDashboard, setShowDashboard]')) {
  playerStr = playerStr.replace(
    /const \[showEncounter, setShowEncounter\] = useState\(false\);/,
    `const [showEncounter, setShowEncounter] = useState(false);\n  const [showDashboard, setShowDashboard] = useState(false);\n  const [playLogs, setPlayLogs] = useState<any[]>([]);`
  );
}

if (!playerStr.includes('loadDashboard')) {
  playerStr = playerStr.replace(
    /const handleXShare = \(\) => \{/,
    `const loadDashboard = async () => {
    const logs = await getPlayStats(content.id);
    setPlayLogs(logs);
    setShowDashboard(true);
  };

  const handleXShare = () => {`
  );
}

// Dashboard UI
if (!playerStr.includes('showDashboard && (')) {
  playerStr = playerStr.replace(
    /\{ \/\* =============== 回報進行中の画面 =============== \*\/ \}/,
    `{/* =============== ダッシュボード =============== */}
        {showDashboard && (
          <div className="absolute inset-0 bg-white/95 z-50 overflow-y-auto p-6 md:p-8 flex flex-col space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800"><BarChart className="inline mr-2"/> アナリティクス (作成者専用)</h2>
              <button onClick={() => setShowDashboard(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                <div className="text-xs text-sky-600 font-bold mb-1">総プレイ回数</div>
                <div className="text-3xl font-black text-sky-900">{playLogs.length} 回</div>
              </div>
              <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                <div className="text-xs text-teal-600 font-bold mb-1">クイズ平均正答率等</div>
                <div className="text-3xl font-black text-teal-900">
                  {content.type === 'quiz' ? 
                    Math.round(playLogs.reduce((acc, log) => acc + (log.scores.QuizScore || 0), 0) / (playLogs.length || 1)) + " 点" 
                    : "-"}
                </div>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <h3 className="text-sm font-bold text-slate-700">最近のプレイログ</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {playLogs.slice().reverse().map((log, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-xs flex justify-between">
                    <span className="text-slate-500">{new Date(log.playedAt).toLocaleString()}</span>
                    <span className="font-bold text-slate-700">{log.resultTitle || "結果なし"}</span>
                  </div>
                ))}
                {playLogs.length === 0 && <div className="text-xs text-slate-400">まだプレイされていません。</div>}
              </div>
            </div>
          </div>
        )}
        
        { /* =============== 回報進行中の画面 =============== */ }`
  );
}

// ヘッダーにダッシュボードボタン (作成者のみ)
if (!playerStr.includes('ダッシュボード')) {
  playerStr = playerStr.replace(
    /<button onClick=\{onClose\} className="w-8 h-8 flex items-center justify-center bg-white\/50 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm transition-colors cursor-pointer">/,
    `{currentUser && content.creatorXHandle === currentUser.displayName && (
            <button onClick={loadDashboard} className="mr-3 text-xs bg-sky-100 hover:bg-sky-200 text-sky-700 font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors">
              <BarChart size={12}/> ダッシュボード
            </button>
          )}
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white/50 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm transition-colors cursor-pointer">`
  );
}

fs.writeFileSync('src/components/ContentPlayer.tsx', playerStr);
