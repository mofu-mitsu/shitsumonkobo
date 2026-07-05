const fs = require('fs');

// Patch api/render.ts
let render = fs.readFileSync('api/render.ts', 'utf-8');
render = render.replace(
  /const ogpTags = \`/g,
  `const finalUrl = sharedId ? \`\${baseUrl}/s/\${sharedId}\` : \`\${baseUrl}\${req.url}\`;
    const ogpTags = \``
);
render = render.replace(
  /<meta property="og:url" content="\$\{baseUrl\}\$\{req\.url\}" \/>/g,
  '<meta property="og:url" content="${finalUrl}" />'
);
fs.writeFileSync('api/render.ts', render);

// Patch server.ts
let server = fs.readFileSync('server.ts', 'utf-8');
server = server.replace(
  /const ogpTags = \`/g,
  `const finalUrl = sharedId ? \`\${baseUrl}/s/\${sharedId}\` : \`\${baseUrl}\${req.url}\`;
    const ogpTags = \``
);
server = server.replace(
  /<meta property="og:url" content="\$\{baseUrl\}\$\{req\.url\}" \/>/g,
  '<meta property="og:url" content="${finalUrl}" />'
);
fs.writeFileSync('server.ts', server);

console.log("Patched og:url to use /s/:id");
