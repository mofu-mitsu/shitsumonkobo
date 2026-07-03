const fs = require('fs');
let code = fs.readFileSync('src/components/PairingGame.tsx', 'utf-8');

code = code.replace(/onComplete: \(score: number\) => void;/, "onComplete: (score: number, connections?: Record<string, string>) => void;");
code = code.replace(/onComplete\(finalScore\);/, "onComplete(finalScore, updatedConns);");

fs.writeFileSync('src/components/PairingGame.tsx', code);
console.log("Patched PairingGame");
