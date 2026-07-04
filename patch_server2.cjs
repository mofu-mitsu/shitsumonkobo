const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const oldReplace = `const html = template.replace(/<!-- Default OGP Tags[\\s\\S]*?<!-- OGP_PLACEHOLDER -->/, ogpTags);`;
const newReplace = `let html = template.replace(/<!-- Default OGP Tags[\\s\\S]*?<!-- OGP_PLACEHOLDER -->/, ogpTags);
    if (html === template) {
      html = template.replace('<!-- OGP_PLACEHOLDER -->', ogpTags);
    }`;

code = code.replace(oldReplace, newReplace);
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts regex");
