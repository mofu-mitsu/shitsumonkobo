const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /const sharedId = params\.get\("id"\);\n      if \(sharedId\) {/g,
  `let sharedId = params.get("id");\n      if (!sharedId && window.location.pathname.startsWith('/s/')) {\n        sharedId = window.location.pathname.split('/s/')[1];\n      }\n      if (sharedId) {`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched handleUrlQuery");
