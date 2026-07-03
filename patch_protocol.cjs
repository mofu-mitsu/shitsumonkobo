const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/const protocol = req\.protocol === 'https' \|\| req\.headers\['x-forwarded-proto'\] === 'https' \? 'https' : 'http';/,
  "const forwardedProto = req.headers['x-forwarded-proto'] || '';\n      const protocol = req.protocol === 'https' || forwardedProto.includes('https') ? 'https' : 'http';");

fs.writeFileSync('server.ts', code);
console.log("Patched protocol in server.ts");
