const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const searchStr = `    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get("id");`;

const replacement = `    const params = new URLSearchParams(window.location.search);
    let sharedId = params.get("id");
    if (!sharedId && window.location.pathname.startsWith('/s/')) {
      sharedId = window.location.pathname.split('/s/')[1];
    }`;

code = code.replace(searchStr, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx id parsing");
