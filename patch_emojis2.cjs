const fs = require('fs');
let code = fs.readFileSync('src/components/ContentCreator.tsx', 'utf-8');

code = code.replace(
  /value=\{content\.gimmicks\.tapBeatEmojis\.join\("\,"\)\}/g,
  'value={content.gimmicks.tapBeatEmojis.join("、")}'
);

fs.writeFileSync('src/components/ContentCreator.tsx', code);
console.log("Patched TapBeatEmojis join");
