const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/user\.uid/g, "user.id");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched user.uid to user.id in App.tsx");
