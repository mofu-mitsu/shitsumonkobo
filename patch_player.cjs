const fs = require('fs');
let code = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf-8');

// 1. dropdownのisAnswered判定追加
code = code.replace(
  /if \(currentQ\.type === 'five_choices' \|\| currentQ\.type === 'radio'\) \{/g,
  `if (currentQ.type === 'five_choices' || currentQ.type === 'radio' || currentQ.type === 'dropdown') {`
);

// 2. ガチャのはみ出し対応
// <h3 className="text-lg font-bold text-slate-800 break-all">{selectedGachaItem.name}</h3>
code = code.replace(
  /<h3 className="text-lg font-bold text-slate-800 break-all">\{selectedGachaItem\.name\}<\/h3>/g,
  `<h3 className="text-base sm:text-lg font-bold text-slate-800 break-all whitespace-pre-wrap leading-tight">{selectedGachaItem.name}</h3>`
);

// 3. playLogs を Supabase から取得する
// export const getPlayStats は Supabase対応に変更した (src/lib/playLogs.ts) が、
// ContentPlayer.tsx 側での呼び出しはどうなっているか？
// useEffect で fetch しているはず。

fs.writeFileSync('src/components/ContentPlayer.tsx', code);
console.log("Patched dropdown and gacha display");
