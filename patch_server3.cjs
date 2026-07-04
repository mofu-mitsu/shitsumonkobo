const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/img = \`\$\{baseUrl\}\/api\/ogp-image\?id=\$\{sharedId\}\`;/g, 
  "img = `${baseUrl}/api/ogp/${sharedId}.png`;");
code = code.replace(/<meta name="twitter:image" content="\$\{img\}" \/>/g, 
  "<meta name=\"twitter:image\" content=\"${img}\" />\n        <meta name=\"twitter:domain\" content=\"${host}\" />");

// Add route for /api/ogp/:id.png in express
const expressRoute = `
app.get("/api/ogp/:id.png", async (req, res) => {
  const sharedId = req.params.id;
  if (!sharedId) {
    return res.status(404).send("Not found");
  }

  try {
    const response = await fetch(\`https://firestore.googleapis.com/v1/projects/ai-studio-8b45955a-b902-4ba8-8a93-bd5476d4b9d2/databases/(default)/documents/contents/\${sharedId}\`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.fields) {
        let base64String = null;
        if (data.fields.coverImageUrl?.stringValue && data.fields.coverImageUrl.stringValue.startsWith("data:image")) {
          base64String = data.fields.coverImageUrl.stringValue;
        } else {
          // fallback to result image
          const resultsArray = data.fields.results?.arrayValue?.values;
          if (resultsArray && resultsArray.length > 0) {
            const firstResult = resultsArray[0].mapValue?.fields;
            if (firstResult && firstResult.imageUrl?.stringValue && firstResult.imageUrl.stringValue.startsWith("data:image")) {
              base64String = firstResult.imageUrl.stringValue;
            }
          }
        }
        
        if (base64String) {
          const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const type = matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            res.setHeader('Content-Type', type);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return res.send(buffer);
          }
        }
      }
    }
    res.redirect("/ogp.png");
  } catch (e) {
    res.redirect("/ogp.png");
  }
});
`;

code = code.replace(/app\.get\("\/api\/ogp-image", async \(req, res\) => \{[\s\S]*?\}\);/, expressRoute);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with /api/ogp/:id.png");
