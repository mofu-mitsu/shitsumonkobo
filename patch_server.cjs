const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/let img = \`https:\/\/shitsumonkobo\.vercel\.app\/ogp\.jpg\`;/g, 
  "const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';\n      const host = req.get('host') || 'shitsumonkobo.vercel.app';\n      const baseUrl = `${protocol}://${host}`;\n      let img = `${baseUrl}/ogp.jpg`;");

code = code.replace(/img = \`https:\/\/shitsumonkobo\.vercel\.app\/api\/ogp-image\?id=\$\{sharedId\}\`;/g, 
  "img = `${baseUrl}/api/ogp-image?id=${sharedId}`;");

code = code.replace(/img = \`https:\/\/shitsumonkobo\.vercel\.app\$\{firstResultImg\}\`;/g, 
  "img = `${baseUrl}${firstResultImg}`;");

code = code.replace(/https:\/\/shitsumonkobo\.vercel\.app\/\?id=\$\{sharedId \|\| ''\}/g,
  "${baseUrl}/?id=${sharedId || ''}");

code = code.replace(/const html = template\.replace\('<\/head>', \`\$\{ogpTags\}\\n<\/head>'\);/, 
  "const html = template.replace('<!-- OGP_PLACEHOLDER -->', ogpTags);");

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts");
