const fs = require('fs');
let code = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf-8');

code = code.replace(/const pct = Math\.round\(\(count \/ totalAnswers\) \* 100\);/g, 
  "const pct = Math.round((count / totalAnswers) * 100) || 0;");

fs.writeFileSync('src/components/ContentPlayer.tsx', code);
console.log("Patched NaN");
