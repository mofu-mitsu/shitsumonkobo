const fs = require('fs');
const files = ['api/render.ts', 'server.ts'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  
  content = content.replace(
    /const response = await fetch\(\`https:\/\/firestore\.googleapis\.com.*?v1\/projects\/.*?\/documents\/contents\/\$\{sharedId\}\?key=.*?\`\);/g,
    `const response = await fetch(\`\${process.env.VITE_SUPABASE_URL}/rest/v1/shitsumon_contents?id=eq.\${sharedId}&select=*\`, {
          headers: {
            'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
            'Authorization': \`Bearer \${process.env.VITE_SUPABASE_ANON_KEY || ''}\`
          }
        });`
  );
  
  // Also we need to parse the JSON differently since Supabase returns an array of objects
  const parseFirestore = `const data = await response.json();
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
            }`;
            
  const parseSupabase = `const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const row = data[0];
            title = \`\${row.title || "無題"} - しつもん工房\`;
            desc = row.description || desc;
            
            const coverImg = row.coverImageUrl;
            const resultsArray = row.results;
            let firstResultImg = "";
            if (resultsArray && resultsArray.length > 0) {
              if (resultsArray[0].imageUrl) {
                firstResultImg = resultsArray[0].imageUrl;
              }
            }`;
            
  content = content.replace(parseFirestore, parseSupabase);
  
  // For OGP Image base64 route in server.ts
  const parseFirestoreBase64 = `const data = await response.json();
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
          }`;
          
  const parseSupabaseBase64 = `const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const row = data[0];
          let base64String = null;
          if (row.coverImageUrl && row.coverImageUrl.startsWith("data:image")) {
            base64String = row.coverImageUrl;
          } else {
            if (row.results && row.results.length > 0) {
              if (row.results[0].imageUrl && row.results[0].imageUrl.startsWith("data:image")) {
                base64String = row.results[0].imageUrl;
              }
            }
          }`;

  content = content.replace(parseFirestoreBase64, parseSupabaseBase64);
  
  fs.writeFileSync(file, content);
}

console.log("Patched server.ts and render.ts for Supabase");
