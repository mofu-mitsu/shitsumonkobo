import * as fs from 'fs';

let creatorStr = fs.readFileSync('src/components/ContentCreator.tsx', 'utf8');

const helperInject = `
import { Trash2, Plus, GripVertical, Settings, Save, Play, Share2 } from 'lucide-react';

const parseSimpleAttributes = (str: string): Record<string, number> => {
  if (!str) return {};
  if (str.trim().startsWith('{')) {
    try { return JSON.parse(str); } catch(e) { return {}; }
  }
  const parts = str.trim().split(/[\\s,]+/);
  const res: Record<string, number> = {};
  for(let i=0; i<parts.length; i+=2) {
    if(parts[i] && parts[i+1] && !isNaN(Number(parts[i+1]))) {
      res[parts[i]] = Number(parts[i+1]);
    }
  }
  return res;
};

const stringifySimpleAttributes = (obj: Record<string, number> | undefined): string => {
  if (!obj) return "";
  return Object.entries(obj).map(([k, v]) => \`\${k} \${v}\`).join(" ");
};
`;
creatorStr = creatorStr.replace(/import \{.*?\} from "lucide-react";/, "import { Settings, Save, Play, Share2, Plus, Download, Upload, Eye, Edit2, Trash2, Globe, Heart, Compass, Pocket, ArrowRight, Palette, Ticket, Milestone, Sparkles } from 'lucide-react';\n" + helperInject.replace(/import.*?;/, ''));

creatorStr = creatorStr.replace(
  /value=\{content\.gimmicks\.caterpillarAttributeMultiplier \? JSON\.stringify\(content\.gimmicks\.caterpillarAttributeMultiplier\) : ""\}/,
  `value={stringifySimpleAttributes(content.gimmicks.caterpillarAttributeMultiplier)}`
).replace(
  /placeholder='例: \{ "Score": 10, "Ni": 5 \}'/g,
  `placeholder="例: Score 10 Ni 5"`
).replace(
  /const parsed = e\.target\.value \? JSON\.parse\(e\.target\.value\) : undefined;/g,
  `const parsed = e.target.value ? parseSimpleAttributes(e.target.value) : undefined;`
).replace(
  /value=\{content\.gimmicks\.tapBeatAttributeMultiplier \? JSON\.stringify\(content\.gimmicks\.tapBeatAttributeMultiplier\) : ""\}/,
  `value={stringifySimpleAttributes(content.gimmicks.tapBeatAttributeMultiplier)}`
).replace(
  /value=\{content\.gimmicks\.secretLetterAttributeMultiplier \? JSON\.stringify\(content\.gimmicks\.secretLetterAttributeMultiplier\) : ""\}/,
  `value={stringifySimpleAttributes(content.gimmicks.secretLetterAttributeMultiplier)}`
).replace(
  /🎯 潰した時に加算される属性・ポイント数 \(JSON形式\)/,
  `🎯 潰した時に加算される属性・ポイント数 (例: Score 10 Se 5)`
).replace(
  /🎯 叩いた回数 × \(加算する属性とポイント数\) \(JSON\)/,
  `🎯 叩いた回数 × (加算する属性とポイント数) (例: Score 1 Se 5)`
).replace(
  /開いた時に加算される属性ポイント \(JSON\)/,
  `開いた時に加算される属性ポイント (例: Score 10 Se 5)`
);

const resultConditionInject = `
                          <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-600 mb-1">📯 判定条件のタイプ</label>
                            <select
                              value={result.conditionType || 'threshold'}
                              onChange={(e) => {
                                const updated = content.results.map(r => r.id === result.id ? { ...r, conditionType: e.target.value as any } : r);
                                setContent({ ...content, results: updated });
                              }}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700"
                            >
                              <option value="threshold">標準（属性の最高値・閾値）</option>
                              <option value="expression">高度な条件式（例: Ni &gt; Te）</option>
                              <option value="attribute_order">属性の強さの並び順</option>
                              <option value="attribute_sum">2つの属性の合計値</option>
                            </select>
                          </div>
                        </div>

                        {(!result.conditionType || result.conditionType === 'threshold') && (
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <label className="block text-xs font-bold text-slate-600 mb-1">📯 判定に使うパラメータ</label>
                              <select
                                value={result.conditionAttribute}
                                onChange={(e) => {
                                  const updated = content.results.map(r => r.id === result.id ? { ...r, conditionAttribute: e.target.value } : r);
                                  setContent({ ...content, results: updated });
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700"
                              >
                                {content.type === 'quiz' ? (
                                  <option value="correct">正解数 (correct)</option>
                                ) : (
                                  content.scoringAttributes.map(attr => (
                                    <option key={attr} value={attr}>{attr}</option>
                                  ))
                                )}
                              </select>
                            </div>
                            <div className="w-32">
                              <label className="block text-xs font-bold text-slate-600 mb-1">最低点数要件</label>
                              <input
                                type="number"
                                value={result.conditionScoreMin}
                                onChange={(e) => {
                                  const updated = content.results.map(r => r.id === result.id ? { ...r, conditionScoreMin: parseInt(e.target.value) || 0 } : r);
                                  setContent({ ...content, results: updated });
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 text-center focus:outline-none"
                              />
                            </div>
                          </div>
                        )}

                        {result.conditionType === 'expression' && (
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">高度な条件式 (JavaScript評価)</label>
                            <input
                              type="text"
                              value={result.advancedCondition || ""}
                              onChange={(e) => {
                                const updated = content.results.map(r => r.id === result.id ? { ...r, advancedCondition: e.target.value } : r);
                                setContent({ ...content, results: updated });
                              }}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono placeholder-slate-400 focus:outline-none"
                              placeholder="例: Ni > Te && Score >= 10"
                            />
                          </div>
                        )}

                        {result.conditionType === 'attribute_order' && (
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">必要な並び順（カンマ区切りで上位から）</label>
                            <input
                              type="text"
                              value={(result.conditionOrder || []).join(", ")}
                              onChange={(e) => {
                                const updated = content.results.map(r => r.id === result.id ? { ...r, conditionOrder: e.target.value.split(",").map(s => s.trim()).filter(Boolean) } : r);
                                setContent({ ...content, results: updated });
                              }}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono placeholder-slate-400 focus:outline-none"
                              placeholder="例: Ni, Te, Fi"
                            />
                          </div>
                        )}

                        {result.conditionType === 'attribute_sum' && (
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">足し算する2つの属性（カンマ区切り）</label>
                            <input
                              type="text"
                              value={(result.conditionSumAttributes || []).join(", ")}
                              onChange={(e) => {
                                const updated = content.results.map(r => r.id === result.id ? { ...r, conditionSumAttributes: e.target.value.split(",").map(s => s.trim()).filter(Boolean) } : r);
                                setContent({ ...content, results: updated });
                              }}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono placeholder-slate-400 focus:outline-none"
                              placeholder="例: Te, Ni"
                            />
                            <div className="mt-2 w-32">
                              <label className="block text-xs font-bold text-slate-600 mb-1">合計の最低点数要件</label>
                              <input
                                type="number"
                                value={result.conditionScoreMin}
                                onChange={(e) => {
                                  const updated = content.results.map(r => r.id === result.id ? { ...r, conditionScoreMin: parseInt(e.target.value) || 0 } : r);
                                  setContent({ ...content, results: updated });
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 text-center focus:outline-none"
                              />
                            </div>
                          </div>
                        )}
`;

creatorStr = creatorStr.replace(
  /<div className="flex items-center gap-3">[\s\S]*?<div className="flex-1">[\s\S]*?<label className="block text-xs font-bold text-slate-600 mb-1">📯 判定に使うパラメータ<\/label>[\s\S]*?<\/select>[\s\S]*?<\/div>[\s\S]*?<div className="w-32">[\s\S]*?<label className="block text-xs font-bold text-slate-600 mb-1">最低点数要件<\/label>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<div>[\s\S]*?<label className="block text-xs font-bold text-slate-600 mb-1">[\s\S]*?高度な条件式[\s\S]*?<\/div>/,
  resultConditionInject
);

creatorStr = creatorStr.replace(
  /<input\s+type="text"\s+value=\{result\.imageUrl \|\| ""\}\s+onChange=\{\(e\) => {[\s\S]*?\}\}\s+className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1\.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"\s+placeholder="Unsplashや手持ち画像リンク等"\s+\/>/,
  `<div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={result.imageUrl || ""}
                              onChange={(e) => {
                                const updated = content.results.map(r => r.id === result.id ? { ...r, imageUrl: e.target.value } : r);
                                setContent({ ...content, results: updated });
                              }}
                              className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                              placeholder="Unsplashや手持ち画像リンク等"
                            />
                            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 transition-colors whitespace-nowrap">
                              画像アップロード
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      const updated = content.results.map(r => r.id === result.id ? { ...r, imageUrl: ev.target?.result as string } : r);
                                      setContent({ ...content, results: updated });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>`
);

creatorStr = creatorStr.replace(
  /<input\s+type="text"\s+value=\{item\.imageUrl\}\s+onChange=\{\(e\) => {[\s\S]*?\}\}\s+className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1\.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"\s+placeholder="画像URL \(任意\)"\s+\/>/,
  `<input
                                type="text"
                                value={item.imageUrl}
                                onChange={(e) => {
                                  const newItems = [...content.gachaItems];
                                  newItems[idx].imageUrl = e.target.value;
                                  setContent({ ...content, gachaItems: newItems });
                                }}
                                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                                placeholder="画像URL (任意)"
                              />
                              <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1.5 rounded-lg text-xs font-bold border border-slate-200 transition-colors whitespace-nowrap">
                                📂
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        const newItems = [...content.gachaItems];
                                        newItems[idx].imageUrl = ev.target?.result as string;
                                        setContent({ ...content, gachaItems: newItems });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>`
);

creatorStr = creatorStr.replace(
  /<input\s+type="text"\s+placeholder="🐱"\s+value=\{content\.gimmicks\.randomEventEmojiOrImage \|\| ""\}\s+onChange=\{\(e\) => setContent\(\{ \.\.\.content, gimmicks: \{ \.\.\.content\.gimmicks, randomEventEmojiOrImage: e\.target\.value \} \}\)\}\s+className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1\.5 text-xs focus:outline-none focus:border-indigo-400 transition-colors"\s+\/>/,
  `<input
                        type="text"
                        placeholder="🐱"
                        value={content.gimmicks.randomEventEmojiOrImage || ""}
                        onChange={(e) => setContent({ ...content, gimmicks: { ...content.gimmicks, randomEventEmojiOrImage: e.target.value } })}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400 transition-colors"
                      />
                      <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-slate-200 transition-colors whitespace-nowrap">
                        画像UP
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setContent({ ...content, gimmicks: { ...content.gimmicks, randomEventEmojiOrImage: ev.target?.result as string } });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>`
);

creatorStr = creatorStr.replace(
  /\{content\.type === 'survey' && \([\s\S]*?📊 終了後に投票率を表示する[\s\S]*?<\/div>\s*\)\}/,
  ''
);

creatorStr = creatorStr.replace(
  /\{content\.type !== 'gacha' && content\.type !== 'survey' && \(/,
  `{content.type === 'survey' && (
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
                )}
                {content.type !== 'gacha' && content.type !== 'survey' && (`
);

fs.writeFileSync('src/components/ContentCreator.tsx', creatorStr);
