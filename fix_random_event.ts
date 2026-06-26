import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentCreator.tsx', 'utf8');

const regex = /<input\n\s*type="checkbox"\n\s*checked=\{content\.gimmicks\.enableRandomEvent \|\| false\}\n\s*onChange=\{\(e\) => setContent\(prev => \(\{ \.\.\.prev, gimmicks: \{ \.\.\.prev\.gimmicks, enableRandomEvent: e\.target\.checked \} \}\)\)\}\n\s*className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"\n\s*\/>\n\s*<\/div>/;

const replaceWith = `<input
                  type="checkbox"
                  checked={content.gimmicks.enableRandomEvent || false}
                  onChange={(e) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, enableRandomEvent: e.target.checked } }))}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
              {content.gimmicks.enableRandomEvent && (
                <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-3 shadow-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">キャラクター（絵文字・画像URL）</label>
                    <input
                      type="text"
                      placeholder="🐱"
                      value={content.gimmicks.randomEventEmojiOrImage || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, randomEventEmojiOrImage: e.target.value } }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">登場時のセリフ</label>
                    <input
                      type="text"
                      placeholder="「やあ！調子はどうだい？」"
                      value={content.gimmicks.randomEventText || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, randomEventText: e.target.value } }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400 transition-colors"
                    />
                  </div>
                </div>
              )}`;

content = content.replace(regex, replaceWith);
fs.writeFileSync('src/components/ContentCreator.tsx', content);
