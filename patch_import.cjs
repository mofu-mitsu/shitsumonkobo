const fs = require('fs');
let code = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf-8');

if (!code.includes("import html2canvas from 'html2canvas'")) {
  code = "import html2canvas from 'html2canvas';\n" + code;
  fs.writeFileSync('src/components/ContentPlayer.tsx', code);
  console.log("Patched import");
}
