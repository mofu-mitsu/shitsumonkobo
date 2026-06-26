import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentCreator.tsx', 'utf8');

const moreGimmicksUI = `

            {/* その他のエフェクト */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm text-slate-800">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                ✨ お楽しみ演出ギミック
              </h4>
              
               <div className="flex items-center justify-between py-2">
                <div>
                  <h5 className="text-[12px] font-bold text-slate-700">😊 選択リアクション</h5>
                  <p className="text-[10px] text-slate-500">選択肢を押した瞬間にキラキラ紙吹雪が舞う！</p>
                </div>
                <input
                  type="checkbox"
                  checked={content.gimmicks.enableReactionEffect || false}
                  onChange={(e) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, enableReactionEffect: e.target.checked } }))}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div className="flex-1 pr-4">
                  <h5 className="text-[12px] font-bold text-slate-700">🌦 背景イベント</h5>
                  <p className="text-[10px] text-slate-500">回答中に背景で雪や花びらを降らせます。</p>
                </div>
                <select
                  value={content.gimmicks.enableBackgroundEffect || "none"}
                  onChange={(e) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, enableBackgroundEffect: e.target.value as any } }))}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700"
                >
                  <option value="none">なし</option>
                  <option value="snow">❄️ 雪</option>
                  <option value="petals">🌸 花びら</option>
                  <option value="stars">✨ 星</option>
                  <option value="rain">☔ 雨</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div className="flex-1 pr-4">
                  <h5 className="text-[12px] font-bold text-slate-700">🐱 ランダム遭遇イベント</h5>
                  <p className="text-[10px] text-slate-500">回答中に突然キャラクターが乱入してくるかも！？</p>
                </div>
                <input
                  type="checkbox"
                  checked={content.gimmicks.enableRandomEncounter || false}
                  onChange={(e) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, enableRandomEncounter: e.target.checked } }))}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>
`;

content = content.replace(/\{\/\* TapBeat\(絵文字たたき\)のトグル \*\/}/, moreGimmicksUI + '\n            {/* TapBeat(絵文字たたき)のトグル */}');

fs.writeFileSync('src/components/ContentCreator.tsx', content);
