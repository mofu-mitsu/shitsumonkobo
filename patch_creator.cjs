const fs = require('fs');
let code = fs.readFileSync('src/components/ContentCreator.tsx', 'utf-8');

// 1. max_expression の場合のプルダウン追加とUI修正
const oldMaxExpUI = `{(result.conditionType === 'expression' || result.conditionType === 'max_expression') && !result.isFallback && (
                                <div>
                                  <label className="block text-[10px] font-bold text-indigo-600 mb-1">
                                    ⚙️ 【上級】高度な条件式
                                  </label>
                                  <input`;

const newMaxExpUI = `{(result.conditionType === 'expression' || result.conditionType === 'max_expression') && !result.isFallback && (
                                <div className="space-y-3">
                                  {result.conditionType === 'max_expression' && (
                                    <div>
                                      <label className="block text-xs font-bold text-slate-600 mb-1">一番高くなってほしい属性を選ぶ</label>
                                      <select
                                        value={content.scoringAttributes.includes(result.advancedCondition || "") ? result.advancedCondition : ""}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          const updated = content.results.map(r => r.id === result.id ? { ...r, advancedCondition: val } : r);
                                          setContent({ ...content, results: updated });
                                        }}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700"
                                      >
                                        <option value="">カスタム式を入力する...</option>
                                        {content.scoringAttributes.map(attr => (
                                          <option key={attr} value={attr}>{attr} が一番高い時</option>
                                        ))}
                                      </select>
                                    </div>
                                  )}
                                  
                                  {(!content.scoringAttributes.includes(result.advancedCondition || "") || result.conditionType === 'expression') && (
                                    <div>
                                      <label className="block text-[10px] font-bold text-indigo-600 mb-1">
                                        ⚙️ 【上級】高度な条件式 (カスタム)
                                      </label>
                                      <input`;

code = code.replace(oldMaxExpUI, newMaxExpUI);

// add closing div
const oldMaxExpClose = `(result.conditionType === 'max_expression' ? "" : " >= 5") } : r)})} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[9px] font-mono border border-slate-200 transition-colors">加算</button>
                                        {result.conditionType !== 'max_expression' && (
                                          <button onClick={() => setContent({ ...content, results: content.results.map(r => r.id === result.id ? { ...r, advancedCondition: \`\${content.scoringAttributes[0]} > \${content.scoringAttributes[1]}\` } : r)})} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[9px] font-mono border border-slate-200 transition-colors">比較</button>
                                        )}
                                      </>
                                    ) : null}
                                    <button onClick={() => setContent({ ...content, results: content.results.map(r => r.id === result.id ? { ...r, advancedCondition: "" } : r)})} className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded text-[9px] font-mono border border-rose-100 ml-auto transition-colors">クリア</button>
                                  </div>
                                </div>
                              )}`;

const newMaxExpClose = `(result.conditionType === 'max_expression' ? "" : " >= 5") } : r)})} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[9px] font-mono border border-slate-200 transition-colors">加算</button>
                                        {result.conditionType !== 'max_expression' && (
                                          <button onClick={() => setContent({ ...content, results: content.results.map(r => r.id === result.id ? { ...r, advancedCondition: \`\${content.scoringAttributes[0]} > \${content.scoringAttributes[1]}\` } : r)})} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[9px] font-mono border border-slate-200 transition-colors">比較</button>
                                        )}
                                      </>
                                    ) : null}
                                    <button onClick={() => setContent({ ...content, results: content.results.map(r => r.id === result.id ? { ...r, advancedCondition: "" } : r)})} className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded text-[9px] font-mono border border-rose-100 ml-auto transition-colors">クリア</button>
                                  </div>
                                    </div>
                                  )}
                                </div>
                              )}`;

code = code.replace(oldMaxExpClose, newMaxExpClose);

// 2. 質問の入力欄をtextareaにする。
// \`q.text\` is the question text.
const oldTextInput = `<input
                            type="text"
                            value={q.text}
                            onChange={(e) => {
                              const updated = content.questions.map(qu => qu.id === q.id ? { ...qu, text: e.target.value } : qu);
                              setContent({ ...content, questions: updated });
                            }}
                            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-slate-800 font-bold focus:outline-none focus:border-sky-300 focus:bg-white transition-colors"
                            placeholder="例: 休日の過ごし方は？"
                          />`;

const newTextInput = `<textarea
                            value={q.text}
                            onChange={(e) => {
                              const updated = content.questions.map(qu => qu.id === q.id ? { ...qu, text: e.target.value } : qu);
                              setContent({ ...content, questions: updated });
                            }}
                            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 pr-24 rounded-2xl text-slate-800 font-bold focus:outline-none focus:border-sky-300 focus:bg-white transition-colors min-h-[60px] resize-y"
                            placeholder="例: 休日の過ごし方は？\\n（改行も可能です）"
                            rows={2}
                          />`;
code = code.replace(oldTextInput, newTextInput);


fs.writeFileSync('src/components/ContentCreator.tsx', code);
console.log("Patched creator max_exp and text input!");
