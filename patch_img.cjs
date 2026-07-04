const fs = require('fs');
let code = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf-8');

code = code.replace(/import html2canvas from 'html2canvas';/, "import * as htmlToImage from 'html-to-image';");

const oldSave = `  const handleSaveImage = async () => {
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
  };`;

const newSave = `  const handleSaveImage = async () => {
    if (!resultCardRef.current) return;
    try {
      // Use html-to-image instead of html2canvas to support Tailwind v4 (oklch colors)
      const dataUrl = await htmlToImage.toPng(resultCardRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = \`\${content.title}_result.png\`;
      a.click();
    } catch (e) {
      console.error("Failed to save image", e);
      if (showAlert) showAlert("エラー", "画像の保存に失敗しました。", "error");
    }
  };`;

code = code.replace(oldSave, newSave);

fs.writeFileSync('src/components/ContentPlayer.tsx', code);
console.log("Patched ContentPlayer image save");
