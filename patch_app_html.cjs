const fs = require('fs');

// Patch package.json
let pkg = fs.readFileSync('package.json', 'utf-8');
pkg = pkg.replace('"build": "vite build && esbuild', '"build": "vite build && mv dist/index.html dist/app.html && esbuild');
fs.writeFileSync('package.json', pkg);

// Patch api/render.ts
let render = fs.readFileSync('api/render.ts', 'utf-8');
render = render.replace(/'index\.html'/g, "'app.html'");
render = render.replace(/"index\.html"/g, '"app.html"');
render = render.replace(/\`\$\{baseUrl\}\/index\.html\`/g, '`${baseUrl}/app.html`');
render = render.replace(/Failed to load \/index\.html/g, 'Failed to load /app.html');
fs.writeFileSync('api/render.ts', render);

// Patch server.ts
let server = fs.readFileSync('server.ts', 'utf-8');
server = server.replace(/index\.html/g, 'app.html');
fs.writeFileSync('server.ts', server);

console.log("Patched to use app.html");
