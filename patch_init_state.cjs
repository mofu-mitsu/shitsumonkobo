const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/const \[isInitializing, setIsInitializing\] = useState\(true\);/, 
  "const [isInitializing, setIsInitializing] = useState(false);\n  const [isLoadingGallery, setIsLoadingGallery] = useState(true);");

code = code.replace(/setPublicContents\(list\);\n\s*setIsInitializing\(false\);/, 
  "setPublicContents(list);\n      setIsLoadingGallery(false);");

code = code.replace(/setPublicContents\(initialSamples\.map\(s => \(\{\.\.\.s, isDefault: true\}\)\)\);\n\s*setIsInitializing\(false\);/, 
  "setPublicContents(initialSamples.map(s => ({...s, isDefault: true})));\n        setIsLoadingGallery(false);");

code = code.replace(/\{publicContents\.length === 0 \? \(/, 
  "{isLoadingGallery ? (<div className=\"text-center py-20 text-slate-500 font-sans bg-white/70 rounded-2xl border border-sky-100/55 animate-pulse\">ギャラリーを読み込み中...</div>) : publicContents.length === 0 ? (");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched isInitializing to false and added isLoadingGallery");
