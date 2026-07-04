const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Update Firebase URL
code = code.replace(
  /https:\/\/firestore\.googleapis\.com\/v1\/projects\/ai-studio-8b45955a-b902-4ba8-8a93-bd5476d4b9d2\/databases\/\(default\)\/documents\/contents\/\$\{sharedId\}/g,
  'https://firestore.googleapis.com/v1/projects/gen-lang-client-0858097960/databases/ai-studio-8b45955a-b902-4ba8-8a93-bd5476d4b9d2/documents/contents/${sharedId}?key=AIzaSyCKiukLUs8DlGvE8CU_R4iXYxB6Yt-IanU'
);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts");
