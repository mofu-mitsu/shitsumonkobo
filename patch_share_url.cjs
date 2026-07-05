const fs = require('fs');
let code = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf-8');

code = code.replace(/https:\/\/shitsumonkobo\.vercel\.app\/\?id=\$\{content\.id\}/g, 'https://shitsumonkobo.vercel.app/s/${content.id}');

fs.writeFileSync('src/components/ContentPlayer.tsx', code);
console.log("Patched ContentPlayer.tsx");
