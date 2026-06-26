import * as fs from 'fs';

let playerStr = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf8');

if (!playerStr.includes('const [surveyStats, setSurveyStats]')) {
  playerStr = playerStr.replace(
    /const \[playLogs, setPlayLogs\] = useState<any\[\]>\(\[\]\);/,
    `const [playLogs, setPlayLogs] = useState<any[]>([]);\n  const [surveyStats, setSurveyStats] = useState<any[]>([]);`
  );
}

if (!playerStr.includes('loadSurveyStats')) {
  playerStr = playerStr.replace(
    /useEffect\(\(\) => \{\n    if \(isFinished\) \{/,
    `const loadSurveyStats = async () => {
      const logs = await getPlayStats(content.id);
      setSurveyStats(logs);
    };

  useEffect(() => {
    if (isFinished) {
      if (content.type === 'survey' && content.surveyShowStats) {
        loadSurveyStats();
      }`
  );
}

// Replace Mock Stats Display with Real Stats
if (playerStr.includes('{/* Mock stats display */}')) {
  playerStr = playerStr.replace(
    /\{ \/\* Mock stats display \*\/ \}[\s\S]*?<\/div>\s*<\/div>\s*\)\}/,
    `{/* Real stats display */}
                    {content.questions.map((q, qIdx) => {
                      if (q.type !== 'radio' && q.type !== 'five_choices' && q.type !== 'checkbox') return null;
                      // qに対する全ての選択肢の集計
                      const counts: Record<string, number> = {};
                      q.choices.forEach(c => counts[c.id] = 0);
                      let total = 0;
                      surveyStats.forEach(log => {
                        const ans = log.answers?.[qIdx];
                        if (ans) {
                          if (Array.isArray(ans)) {
                            ans.forEach(a => { if (counts[a] !== undefined) { counts[a]++; total++; } });
                          } else {
                            if (counts[ans] !== undefined) { counts[ans]++; total++; }
                          }
                        }
                      });
                      
                      return (
                        <div key={q.id} className="mt-4 p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                          <div className="text-xs font-bold text-slate-700 mb-2">Q. {q.text}</div>
                          <div className="space-y-2">
                            {q.choices.map(c => {
                              const p = total > 0 ? Math.round((counts[c.id] / total) * 100) : 0;
                              return (
                                <div key={c.id} className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-bold text-slate-500"><span>{c.text}</span><span>{p}% ({counts[c.id]}票)</span></div>
                                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-teal-400" style={{ width: p + "%" }} /></div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}`
  );
}

fs.writeFileSync('src/components/ContentPlayer.tsx', playerStr);
