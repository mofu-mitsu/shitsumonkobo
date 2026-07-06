const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(/currentUser\?\.uid/g, "currentUser?.id");
code = code.replace(/currentUser\.uid/g, "currentUser.id");
fs.writeFileSync('src/App.tsx', code);
console.log("Patched currentUser.uid -> currentUser.id");
