const fs = require('fs');
let tb = fs.readFileSync('src/components/TapBeatGame.tsx', 'utf-8');

tb = tb.replace(
  /export default function TapBeatGame\(\{([\s\S]*?)\}: TapBeatGameProps\) \{/,
  `export default function TapBeatGame({$1}: TapBeatGameProps) {\n  const validEmojis = emojis.filter(e => e.trim().length > 0);\n  const activeEmojis = validEmojis.length > 0 ? validEmojis : ["💡"];\n`
);

fs.writeFileSync('src/components/TapBeatGame.tsx', tb);
console.log("Fixed TapBeatGame.tsx");
