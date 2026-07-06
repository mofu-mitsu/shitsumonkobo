const fs = require('fs');
let code = fs.readFileSync('src/components/ContentCreator.tsx', 'utf-8');

code = code.replace(
  /placeholder="例: 🐱,🐸,🦁,🐛"/g,
  'placeholder="例: 🐱、🐸、( ´ ▽ \` )、🐛"'
);

fs.writeFileSync('src/components/ContentCreator.tsx', code);
console.log("Patched emoticon placeholder");
