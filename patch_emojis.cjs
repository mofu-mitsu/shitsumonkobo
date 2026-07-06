const fs = require('fs');
let code = fs.readFileSync('src/components/ContentCreator.tsx', 'utf-8');

code = code.replace(
  /const emojis = e\.target\.value\.split\("\,"\)\.map\(em => em\.trim\(\)\)\.filter\(Boolean\);/g,
  'const emojis = e.target.value.split(/[,、]/).map(em => em.trim()).filter(Boolean);'
);

code = code.replace(
  /<label className="block text-\[10px\] text-slate-500 font-bold mb-1">出現させる浮遊絵文字たち \(半角カンマ区切り\)<\/label>/g,
  '<label className="block text-[10px] text-slate-500 font-bold mb-1">出現させる浮遊絵文字・顔文字たち (カンマまたは読点で区切り)</label>'
);

fs.writeFileSync('src/components/ContentCreator.tsx', code);
console.log("Patched TapBeatEmojis separator");
