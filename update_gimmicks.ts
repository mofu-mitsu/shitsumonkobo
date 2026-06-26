import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentCreator.tsx', 'utf8');

// 1. Add Attribute Multiplier for Caterpillar
const catRegex = /<label className="block text-\[10px\] text-slate-500 font-bold mb-1">💬 タップされたときのセリフ \(1行に1文ずつ\)<\/label>/;
const catReplace = `<label className="block text-[10px] text-slate-500 font-bold mb-1">🎯 潰した時に加算される属性・ポイント数 (JSON形式)</label>
                    <input
                      type="text"
                      placeholder='例: { "Score": 10, "Ni": 5 }'
                      value={content.gimmicks.caterpillarAttributeMultiplier ? JSON.stringify(content.gimmicks.caterpillarAttributeMultiplier) : ""}
                      onChange={(e) => {
                        try {
                          const parsed = e.target.value ? JSON.parse(e.target.value) : undefined;
                          setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, caterpillarAttributeMultiplier: parsed } }));
                        } catch(e) {}
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 mb-3 focus:outline-none"
                    />
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">💬 タップされたときのセリフ (1行に1文ずつ)</label>`;
content = content.replace(catRegex, catReplace);

// 2. Add Attribute Multiplier for TapBeat
const tapBeatRegex = /<h5 className="text-\[12px\] font-bold text-slate-700">🥁 タップ・ビートゲーム \(ミニゲーム\)<\/h5>/;
const tapBeatReplace = `<h5 className="text-[12px] font-bold text-slate-700">🥁 タップ・ビートゲーム (ミニゲーム)</h5>`;
const tapBeatSettingsRegex = /<input\n\s*type="text"\n\s*placeholder="カンマ区切りで入力 \(例: 🐱,🐸,🦊\)"\n\s*value=\{\(content\.gimmicks\.tapBeatEmojis \|\| \[\]\)\.join\(","\)\}\n\s*onChange=\{\(e\) => setContent\(\{ \.\.\.content, gimmicks: \{ \.\.\.content\.gimmicks, tapBeatEmojis: e\.target\.value\.split\(","\)\.map\(s => s\.trim\(\)\)\.filter\(Boolean\) \} \}\)\}\n\s*className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1\.5 text-xs focus:outline-none focus:border-indigo-400 transition-colors"\n\s*\/>\n\s*<\/div>/;

const tapBeatSettingsReplace = `<input
                      type="text"
                      placeholder="カンマ区切りで入力 (例: 🐱,🐸,🦊)"
                      value={(content.gimmicks.tapBeatEmojis || []).join(",")}
                      onChange={(e) => setContent({ ...content, gimmicks: { ...content.gimmicks, tapBeatEmojis: e.target.value.split(",").map(s => s.trim()).filter(Boolean) } })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400 transition-colors"
                    />
                  </div>
                  {(content.type === 'diagnostic' || content.type === 'quiz') && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">🎯 叩いた回数 × (加算する属性とポイント数) (JSON)</label>
                      <input
                        type="text"
                        placeholder='例: { "Se": 1, "Score": 5 }'
                        value={content.gimmicks.tapBeatAttributeMultiplier ? JSON.stringify(content.gimmicks.tapBeatAttributeMultiplier) : ""}
                        onChange={(e) => {
                          try {
                            const parsed = e.target.value ? JSON.parse(e.target.value) : undefined;
                            setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, tapBeatAttributeMultiplier: parsed } }));
                          } catch(e) {}
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400 transition-colors"
                      />
                    </div>
                  )}
                  {content.type === 'gacha' && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">💰 叩いた回数 × (加算されるガチャポイント)</label>
                      <input
                        type="number"
                        placeholder="例: 10"
                        value={content.gimmicks.tapBeatGachaPoints || ""}
                        onChange={(e) => setContent({ ...content, gimmicks: { ...content.gimmicks, tapBeatGachaPoints: parseInt(e.target.value) || undefined } })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400 transition-colors"
                      />
                    </div>
                  )}`;
content = content.replace(tapBeatSettingsRegex, tapBeatSettingsReplace);

// 3. Add Letter Gimmick
const letterRegex = /<h5 className="text-\[12px\] font-bold text-slate-700">🐱 ランダム遭遇イベント<\/h5>/;
const letterReplace = `<div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div className="flex-1 pr-4">
                  <h5 className="text-[12px] font-bold text-slate-700">✉️ 突然のお手紙ギミック</h5>
                  <p className="text-[10px] text-slate-500">回答中にランダムで手紙が落ちてきて、開くとポイントが加算されます。</p>
                </div>
                <input
                  type="checkbox"
                  checked={content.gimmicks.enableSecretLetter || false}
                  onChange={(e) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, enableSecretLetter: e.target.checked } }))}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
              {content.gimmicks.enableSecretLetter && (
                <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-3 shadow-xs mb-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">手紙の内容</label>
                    <textarea
                      placeholder="「いつもありがとう！これを受け取ってね！」"
                      value={content.gimmicks.secretLetterText || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, secretLetterText: e.target.value } }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">開いた時に加算される属性ポイント (JSON)</label>
                    <input
                      type="text"
                      placeholder='例: { "Score": 10, "Ni": 2 }'
                      value={content.gimmicks.secretLetterAttributeMultiplier ? JSON.stringify(content.gimmicks.secretLetterAttributeMultiplier) : ""}
                      onChange={(e) => {
                        try {
                          const parsed = e.target.value ? JSON.parse(e.target.value) : undefined;
                          setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, secretLetterAttributeMultiplier: parsed } }));
                        } catch(e) {}
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400 transition-colors"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div className="flex-1 pr-4">
                  <h5 className="text-[12px] font-bold text-slate-700">🐱 ランダム遭遇イベント</h5>`;
content = content.replace(letterRegex, letterReplace);

// 4. Add surveyShowStats setting
const surveyRegex = /<h4 className="text-sm font-bold text-slate-800 flex items-center gap-1\.5">\n\s*⚙️ プレイヤーの出題設定\n\s*<\/h4>/;
const surveyReplace = `<h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  ⚙️ プレイヤーの出題設定
                </h4>
                {content.type === 'survey' && (
                  <div className="mt-3 flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 select-none">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-700">📊 終了後に投票率を表示する</div>
                      <div className="text-[9px] text-slate-500">アンケート終了画面で実際の投票率をユーザーに開示します。</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!content.surveyShowStats}
                      onChange={(e) => setContent({ ...content, surveyShowStats: e.target.checked })}
                      className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 cursor-pointer"
                    />
                  </div>
                )}`;
content = content.replace(surveyRegex, surveyReplace);

fs.writeFileSync('src/components/ContentCreator.tsx', content);
