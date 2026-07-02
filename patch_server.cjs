const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Add an endpoint to serve the image
const imageEndpoint = `
// OGP画像動的生成 (base64から画像ストリームへ)
app.get("/api/ogp-image", async (req, res) => {
  const sharedId = req.query.id;
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
            res.set('Content-Type', type);
            return res.send(buffer);
          }
        }
      }
    }
    // No base64 image found or error, just redirect to default
    res.redirect("/ogp.jpg"); // default
  } catch (e) {
    res.redirect("/ogp.jpg");
  }
});
`;

code = code.replace(/app\.listen\(PORT/, imageEndpoint + '\n  app.listen(PORT');

const ogpLogicOld = `              const resultsArray = data.fields.results?.arrayValue?.values;
              if (resultsArray && resultsArray.length > 0) {
                const firstResult = resultsArray[0].mapValue?.fields;
                if (firstResult && firstResult.imageUrl?.stringValue) {
                  const resultImg = firstResult.imageUrl.stringValue;
                  if (resultImg.startsWith("http")) {
                    img = resultImg;
                  } else if (resultImg.startsWith("/")) {
                    img = \`https://shitsumonkobo.vercel.app\${resultImg}\`;
                  }
                }
              }`;

const ogpLogicNew = `              const coverImg = data.fields.coverImageUrl?.stringValue;
              const resultsArray = data.fields.results?.arrayValue?.values;
              let firstResultImg = "";
              if (resultsArray && resultsArray.length > 0) {
                const firstResult = resultsArray[0].mapValue?.fields;
                if (firstResult && firstResult.imageUrl?.stringValue) {
                  firstResultImg = firstResult.imageUrl.stringValue;
                }
              }
              
              if (coverImg && coverImg.startsWith("data:image")) {
                img = \`https://shitsumonkobo.vercel.app/api/ogp-image?id=\${sharedId}\`;
              } else if (coverImg && coverImg.startsWith("http")) {
                img = coverImg;
              } else if (firstResultImg.startsWith("data:image")) {
                img = \`https://shitsumonkobo.vercel.app/api/ogp-image?id=\${sharedId}\`;
              } else if (firstResultImg.startsWith("http")) {
                img = firstResultImg;
              } else if (firstResultImg.startsWith("/")) {
                img = \`https://shitsumonkobo.vercel.app\${firstResultImg}\`;
              }`;

code = code.replace(ogpLogicOld, ogpLogicNew);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts for OGP!");
