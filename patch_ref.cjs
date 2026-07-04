const fs = require('fs');
let code = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf-8');

code = code.replace(/<div className="bg-white border border-sky-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden text-center">/g, 
  '<div ref={resultCardRef} className="bg-white border border-sky-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden text-center">');

fs.writeFileSync('src/components/ContentPlayer.tsx', code);
console.log("Patched resultCardRef");
