const fs = require('fs');
let code = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf-8');

const oldSave = `      const dataUrl = await htmlToImage.toPng(resultCardRef.current, { 
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

const newSave = `      const dataUrl = await htmlToImage.toPng(resultCardRef.current, { 
        backgroundColor: '#ffffff', 
        pixelRatio: 2,
        filter: (node) => {
          if (node instanceof HTMLElement && node.dataset.excludeFromImage === 'true') {
            return false;
          }
          return true;
        }
      });`;

code = code.replace(oldSave, newSave);
fs.writeFileSync('src/components/ContentPlayer.tsx', code);
console.log("Reverted forced width");
