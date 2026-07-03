const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');

const oldLine = `caterpillarSquishTarget: number; // 何回タップで潰せるか (デフォルト30)`;
const newLine = `caterpillarSquishTarget: number; // 何回タップで潰せるか (デフォルト30)\n  caterpillarMaxAppearances?: number; // マスコットの登場回数上限 (undefinedなら無限)`;

code = code.replace(oldLine, newLine);
fs.writeFileSync('src/types.ts', code);
console.log("Patched types!");
