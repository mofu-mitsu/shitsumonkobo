const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const oldCheck = `if (req.headers.accept?.includes("text/html")) {`;
const newCheck = `
    const parsedUrl = new URL(req.url, 'http://localhost');
    const ext = path.extname(parsedUrl.pathname);
    const isPageRequest = !ext || ext === '.html';

    if (isPageRequest) {
`;

code = code.replace(oldCheck, newCheck);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts OGP intercept");
