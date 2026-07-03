const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/const \[playHistory, setPlayHistory\] = useState<ShitsumonKobo_Content\[\]>\(\[\]\);/, 
  `const [playHistory, setPlayHistory] = useState<ShitsumonKobo_Content[]>(() => {
    try {
      const historyRaw = localStorage.getItem("shitsumonkobo_history");
      if (historyRaw) return JSON.parse(historyRaw);
    } catch (e) {}
    return [];
  });`);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App history cache!");
