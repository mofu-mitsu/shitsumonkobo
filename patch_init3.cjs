const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/const timer = setTimeout\(\(\) => setIsInitializing\(false\), 1200\);\n\s*return \(\) => clearTimeout\(timer\);/, 
  "// Removed artificial timeout so it loads faster or when ready");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx init loading 3");
