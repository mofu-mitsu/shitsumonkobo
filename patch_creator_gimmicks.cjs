const fs = require('fs');
let code = fs.readFileSync('src/components/ContentCreator.tsx', 'utf-8');

const secretLetterMaxSnippet = `
                  <div className="mt-2">
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">最大登場回数（空欄で無限）</label>
                    <input
                      type="number"
                      value={content.gimmicks.secretLetterMaxAppearances ?? ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? undefined : parseInt(e.target.value);
                        setContent(prev => ({
                          ...prev,
                          gimmicks: { ...prev.gimmicks, secretLetterMaxAppearances: val }
                        }));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
                      placeholder="無限"
                    />
                  </div>
`;
code = code.replace(/<div>\s*<label className="block text-\[10px\] font-bold text-slate-500 mb-1">開いた時に加算される属性ポイント/, secretLetterMaxSnippet + '\n                  <div><label className="block text-[10px] font-bold text-slate-500 mb-1">開いた時に加算される属性ポイント');

const randomEventMaxSnippet = `
                  <div className="mt-2">
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">最大登場回数（空欄で無限）</label>
                    <input
                      type="number"
                      value={content.gimmicks.randomEventMaxAppearances ?? ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? undefined : parseInt(e.target.value);
                        setContent(prev => ({
                          ...prev,
                          gimmicks: { ...prev.gimmicks, randomEventMaxAppearances: val }
                        }));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
                      placeholder="無限"
                    />
                  </div>
`;
code = code.replace(/<label className="block text-\[10px\] font-bold text-slate-500 mb-1">イベント時のセリフ/, randomEventMaxSnippet + '\n                    <label className="block text-[10px] font-bold text-slate-500 mb-1">イベント時のセリフ');

fs.writeFileSync('src/components/ContentCreator.tsx', code);
console.log("Patched ContentCreator for max appearances");
