const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(
  /const base = window\.location\.origin \+ window\.location\.pathname;\n    const shareUrl = \`\$\{base\}s\/\$\{id\}\`;/g,
  'const shareUrl = `${window.location.origin}/s/${id}`;'
);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched shareUrl");
