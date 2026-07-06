const fs = require('fs');
let code = fs.readFileSync('src/components/ContentCreator.tsx', 'utf-8');

const target = `                    <input
                      type="text"
                      placeholder="「やあ！調子はどうだい？」"
                      value={content.gimmicks.randomEventText || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, randomEventText: e.target.value } }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400 transition-colors"
                    />
                  </div>`;

const replacement = target + `\n                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 mt-3">最大登場回数 (空欄で無限)</label>
                    <input
                      type="number"
                      placeholder="例: 1"
                      value={content.gimmicks.randomEventMaxAppearances === undefined ? '' : content.gimmicks.randomEventMaxAppearances}
                      onChange={(e) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, randomEventMaxAppearances: e.target.value ? parseInt(e.target.value, 10) : undefined } }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400 transition-colors"
                      min={1}
                    />
                  </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/ContentCreator.tsx', code);
console.log("Patched ContentCreator.tsx with randomEventMaxAppearances");
