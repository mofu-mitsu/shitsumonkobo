const fs = require('fs');
let code = fs.readFileSync('src/components/ContentCreator.tsx', 'utf-8');

const oldQText = `<div className="flex gap-2 items-center">
                      <span className="font-mono text-xs text-indigo-500 font-bold">Q{idx + 1}.</span>
                      <input
                        type="text"
                        value={q.text}
                        onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-1.5 text-xs text-slate-800 font-bold flex-1 placeholder-slate-400 focus:outline-none"
                        placeholder="質問の質問文を入力してね"
                      />
                    </div>`;

const newQText = `<div className="flex gap-2 items-start mt-4">
                      <div className="flex flex-col items-center gap-1">
                         <span className="font-mono text-xs text-indigo-500 font-bold mt-1">Q{idx + 1}.</span>
                         <div className="flex flex-col gap-0.5">
                            <button onClick={() => {
                               if (idx > 0) {
                                  const newQuestions = [...content.questions];
                                  const temp = newQuestions[idx - 1];
                                  newQuestions[idx - 1] = newQuestions[idx];
                                  newQuestions[idx] = temp;
                                  setContent({ ...content, questions: newQuestions });
                               }
                            }} className="p-0.5 text-slate-300 hover:text-sky-500 disabled:opacity-30"><ChevronUp size={14}/></button>
                            <button onClick={() => {
                               if (idx < content.questions.length - 1) {
                                  const newQuestions = [...content.questions];
                                  const temp = newQuestions[idx + 1];
                                  newQuestions[idx + 1] = newQuestions[idx];
                                  newQuestions[idx] = temp;
                                  setContent({ ...content, questions: newQuestions });
                               }
                            }} className="p-0.5 text-slate-300 hover:text-sky-500 disabled:opacity-30"><ChevronDown size={14}/></button>
                         </div>
                      </div>
                      <textarea
                        value={q.text}
                        onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-28 text-sm text-slate-800 font-bold flex-1 placeholder-slate-400 focus:outline-none min-h-[60px] resize-y"
                        placeholder="質問の質問文を入力してね\\n（改行も可能です）"
                        rows={2}
                      />
                    </div>`;

code = code.replace(oldQText, newQText);
fs.writeFileSync('src/components/ContentCreator.tsx', code);
console.log("Patched Q text!");
