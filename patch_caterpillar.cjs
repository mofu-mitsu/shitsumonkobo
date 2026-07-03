const fs = require('fs');
let code = fs.readFileSync('src/components/LsiCaterpillar.tsx', 'utf-8');

code = code.replace(/interface LsiCaterpillarProps \{/, "interface LsiCaterpillarProps {\n  name?: string;");
code = code.replace(/mascot = "🐛",/, "mascot = \"🐛\",\n  name = \"LSI芋虫\",");

code = code.replace(/title="LSI芋虫🐛をタップしてみてね！"/, "title={`\\${name}${mascot.startsWith('http') ? '' : mascot}をタップしてみてね！`}");

// "ふふん、新芽🌿を食べて僕は何度でも蘇るのだ！"
// Change it to generic or parameterized? The user didn't complain about revive quote, but let's leave it.

fs.writeFileSync('src/components/LsiCaterpillar.tsx', code);
console.log("Patched LsiCaterpillar.tsx");
