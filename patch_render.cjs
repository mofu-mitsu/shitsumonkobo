const fs = require('fs');
let code = fs.readFileSync('api/render.ts', 'utf-8');

// Update Firebase URL
code = code.replace(
  /https:\/\/firestore\.googleapis\.com\/v1\/projects\/ai-studio-8b45955a-b902-4ba8-8a93-bd5476d4b9d2\/databases\/\(default\)\/documents\/contents\/\$\{sharedId\}/,
  'https://firestore.googleapis.com/v1/projects/gen-lang-client-0858097960/databases/ai-studio-8b45955a-b902-4ba8-8a93-bd5476d4b9d2/documents/contents/${sharedId}?key=AIzaSyCKiukLUs8DlGvE8CU_R4iXYxB6Yt-IanU'
);

// Fix OGP replacement fallback
const oldReplace = `const html = template.replace(/<!-- Default OGP Tags[\\s\\S]*?<!-- OGP_PLACEHOLDER -->/, ogpTags);`;
const newReplace = `let html = template.replace(/<!-- Default OGP Tags[\\s\\S]*?<!-- OGP_PLACEHOLDER -->/, ogpTags);
    if (html === template) {
      html = template.replace('<!-- OGP_PLACEHOLDER -->', ogpTags);
    }`;
code = code.replace(oldReplace, newReplace);

fs.writeFileSync('api/render.ts', code);
console.log("Patched render.ts");
