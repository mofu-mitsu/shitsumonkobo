const fs = require('fs');
let code = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf-8');

code = code.replace(/<div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6">/g, 
  '<div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6" data-exclude-from-image="true">');
  
code = code.replace(/<div className="flex flex-wrap gap-3 justify-center select-none">/g, 
  '<div className="flex flex-wrap gap-3 justify-center select-none" data-exclude-from-image="true">');
  
code = code.replace(/<button\s+onClick=\{handleStart\}\s+className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-6 py-3 rounded-xl border border-sky-200 flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer w-full sm:w-auto"\s*>\s*<RotateCcw size=\{13\} \/> もう一度しつもんを解く\s*<\/button>/g,
  `<button onClick={resetPlay} className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-6 py-3 rounded-xl border border-sky-200 flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer w-full sm:w-auto"><RotateCcw size={13} /> もう一度しつもんを解く</button>`);

const oldSave = `  const handleSaveImage = async () => {
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

const newSave = `  const handleSaveImage = async () => {
    if (!resultCardRef.current) return;
    try {
      // Use html-to-image instead of html2canvas to support Tailwind v4 (oklch colors)
      // Enforce a fixed width to ensure mobile devices generate a PC-like size image
      const originalWidth = resultCardRef.current.style.width;
      const originalMaxWidth = resultCardRef.current.style.maxWidth;
      const originalTransform = resultCardRef.current.style.transform;
      
      // Temporary style adjustments for image capturing
      resultCardRef.current.style.width = '640px';
      resultCardRef.current.style.maxWidth = '640px';
      // Prevent mobile screen cut-off issue during rendering
      resultCardRef.current.style.transform = 'scale(1)';

      const dataUrl = await htmlToImage.toPng(resultCardRef.current, { 
        backgroundColor: '#ffffff', 
        pixelRatio: 2,
        width: 640,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: '640px',
          maxWidth: '640px'
        },
        filter: (node) => {
          // data-exclude-from-image がついている要素は除外
          if (node instanceof HTMLElement && node.dataset.excludeFromImage === 'true') {
            return false;
          }
          return true;
        }
      });
      
      // Restore styles
      resultCardRef.current.style.width = originalWidth;
      resultCardRef.current.style.maxWidth = originalMaxWidth;
      resultCardRef.current.style.transform = originalTransform;

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
console.log("Patched image generation");
