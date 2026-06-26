import * as fs from 'fs';

// 1. ContentPlayer: Add resetPlay function
let playerStr = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf8');

if (!playerStr.includes('const resetPlay = () =>')) {
  playerStr = playerStr.replace(
    /const loadDashboard = async \(\) => \{/,
    `const resetPlay = () => {
    setIsStarted(false);
    setIsFinished(false);
    setCurrentIdx(0);
    setAnswers([]);
    setAttributeScores({});
    setShowEncounter(false);
  };

  const loadDashboard = async () => {`
  );
}

// 2. ContentPlayer: Quiz Explanation display
// When user answers a question in 'instant' mode, show explanation. 
// We need state for "showExplanation" and "currentExplanation" or we can just show it before moving to the next question.
// Actually, the current behavior just moves to the next question immediately.
// Let's add a temporary state for explanation viewing if quizMode === 'instant'.
// wait, maybe we should just show the explanation in the Results page if summary mode? Or maybe right away.
// For now, I'll modify ContentPlayer to handle quiz explanations.
fs.writeFileSync('src/components/ContentPlayer.tsx', playerStr);


let ccStr = fs.readFileSync('src/components/ContentCreator.tsx', 'utf8');

// Update Placeholder for Gimmicks to not be JSON
ccStr = ccStr.replace(/placeholder='例: \{ "Score": 10, "Ni": 2 \}'/g, 'placeholder="例: Score 10 Ni 2"');
ccStr = ccStr.replace(/placeholder='例: \{ "Se": 1, "Score": 5 \}'/g, 'placeholder="例: Se 1 Score 5"');

// Update Placeholder for Advanced Condition
ccStr = ccStr.replace(/例: Se > 5 && Ni < 2 \(※属性単体だけでは判定しづらい場合に使用\)/g, '例: Ti + Ne >= 5 (属性同士の計算など高度な条件)');

// Hide Result conditions in Tab 3 if it's a survey
ccStr = ccStr.replace(
  /<div className="flex gap-3">[\s\S]*?<label className="block text-xs font-bold text-slate-600 mb-1">📯 判定に使うパラメータ<\/label>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
  `{content.type !== 'survey' && (
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
                                ) : (
                                  content.scoringAttributes.map(attr => (
                                    <option key={attr} value={attr}>{attr}</option>
                                  ))
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

                        {content.type !== 'survey' && (
                          <div>
                            <label className="block text-[10px] font-bold text-indigo-600 mb-1">
                              ⚙️ 【上級】高度な条件式（任意・優先されます）
                            </label>
                            <input
                              type="text"
                              value={result.advancedCondition || ""}
                              onChange={(e) => {
                                const updated = content.results.map(r => r.id === result.id ? { ...r, advancedCondition: e.target.value } : r);
                                setContent({ ...content, results: updated });
                              }}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-700 focus:outline-none focus:border-indigo-400"
                              placeholder="例: Ti + Ne >= 5 (属性同士の計算など高度な条件)"
                            />
                          </div>
                        )}`
);

// Move Survey Stats toggle to Tab 3, removing it from Tab 2
ccStr = ccStr.replace(
  /\{content\.type === 'survey' && \([\s\S]*?<\/div>\s*\)\}/,
  ""
);

ccStr = ccStr.replace(
  /<div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">/,
  `{content.type === 'survey' && (
              <div className="bg-sky-50 p-4 rounded-xl space-y-3 mb-4">
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
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">`
);

fs.writeFileSync('src/components/ContentCreator.tsx', ccStr);
