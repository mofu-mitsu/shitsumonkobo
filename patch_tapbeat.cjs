const fs = require('fs');

// Patch ContentCreator
let cc = fs.readFileSync('src/components/ContentCreator.tsx', 'utf-8');
cc = cc.replace(
  /const emojis = e\.target\.value\.split\(\/\[,、\]\/\)\.map\(em => em\.trim\(\)\)\.filter\(Boolean\);/,
  `const emojis = e.target.value.split(/[,、]/).map(em => em.trim());`
);
fs.writeFileSync('src/components/ContentCreator.tsx', cc);

// Patch TapBeatGame
let tb = fs.readFileSync('src/components/TapBeatGame.tsx', 'utf-8');
tb = tb.replace(
  /emojis = \["🐱", "🐸", "🐛", "💡", "💖", "🔥"\],/g,
  `emojis = ["🐱", "🐸", "🐛", "💡", "💖", "🔥"],`
); // just in case
tb = tb.replace(
  /export default function TapBeatGame\(\{\n  emojis = \["🐱", "🐸", "🐛", "💡", "💖", "🔥"\],\n  onScoreGained,\n  soundType = 'bell'\n\}: TapBeatGameProps\) \{/,
  `export default function TapBeatGame({
  emojis = ["🐱", "🐸", "🐛", "💡", "💖", "🔥"],
  onScoreGained,
  soundType = 'bell'
}: TapBeatGameProps) {
  const validEmojis = emojis.filter(e => e.trim().length > 0);
  const activeEmojis = validEmojis.length > 0 ? validEmojis : ["💡"];
`
);

tb = tb.replace(/emojis\.length/g, "activeEmojis.length");
tb = tb.replace(/emojis\[/g, "activeEmojis[");

fs.writeFileSync('src/components/TapBeatGame.tsx', tb);
console.log("Patched tap beat");
