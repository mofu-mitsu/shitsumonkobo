const fs = require('fs');
let code = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf-8');

code = code.replace(
  /<div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 my-1 mt-3">/g,
  `<div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 my-1 mt-3 overflow-hidden">`
);

code = code.replace(
  /<span className="text-2xl">\{itm\.imageUrlOrEmoji \|\| "🎁"\}<\/span>/g,
  `<span className="text-2xl whitespace-nowrap flex items-center justify-center" style={{ transform: itm.imageUrlOrEmoji.length > 2 ? \`scale(\${Math.min(1, 2.5 / itm.imageUrlOrEmoji.length)})\` : 'none', transformOrigin: 'center' }}>{itm.imageUrlOrEmoji || "🎁"}</span>`
);


code = code.replace(
  /<div className="w-28 h-28 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 shadow-inner flex-shrink-0">/g,
  `<div className="w-28 h-28 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 shadow-inner flex-shrink-0 overflow-hidden">`
);

code = code.replace(
  /<span className="text-5xl">\{selectedGachaItem\.imageUrlOrEmoji \|\| "🎁"\}<\/span>/g,
  `<span className="text-5xl whitespace-nowrap flex items-center justify-center" style={{ transform: selectedGachaItem.imageUrlOrEmoji.length > 3 ? \`scale(\${Math.min(1, 4 / selectedGachaItem.imageUrlOrEmoji.length)})\` : 'none', transformOrigin: 'center' }}>{selectedGachaItem.imageUrlOrEmoji || "🎁"}</span>`
);

fs.writeFileSync('src/components/ContentPlayer.tsx', code);
console.log("Patched emoji size.");
