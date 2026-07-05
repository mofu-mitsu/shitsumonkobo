const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const searchStr = `      if (retryCount < 2) {
        setTimeout(() => fetchPublicList(retryCount + 1), 2000);
      } else {
        setPublicContents(initialSamples.map(s => ({...s, isDefault: true})));
        setIsLoadingGallery(false);
        setIsInitializing(false);
      }`;

const replacement = `      if (retryCount < 2) {
        setTimeout(() => fetchPublicList(retryCount + 1), 2000);
      } else {
        const cached = localStorage.getItem("shitsumonkobo_public_cache");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setPublicContents(parsed);
          } catch(e) {
            setPublicContents(initialSamples.map(s => ({...s, isDefault: true})));
          }
        } else {
          setPublicContents(initialSamples.map(s => ({...s, isDefault: true})));
        }
        setIsLoadingGallery(false);
        setIsInitializing(false);
      }`;

code = code.replace(searchStr, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched fetchPublicList");
