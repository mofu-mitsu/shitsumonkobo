const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf-8');

server = server.replace(/path\.resolve\("app\.html"\)/g, 'path.resolve("index.html")');

fs.writeFileSync('server.ts', server);
console.log("Fixed server.ts");
