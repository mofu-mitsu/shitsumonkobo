const fs = require('fs');
let code = fs.readFileSync('src/components/ContentCreator.tsx', 'utf-8');

const oldUI = `<div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">潰すまでに要する累積タップ数</label>
                      <input
                        type="number"
                        value={content.gimmicks.caterpillarSquishTarget}
                        onChange={(e) => {
                          const target = parseInt(e.target.value) || 30;
                          setContent(prev => ({
                            ...prev,
                            gimmicks: { ...prev.gimmicks, caterpillarSquishTarget: target }
                          }));
                        }}
                        className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 w-20 text-center font-mono focus:outline-none"
                      />
                  </div>`;

const newUI = `<div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">潰すまでに要する累積タップ数</label>
                      <input
                        type="number"
                        value={content.gimmicks.caterpillarSquishTarget}
                        onChange={(e) => {
                          const target = parseInt(e.target.value) || 30;
                          setContent(prev => ({
                            ...prev,
                            gimmicks: { ...prev.gimmicks, caterpillarSquishTarget: target }
                          }));
                        }}
                        className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 w-20 text-center font-mono focus:outline-none"
                      />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">最大登場回数（空欄で無限）</label>
                      <input
                        type="number"
                        value={content.gimmicks.caterpillarMaxAppearances ?? ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? undefined : parseInt(e.target.value);
                          setContent(prev => ({
                            ...prev,
                            gimmicks: { ...prev.gimmicks, caterpillarMaxAppearances: val }
                          }));
                        }}
                        placeholder="無限"
                        className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 w-20 text-center font-mono focus:outline-none"
                      />
                  </div>`;

code = code.replace(oldUI, newUI);
fs.writeFileSync('src/components/ContentCreator.tsx', code);
console.log("Patched creator caterpillar!");
