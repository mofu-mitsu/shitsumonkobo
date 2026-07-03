const fs = require('fs');
let code = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf-8');

code = code.replace(/mascot=\{content.gimmicks.lsiMascotImageOrEmoji \|\| "🐛"\}/, 
  "mascot={content.gimmicks.lsiMascotImageOrEmoji || \"🐛\"}\n          name={content.gimmicks.caterpillarName}");

fs.writeFileSync('src/components/ContentPlayer.tsx', code);
console.log("Patched ContentPlayer.tsx for caterpillar name");
