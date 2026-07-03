const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');

code = code.replace(/secretLetterText\?: string;/, "secretLetterText?: string;\n  secretLetterMaxAppearances?: number; // 手紙の登場回数上限");
code = code.replace(/randomEventText\?: string;/, "randomEventText?: string;\n  randomEventMaxAppearances?: number; // ランダムイベントの登場回数上限");

fs.writeFileSync('src/types.ts', code);
console.log("Patched types.ts");
