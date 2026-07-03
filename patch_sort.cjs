const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/const scoreA = \(a\.results\?\.length \|\| 0\) \* 10 \+ a\.questions\.length;/, 
  "const scoreA = (a.results?.length || 0) * 10 + (a.questions?.length || 0);");

code = code.replace(/const scoreB = \(b\.results\?\.length \|\| 0\) \* 10 \+ b\.questions\.length;/, 
  "const scoreB = (b.results?.length || 0) * 10 + (b.questions?.length || 0);");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched sorting safely");
