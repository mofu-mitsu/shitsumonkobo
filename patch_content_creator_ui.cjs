const fs = require('fs');
let code = fs.readFileSync('src/components/ContentCreator.tsx', 'utf-8');

code = code.replace(
  /<option value="">カスタム式を入力する\.\.\.<\/option>/g,
  '<option value="">-- 属性を選択してください --</option>'
);

fs.writeFileSync('src/components/ContentCreator.tsx', code);
console.log("Patched ContentCreator.tsx");
