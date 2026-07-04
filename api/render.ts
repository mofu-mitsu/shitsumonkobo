import { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const sharedId = req.query.id as string;
    let title = "しつもん工房";
    let desc = "誰でも簡単にオリジナルの診断・クイズ・アンケートが作れるプラットフォーム";
    const protocol = 'https';
    const host = req.headers.host || 'shitsumonkobo.vercel.app';
    const baseUrl = `${protocol}://${host}`;
    let img = `${baseUrl}/ogp.png`;

    if (sharedId) {
      try {
        const response = await fetch(`https://firestore.googleapis.com/v1/projects/ai-studio-8b45955a-b902-4ba8-8a93-bd5476d4b9d2/databases/(default)/documents/contents/${sharedId}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.fields) {
            const contentTitle = data.fields.title?.stringValue || "無題";
            title = `${contentTitle} - しつもん工房`;
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
              img = `${baseUrl}/api/ogp-image?id=${sharedId}`;
            } else if (coverImg && coverImg.startsWith("http")) {
              img = coverImg;
            } else if (firstResultImg.startsWith("data:image")) {
              img = `${baseUrl}/api/ogp-image?id=${sharedId}`;
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

    const distPath = path.join(process.cwd(), 'dist', 'index.html');
    let template = "";
    if (fs.existsSync(distPath)) {
      template = fs.readFileSync(distPath, "utf-8");
    } else {
      // Fallback if dist doesn't exist (e.g. during dev)
      template = `<!DOCTYPE html><html><head><!-- OGP_PLACEHOLDER --></head><body>Loading...</body></html>`;
    }

    const ogpTags = `
        <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
        <meta property="og:description" content="${desc.replace(/"/g, '&quot;')}" />
        <meta property="og:image" content="${img}" />
        <meta property="og:url" content="${baseUrl}/?id=${sharedId || ''}" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
        <meta name="twitter:description" content="${desc.replace(/"/g, '&quot;')}" />
        <meta name="twitter:image" content="${img}" />
    `;
    
    const html = template.replace(/<!-- Default OGP Tags[\s\S]*?<!-- OGP_PLACEHOLDER -->/, ogpTags);
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}
