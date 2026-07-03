const fs = require('fs');
let code = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf-8');

const oldPlayerCode = `mascot={content.gimmicks.lsiMascotImageOrEmoji || "🐛"} `;
const newPlayerCode = `mascot={content.gimmicks.lsiMascotImageOrEmoji || "🐛"} \n          maxAppearances={content.gimmicks.caterpillarMaxAppearances}`;

code = code.replace(oldPlayerCode, newPlayerCode);
fs.writeFileSync('src/components/ContentPlayer.tsx', code);
console.log("Patched ContentPlayer caterpillar!");
