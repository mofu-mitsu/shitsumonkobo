const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/const \[isInitializing, setIsInitializing\] = useState\(false\);/, "const [isInitializing, setIsInitializing] = useState(true);");
code = code.replace(/\/\/ Removed artificial timeout so it loads faster or when ready/, "const timer = setTimeout(() => setIsInitializing(false), 1200);\n    return () => clearTimeout(timer);");

fs.writeFileSync('src/App.tsx', code);
console.log("Restored isInitializing");
