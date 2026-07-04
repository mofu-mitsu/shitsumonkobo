const fs = require('fs');
let code = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf-8');

if (!code.includes("import html2canvas")) {
  code = code.replace(/import \{ Search/, "import html2canvas from 'html2canvas';\nimport { Search");
}
if (!code.includes("resultCardRef = useRef")) {
  code = code.replace(/const currentStepIndex = /, "const resultCardRef = useRef<HTMLDivElement>(null);\n  const currentStepIndex = ");
}

const saveImageFunc = `
  const handleSaveImage = async () => {
    if (!resultCardRef.current) return;
    try {
      const canvas = await html2canvas(resultCardRef.current, { backgroundColor: null, scale: 2 });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = \`\${content.title}_result.png\`;
      a.click();
    } catch (e) {
      console.error("Failed to save image", e);
    }
  };
`;

if (!code.includes("handleSaveImage")) {
  code = code.replace(/const handleShareX = \(\) => \{/, saveImageFunc + "\n  const handleShareX = () => {");
}

fs.writeFileSync('src/components/ContentPlayer.tsx', code);
console.log("Patched image save func");
