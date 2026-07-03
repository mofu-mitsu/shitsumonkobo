const fs = require('fs');
let code = fs.readFileSync('src/data/initialSamples.ts', 'utf-8');

code = code.replace(/title: "LSI芋虫\(🐛\)の虫たたき＆ガチャ工房",/, 'title: "🐛の虫たたき＆ガチャ工房",');

fs.writeFileSync('src/data/initialSamples.ts', code);
console.log("Patched initialSamples.ts");
