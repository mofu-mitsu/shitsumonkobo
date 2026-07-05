const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/content="\$\{baseUrl\}\/\?id=\$\{sharedId \|\| ''\}"/g, 'content="${baseUrl}${req.url}"');

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts");
