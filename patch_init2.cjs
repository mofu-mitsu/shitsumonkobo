const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/setIsInitializing\(false\);/, "const timer = setTimeout(() => setIsInitializing(false), 1200);\n    return () => clearTimeout(timer);");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx init loading");
