const fs = require('fs');
let code = fs.readFileSync('api/render.ts', 'utf-8');

code = code.replace(/img = \`\$\{baseUrl\}\/api\/ogp-image\?id=\$\{sharedId\}\`;/g, 
  "img = `${baseUrl}/api/ogp/${sharedId}.png`;");
code = code.replace(/twitter:image.*?>/, "twitter:image\" content=\"${img}\" />\n        <meta name=\"twitter:domain\" content=\"${host}\" />");

fs.writeFileSync('api/render.ts', code);
console.log("Patched render.ts");
