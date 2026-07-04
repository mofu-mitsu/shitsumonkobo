const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Move OGP generation BEFORE vite.middlewares?
// No, move vite.middlewares BEFORE OGP HTML generation

const ogpBlock = `  // OGP画像動的生成 (base64から画像ストリームへ)
app.get("/api/ogp/:id.png", async (req, res) => {`;

const startBlock = `  // HTMLリクエストをインターセプトしてOGPを動的に埋め込む`;

// Actually we just need to let express.static and vite.middlewares run first.

const newOrder = `
  // 1. Static assets and Vite dev server first
  if (!isProd) {
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath, { index: false })); // index.htmlを静的配信しない
  }

  // 2. OGP Image generation
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
            const matches = base64String.match(/^data:([A-Za-z-+\\/]+);base64,(.+)$/);
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

  // 3. HTML SPA fallback with OGP injection
  app.get("*", async (req, res, next) => {
    if (req.url.startsWith('/api') || req.url === '/admax.html') {
      return next();
    }
    
    // We already let Vite and Express static handle everything else, so anything reaching here should be a page request.
    const parsedUrl = new URL(req.url, 'http://localhost');
    const ext = path.extname(parsedUrl.pathname);
    // Even if it has an extension, if it missed the static folder, we might want to 404, but standard SPA fallback returns index.html.
    // To be safe against returning HTML for missing .js files:
    if (ext && ext !== '.html') {
      return res.status(404).send("Not found");
    }

    const sharedId = req.query.id as string;
    let title = "しつもん工房";
    let desc = "誰でも簡単にオリジナルの診断・クイズ・アンケートが作れるプラットフォーム";
    const forwardedProto = req.headers['x-forwarded-proto'] || '';
    const protocol = req.protocol === 'https' || forwardedProto.includes('https') ? 'https' : 'http';
    const host = req.get('host') || 'shitsumonkobo.vercel.app';
    const baseUrl = \`\${protocol}://\${host}\`;
    let img = \`\${baseUrl}/ogp.png\`;

    if (sharedId) {
      try {
        const response = await fetch(\`https://firestore.googleapis.com/v1/projects/ai-studio-8b45955a-b902-4ba8-8a93-bd5476d4b9d2/databases/(default)/documents/contents/\${sharedId}\`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.fields) {
            const contentTitle = data.fields.title?.stringValue || "無題";
            title = \`\${contentTitle} - しつもん工房\`;
            desc = data.fields.description?.stringValue || desc;
            
            const coverImg = data.fields.coverImageUrl?.stringValue;
            const resultsArray = data.fields.results?.arrayValue?.values;
            let firstResultImg = "";
            if (resultsArray && resultsArray.length > 0) {
              const firstResult = resultsArray[0].mapValue?.fields;
              if (firstResult && firstResult.imageUrl?.stringValue) {
                firstResultImg = firstResult.imageUrl.stringValue;
              }
            }
            
            if (coverImg && coverImg.startsWith("data:image")) {
              img = \`\${baseUrl}/api/ogp/\${sharedId}.png\`;
            } else if (coverImg && coverImg.startsWith("http")) {
              img = coverImg;
            } else if (firstResultImg.startsWith("data:image")) {
              img = \`\${baseUrl}/api/ogp/\${sharedId}.png\`;
            } else if (firstResultImg.startsWith("http")) {
              img = firstResultImg;
            } else if (firstResultImg.startsWith("/")) {
              img = \`\${baseUrl}\${firstResultImg}\`;
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch OGP data from Firestore", e);
      }
    }

    let template = "";
    if (!isProd) {
      template = fs.readFileSync(path.resolve("index.html"), "utf-8");
      template = await vite.transformIndexHtml(req.url, template);
    } else {
      template = fs.readFileSync(path.join(distPath, "index.html"), "utf-8");
    }

    const ogpTags = \`
      <meta property="og:title" content="\${title.replace(/"/g, '&quot;')}" />
      <meta property="og:description" content="\${desc.replace(/"/g, '&quot;')}" />
      <meta property="og:image" content="\${img}" />
      <meta property="og:url" content="\${baseUrl}/?id=\${sharedId || ''}" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="\${title.replace(/"/g, '&quot;')}" />
      <meta name="twitter:description" content="\${desc.replace(/"/g, '&quot;')}" />
      <meta name="twitter:image" content="\${img}" />
      <meta name="twitter:domain" content="\${host}" />
    \`;
    
    const html = template.replace(/<!-- Default OGP Tags[\\s\\S]*?<!-- OGP_PLACEHOLDER -->/, ogpTags);
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
  });
`;

code = code.replace(/\/\/ HTMLリクエストをインターセプトしてOGPを動的に埋め込む[\s\S]*?res\.redirect\("\/ogp\.png"\);\n\s*\}\n\s*\}\);\n/m, newOrder);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts routes order");
