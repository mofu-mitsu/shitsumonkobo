import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sharedId = req.query.id as string;
  const forwardedProto = req.headers['x-forwarded-proto'] || 'https';
  const protocol = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto.split(',')[0];
  const host = req.headers.host || 'shitsumonkobo.vercel.app';
  const fallbackUrl = `${protocol}://${host}/ogp.png`;

  if (!sharedId) {
    return res.redirect(fallbackUrl);
  }

  try {
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/ai-studio-8b45955a-b902-4ba8-8a93-bd5476d4b9d2/databases/(default)/documents/contents/${sharedId}`);
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
    // No base64 image found or error, just redirect to default
    res.redirect(fallbackUrl);
  } catch (e) {
    res.redirect(fallbackUrl);
  }
}
