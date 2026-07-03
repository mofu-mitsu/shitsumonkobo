const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/const html = template\.replace\('<!-- OGP_PLACEHOLDER -->', ogpTags\);/, 
  "const html = template.replace(/<!-- Default OGP Tags[\\s\\S]*?<!-- OGP_PLACEHOLDER -->/, ogpTags);");

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts placeholder replacement");
