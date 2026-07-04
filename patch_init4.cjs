const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/setPublicContents\(list\);/, "setPublicContents(list);\n      setIsInitializing(false);");
code = code.replace(/setPublicContents\(initialSamples\.map\(s => \(\{\.\.\.s, isDefault: true\}\)\)\);/, "setPublicContents(initialSamples.map(s => ({...s, isDefault: true})));\n        setIsInitializing(false);");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx init loading 4");
