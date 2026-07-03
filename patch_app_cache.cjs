const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/const \[publicContents, setPublicContents\] = useState<Content\[\]>\(\[\]\);/, 
  `const [publicContents, setPublicContents] = useState<Content[]>(() => {
    try {
      const cache = localStorage.getItem("shitsumonkobo_public_cache");
      if (cache) return JSON.parse(cache);
    } catch (e) {}
    return [];
  });`);

code = code.replace(/setPublicContents\(list\);/g, 
  `setPublicContents(list);
      try { localStorage.setItem("shitsumonkobo_public_cache", JSON.stringify(list)); } catch (e) {}`);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App cache!");
