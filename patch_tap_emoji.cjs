const fs = require('fs');
let code = fs.readFileSync('src/components/TapBeatGame.tsx', 'utf-8');

code = code.replace(
  /\{item\.emoji\}/g,
  `<span className="whitespace-nowrap flex items-center justify-center" style={{ transform: item.emoji.length > 2 ? \`scale(\${Math.min(1, 2.5 / item.emoji.length)})\` : 'none', transformOrigin: 'center' }}>{item.emoji}</span>`
);

fs.writeFileSync('src/components/TapBeatGame.tsx', code);
console.log("Patched TapBeatGame emoji display.");
