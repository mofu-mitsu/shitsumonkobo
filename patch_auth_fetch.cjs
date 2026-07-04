const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/if \(user\) \{\n\s*loadMyStudio\(user\.uid\);/, "if (user) {\n        fetchPublicList();\n        loadMyStudio(user.uid);");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched auth fetch");
