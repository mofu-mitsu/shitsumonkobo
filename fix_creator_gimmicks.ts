import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentCreator.tsx', 'utf8');

const lsiGimmickUI = `
            {/* LSIマスコットのトグル */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm text-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    🐾 画面を歩くマスコットギミック
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    画面下部を右から左へ歩き回るマスコット（タップすると一言）を出現させます！
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={content.gimmicks.enableLsiCaterpillar}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    gimmicks: { ...prev.gimmicks, enableLsiCaterpillar: e.target.checked }
                  }))}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {content.gimmicks.enableLsiCaterpillar && (
                <div className="space-y-3 pl-3 border-l-2 border-slate-200">
                  <div className="flex gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-1">マスコット画像/絵文字</label>
                      <input
                        type="text"
                        value={content.gimmicks.lsiMascotImageOrEmoji || "🐛"}
                        onChange={(e) => {
                          setContent(prev => ({
                            ...prev,
                            gimmicks: { ...prev.gimmicks, lsiMascotImageOrEmoji: e.target.value }
                          }));
                        }}
                        placeholder="例: 🐧"
                        className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 w-24 text-center focus:outline-none"
                      />
                    </div>
                    <div>
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
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">💬 タップされたときのセリフ (1行に1文ずつ)</label>
                    <textarea
                      rows={4}
                      value={(content.gimmicks.caterpillarQuotes || []).join("\\n")}
                      onChange={(e) => {
                        const lines = e.target.value.split("\\n").filter(Boolean);
                        setContent(prev => ({
                          ...prev,
                          gimmicks: { ...prev.gimmicks, caterpillarQuotes: lines }
                        }));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 resize-none focus:outline-none"
                      placeholder="セリフを登録してね！"
                    />
                  </div>
                </div>
              )}
            </div>
`;

content = content.replace(/\{\/\* LSI芋虫のトグル \*\/\}[\s\S]*?\{\/\* TapBeat\(絵文字たたき\)のトグル \*\/}/, lsiGimmickUI + "\n\n            {/* TapBeat(絵文字たたき)のトグル */}");


const tapBeatMultiplierUI = `
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">
                      タップ1回あたりの加点属性 (ガチャのポイントや属性の加点に対応可能)
                    </label>
                    <div className="flex gap-2 text-xs">
                      <select 
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-700"
                        onChange={(e) => {
                          const attr = e.target.value;
                          if (!attr) return;
                          setContent(prev => ({
                            ...prev,
                            gimmicks: {
                              ...prev.gimmicks,
                              tapBeatAttributeMultiplier: {
                                ...(prev.gimmicks.tapBeatAttributeMultiplier || {}),
                                [attr]: 1
                              }
                            }
                          }));
                        }}
                      >
                         <option value="">属性を追加...</option>
                         <option value="gacha_point">ガチャpt</option>
                         {content.scoringAttributes.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                       {Object.entries(content.gimmicks.tapBeatAttributeMultiplier || {}).map(([attr, val]) => (
                         <div key={attr} className="flex gap-1 items-center bg-sky-50 px-2 py-1 rounded text-xs">
                           <span className="font-bold text-sky-700">{attr} :</span>
                           <input 
                             type="number" 
                             value={val}
                             onChange={e => {
                               setContent(prev => ({
                                ...prev,
                                gimmicks: {
                                  ...prev.gimmicks,
                                  tapBeatAttributeMultiplier: {
                                    ...prev.gimmicks.tapBeatAttributeMultiplier,
                                    [attr]: parseInt(e.target.value) || 0
                                  }
                                }
                               }));
                             }}
                             className="w-12 text-center border border-slate-200 rounded px-1" 
                           />
                           <button 
                             onClick={() => {
                               const obj = { ...content.gimmicks.tapBeatAttributeMultiplier };
                               delete obj[attr];
                               setContent(prev => ({
                                ...prev,
                                gimmicks: { ...prev.gimmicks, tapBeatAttributeMultiplier: obj }
                               }));
                             }}
                             className="text-slate-400 hover:text-red-500 ml-1 font-bold"
                           >×</button>
                         </div>
                       ))}
                    </div>
                  </div>
`;

content = content.replace(/<\/div>\n\s*\}\)\}\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\)\}/, "</div>" + tapBeatMultiplierUI + "</div>\n                </div>\n              )}");


fs.writeFileSync('src/components/ContentCreator.tsx', content);
