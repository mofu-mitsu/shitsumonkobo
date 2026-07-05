const fs = require('fs');

// Patch vercel.json
let vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf-8'));
vercel.rewrites.splice(1, 0, {
  "source": "/s/:id",
  "destination": "/api/render?id=$1"
});
fs.writeFileSync('vercel.json', JSON.stringify(vercel, null, 2));

// Patch server.ts
let server = fs.readFileSync('server.ts', 'utf-8');
server = server.replace(
  /const sharedId = req\.query\.id as string;/g,
  `let sharedId = req.query.id as string;
    if (!sharedId && parsedUrl.pathname.startsWith('/s/')) {
      sharedId = parsedUrl.pathname.split('/s/')[1];
    }`
);
fs.writeFileSync('server.ts', server);

// Patch api/render.ts just in case
let render = fs.readFileSync('api/render.ts', 'utf-8');
render = render.replace(
  /const sharedId = req\.query\.id as string;/g,
  `let sharedId = req.query.id as string;
    if (!sharedId && req.url) {
      const parsedUrl = new URL(req.url, 'http://localhost');
      if (parsedUrl.pathname.startsWith('/s/')) {
        sharedId = parsedUrl.pathname.split('/s/')[1];
      }
    }`
);
fs.writeFileSync('api/render.ts', render);

console.log("Patched routing");
