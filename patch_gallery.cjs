const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// replace title and description display
code = code.replace(/\{item\.title\}/g, "{item.title.replace(/\\\\n|¥n/g, ' ')}");
code = code.replace(/\{item\.description \|\| "（説明文はありません）"\}/g, "{item.description ? item.description.replace(/\\\\n|¥n/g, ' ') : '（説明文はありません）'}");

// replace image display to handle emoji and fallback
const oldImageStr = `{(item.coverImageUrl || item.results?.[0]?.imageUrl) && (
                              <div className="w-full h-32 mb-3 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                <img src={item.coverImageUrl || item.results?.[0]?.imageUrl} alt="cover" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                              </div>
                            )}\\n`;
const newImageStr = `
                            {(() => {
                              const imgUrl = item.coverImageUrl || item.results?.[0]?.imageUrl;
                              const isEmoji = imgUrl && !imgUrl.startsWith("http") && !imgUrl.startsWith("data:");
                              return (
                                <div className="w-full h-32 mb-3 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
                                  {imgUrl ? (
                                    isEmoji ? (
                                      <span className="text-6xl transition-transform group-hover:scale-110 duration-300">{imgUrl}</span>
                                    ) : (
                                      <img src={imgUrl} alt="cover" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                                    )
                                  ) : (
                                    <Palette className="w-12 h-12 text-slate-200" />
                                  )}
                                </div>
                              );
                            })()}
`;
code = code.replace(oldImageStr, newImageStr);

// There is another one for my studio list (probably)
const oldImageStr2 = `{(item.coverImageUrl || item.results?.[0]?.imageUrl) && (
                              <div className="w-full h-32 mb-3 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                <img src={item.coverImageUrl || item.results?.[0]?.imageUrl} alt="cover" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                              </div>
                            )}\\n`;
code = code.replace(oldImageStr2, newImageStr); // second occurrence

fs.writeFileSync('src/App.tsx', code);
console.log("Patched gallery images!");
