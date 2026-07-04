const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Ensure 'let vite;' is at the top
if (!code.includes('let vite;')) {
  code = code.replace('const isProd = process.env.NODE_ENV === "production";', 'const isProd = process.env.NODE_ENV === "production";\nlet vite;');
}

// And if isProd is not at the top, find it.
if (!code.includes('let vite;')) {
  code = code.replace('const PORT = 3000;', 'const PORT = 3000;\nconst isProd = process.env.NODE_ENV === "production";\nlet vite;');
}

// But wait, the order should be:
// 1. vite init
// 2. static middlewares
// 3. app.get("*")
// No! If app.get("*") is BEFORE static, it must have access to vite.
// Let's just manually reorder.

fs.writeFileSync('server.ts', code);
