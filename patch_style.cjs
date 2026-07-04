const fs = require('fs');
let code = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf-8');

const oldSave = `      // Enforce a fixed width to ensure mobile devices generate a PC-like size image
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
      resultCardRef.current.style.transform = originalTransform;`;

const newSave = `      const dataUrl = await htmlToImage.toPng(resultCardRef.current, { 
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
      });`;

code = code.replace(oldSave, newSave);
fs.writeFileSync('src/components/ContentPlayer.tsx', code);
console.log("Patched style flickering issue");
