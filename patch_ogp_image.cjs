const fs = require('fs');
let code = fs.readFileSync('api/ogp-image.ts', 'utf-8');

code = code.replace(/const sharedId = req\.query\.id as string;/g, "const sharedId = (req.query.id as string)?.replace('.png', '');");

fs.writeFileSync('api/ogp-image.ts', code);
console.log("Patched ogp-image.ts");
