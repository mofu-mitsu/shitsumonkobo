const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const utility = `
const safeSetStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn("Storage quota exceeded or unavailable for key:", key);
    // If it's history, try to keep only the 5 most recent
    if (key === "shitsumonkobo_history") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.length > 5) {
          localStorage.setItem(key, JSON.stringify(parsed.slice(0, 5)));
        }
      } catch (e2) {}
    }
  }
};
`;

code = code.replace(/const getSeasons = \(\) => \[/g, utility + '\nexport const getSeasons = () => [');

// Replace all localStorage.setItem with safeSetStorage
code = code.replace(/localStorage\.setItem\(([^,]+),\s*(.+?)\);/g, 'safeSetStorage($1, $2);');

// Fix the one I already put in a try/catch
code = code.replace(/try\s*\{\s*safeSetStorage\("shitsumonkobo_history", JSON\.stringify\(newHistory\)\);\s*\}\s*catch\(e\)\s*\{\s*console\.error\("Storage error:", e\);\s*\}/g, 'safeSetStorage("shitsumonkobo_history", JSON.stringify(newHistory));');

code = code.replace(/try\s*\{\s*safeSetStorage\("shitsumonkobo_history", JSON\.stringify\(strippedMerged\)\);\s*\}\s*catch\(e\)\{\}/g, 'safeSetStorage("shitsumonkobo_history", JSON.stringify(strippedMerged));');
code = code.replace(/try\s*\{\s*safeSetStorage\("shitsumonkobo_public_cache", JSON\.stringify\(list\)\);\s*\}\s*catch\s*\(e\)\s*\{\}/g, 'safeSetStorage("shitsumonkobo_public_cache", JSON.stringify(list));');

fs.writeFileSync('src/App.tsx', code);
console.log("Patched storage");
