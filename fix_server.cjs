const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/const html = template\.replace\('<\/head>', `\$\{ogpTags\}\\n<\/head>`\);/, 
  "const html = template.replace('<!-- OGP_PLACEHOLDER -->', ogpTags);");

fs.writeFileSync('server.ts', code);
console.log("Fixed server.ts html replace");
