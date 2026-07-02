const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Initial visible count to 9
code = code.replace(/const \[visibleCount, setVisibleCount\] = useState\(12\);/, "const [visibleCount, setVisibleCount] = useState(9);");

// 2. Change the button from もっと見る to 次のページへ (or just load more)
code = code.replace(/onClick=\{\(\) => setVisibleCount\(v => v \+ 12\)\}/, "onClick={() => setVisibleCount(v => v + 9)}");

// 3. Render image in the gallery card.
// We need to find the <div className="p-4"> or similar in the grid.
const cardStart1 = `<div className="space-y-1">
                              <h4 className="text-md font-bold text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-1 leading-snug">
                                {item.title}
                              </h4>`;
const cardStart2 = `<div className="space-y-1">
                              <h4 className="text-md font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                                {item.title}
                              </h4>`;

const cardImg = (itemVar) => `{(${itemVar}.coverImageUrl || ${itemVar}.results?.[0]?.imageUrl) && (
                              <div className="w-full h-32 mb-3 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                <img src={${itemVar}.coverImageUrl || ${itemVar}.results?.[0]?.imageUrl} alt="cover" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                              </div>
                            )}`;

code = code.replace(cardStart1, cardImg('item') + '\\n' + cardStart1);
code = code.replace(cardStart2, cardImg('item') + '\\n' + cardStart2);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App gallery images and pagination!");
