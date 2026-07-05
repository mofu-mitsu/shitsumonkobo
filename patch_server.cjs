const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const match = code.match(/\/\/ 2\. OGP Image generation[\s\S]+?\}\);\n/);
if (match) {
  const ogpCode = match[0];
  code = code.replace(ogpCode, '');
  code = code.replace('// 1. Static assets and Vite dev server first', ogpCode + '\n  // 1. Static assets and Vite dev server first');
  fs.writeFileSync('server.ts', code);
  console.log('Moved OGP route up');
} else {
  console.log('Could not find OGP route');
}
