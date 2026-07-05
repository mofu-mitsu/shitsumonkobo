const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/\/\?id=\$\{updated\.id\}/g, '/s/${updated.id}');
code = code.replace(/const shareUrl = \`\$\{base\}\?id=\$\{id\}\`;/g, 'const shareUrl = `${base}s/${id}`;');

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx share urls");
