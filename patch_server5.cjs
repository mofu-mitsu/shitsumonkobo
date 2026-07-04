const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/let vite;/g, '');
code = code.replace(/let vite: any;/g, '');
code = code.replace('const distPath = path.join(process.cwd(), "dist");', 'let vite: any;\n  const distPath = path.join(process.cwd(), "dist");');

fs.writeFileSync('server.ts', code);
