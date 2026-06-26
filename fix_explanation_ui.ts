import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentCreator.tsx', 'utf8');

const regex = /\s*\}\)\}\n\s*<\/div>\n\s*\)\}\n\s*<\/div>\n\s*\)\)\n\s*\)\}/;

const replaceWith = `
                    {content.type === 'quiz' && (
                      <div className="mt-4 border-t border-slate-100 pt-3">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          💡 正誤表示時のコメント・解説
                        </label>
                        <textarea
                          placeholder="（例）その通り！実は〜〜という理由でこれが正解です。"
                          value={q.explanation || ''}
                          onChange={(e) => {
                            const updated = content.questions.map(qObj => qObj.id === q.id ? { ...qObj, explanation: e.target.value } : qObj);
                            setContent({ ...content, questions: updated });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
`;

content = content.replace(regex, replaceWith);
fs.writeFileSync('src/components/ContentCreator.tsx', content);
