const fs = require('fs');
let code = fs.readFileSync('api/render.ts', 'utf-8');

code = code.replace(/api\/ogp-image\?id=\$\{sharedId\}/g, 'api/ogp/${sharedId}.png');
code = code.replace(/content="\$\{baseUrl\}\/\?id=\$\{sharedId \|\| ''\}"/g, 'content="${baseUrl}${req.url}"');

fs.writeFileSync('api/render.ts', code);
console.log("Patched render.ts");
