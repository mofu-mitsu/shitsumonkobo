const fs = require('fs');
let code = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf-8');

const oldFunc = `  const handleSaveImage = async () => {
    if (!resultCardRef.current) return;
    try {
      // Use html-to-image instead of html2canvas to support Tailwind v4 (oklch colors)
      const dataUrl = await htmlToImage.toPng(resultCardRef.current, { 
        backgroundColor: '#ffffff', 
        pixelRatio: 2,
        filter: (node) => {
          if (node instanceof HTMLElement && node.dataset.excludeFromImage === 'true') {
            return false;
          }
          return true;
        }
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = \`\${content.title}_result.png\`;
      a.click();
    } catch (e) {
      console.error("Failed to save image", e);
      if (showAlert) showAlert("エラー", "画像の保存に失敗しました。", "error");
    }
  };`;

const newFunc = `  const handleSaveImage = async () => {
    if (!resultCardRef.current) return;
    try {
      const originalWidth = resultCardRef.current.style.width;
      const originalMaxWidth = resultCardRef.current.style.maxWidth;
      const originalPadding = resultCardRef.current.style.padding;
      
      // Force PC-like width
      resultCardRef.current.style.width = '640px';
      resultCardRef.current.style.maxWidth = '640px';
      
      // Wait for layout to update so the height recalculates
      await new Promise(resolve => setTimeout(resolve, 50));

      // Use html-to-image instead of html2canvas to support Tailwind v4 (oklch colors)
      const dataUrl = await htmlToImage.toPng(resultCardRef.current, { 
        backgroundColor: '#ffffff', 
        pixelRatio: 2,
        filter: (node) => {
          if (node instanceof HTMLElement && node.dataset.excludeFromImage === 'true') {
            return false;
          }
          return true;
        }
      });

      // Restore styles
      resultCardRef.current.style.width = originalWidth;
      resultCardRef.current.style.maxWidth = originalMaxWidth;
      
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = \`\${content.title}_result.png\`;
      a.click();
    } catch (e) {
      console.error("Failed to save image", e);
      // Restore styles in case of error
      if (resultCardRef.current) {
        resultCardRef.current.style.width = '';
        resultCardRef.current.style.maxWidth = '';
      }
      if (showAlert) showAlert("エラー", "画像の保存に失敗しました。", "error");
    }
  };`;

code = code.replace(oldFunc, newFunc);
fs.writeFileSync('src/components/ContentPlayer.tsx', code);
console.log("Patched image save");
