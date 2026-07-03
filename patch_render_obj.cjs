const fs = require('fs');
let code = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf-8');

code = code.replace(/\{l\.answers\[q\.id\]\}/g, "{typeof l.answers[q.id] === 'object' ? JSON.stringify(l.answers[q.id]) : l.answers[q.id]}");

fs.writeFileSync('src/components/ContentPlayer.tsx', code);
console.log("Patched render obj");
