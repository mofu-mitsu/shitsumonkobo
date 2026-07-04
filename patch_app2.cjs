const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Remove the setTimeout from useEffect
code = code.replace(/const timer = setTimeout\(\(\) => setIsInitializing\(false\), 1200\);\n\s*return \(\) => clearTimeout\(timer\);/, 
  "");

// Add setIsInitializing(false) when data loading is done
code = code.replace(/setIsLoadingGallery\(false\);(\n\s*try \{ localStorage)/, 
  "setIsLoadingGallery(false);\n      setIsInitializing(false);$1");

code = code.replace(/setIsLoadingGallery\(false\);\n\s*\}/, 
  "setIsLoadingGallery(false);\n        setIsInitializing(false);\n      }");

// Remove the 0 items text for gallery when still loading (just in case)
// Wait, we don't need to change the render if we just wait for data

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx for isInitializing");
