import { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    let sharedId = req.query.id as string;
    if (!sharedId && req.url) {
      const parsedUrl = new URL(req.url, 'http://localhost');
      if (parsedUrl.pathname.startsWith('/s/')) {
        sharedId = parsedUrl.pathname.split('/s/')[1];
      }
    }
    let title = "しつもん工房";
    let desc = "誰でも簡単にオリジナルの診断・クイズ・アンケートが作れるプラットフォーム";
    const forwardedProto = req.headers['x-forwarded-proto'] || 'https';
    const protocol = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto.split(',')[0];
    const host = req.headers.host || 'shitsumonkobo.vercel.app';
    const baseUrl = `${protocol}://${host}`;
    let img = `${baseUrl}/ogp.png`;

    if (sharedId) {
      try {
        const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/shitsumon_contents?id=eq.${sharedId}&select=*`, {
          headers: {
            'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY || ''}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const row = data[0];
            title = `${row.title || "無題"} - しつもん工房`;
            desc = row.description || desc;
            
            const coverImg = row.coverImageUrl;
            const resultsArray = row.results;
            let firstResultImg = "";
            if (resultsArray && resultsArray.length > 0) {
              if (resultsArray[0].imageUrl) {
                firstResultImg = resultsArray[0].imageUrl;
              }
            }
            
            if (coverImg && coverImg.startsWith("data:image")) {
              img = `${baseUrl}/api/ogp/${sharedId}.png`;
            } else if (coverImg && coverImg.startsWith("http")) {
              img = coverImg;
            } else if (firstResultImg.startsWith("data:image")) {
              img = `${baseUrl}/api/ogp/${sharedId}.png`;
            } else if (firstResultImg.startsWith("http")) {
              img = firstResultImg;
            } else if (firstResultImg.startsWith("/")) {
              img = `${baseUrl}${firstResultImg}`;
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch OGP data from Firestore", e);
      }
    }

    let template = "";
    
    // Try to read index.html from disk
    const distPath = path.join(process.cwd(), 'dist', 'app.html');
    const publicPath = path.join(process.cwd(), 'public', 'app.html');
    const rootPath = path.join(process.cwd(), 'app.html');
    
    if (fs.existsSync(distPath)) {
      template = fs.readFileSync(distPath, "utf-8");
    } else if (fs.existsSync(publicPath)) {
      template = fs.readFileSync(publicPath, "utf-8");
    } else if (fs.existsSync(rootPath)) {
      template = fs.readFileSync(rootPath, "utf-8");
    } else {
      // Fallback to fetch /index.html (which is served statically by Vercel and excluded from rewrites)
      try {
        const htmlRes = await fetch(`${baseUrl}/app.html`);
        if (htmlRes.ok) {
          template = await htmlRes.text();
        } else {
          throw new Error("Failed to load /app.html");
        }
      } catch (err) {
        template = `<!DOCTYPE html><html><head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <title>しつもん工房 | ノーコードで診断・心理テスト・クイズ・アンケート・ガチャが作れる</title>
      <!-- OGP_PLACEHOLDER -->
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="/src/main.tsx"></script>
    </body></html>`;
      }
    }

    const finalUrl = sharedId ? `${baseUrl}/s/${sharedId}` : `${baseUrl}${req.url}`;
    const ogpTags = `
        <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
        <meta property="og:description" content="${desc.replace(/"/g, '&quot;')}" />
        <meta property="og:image" content="${img}" />
        <meta property="og:url" content="${finalUrl}" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
        <meta name="twitter:description" content="${desc.replace(/"/g, '&quot;')}" />
        <meta name="twitter:image" content="${img}" />
        <meta name="twitter:domain" content="${host}" />
    `;
    
    // Inject OGP tags
    let html = template.replace(/<!-- Default OGP Tags[\s\S]*?<!-- OGP_PLACEHOLDER -->/, ogpTags);
    if (html === template) {
      html = template.replace('<!-- OGP_PLACEHOLDER -->', ogpTags);
    }
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}
