const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/setPublicContents\(initialSamples\.map\(s => \(\{\.\.\.s, isDefault: true\}\)\)\);\n\s*setIsLoadingGallery\(false\);\n\s*\}/, 
  "setPublicContents(initialSamples.map(s => ({...s, isDefault: true})));\n        setIsLoadingGallery(false);\n      }");

fs.writeFileSync('src/App.tsx', code);
console.log("Verified App.tsx structure");
