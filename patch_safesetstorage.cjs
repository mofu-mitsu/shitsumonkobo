const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /try {\n    safeSetStorage\(key, value\);\n  } catch/g,
  'try {\n    localStorage.setItem(key, value);\n  } catch'
);

code = code.replace(
  /        if \(Array\.isArray\(parsed\) && parsed\.length > 5\) {\n          safeSetStorage\(key, JSON\.stringify\(parsed\.slice\(0, 5\)\)\);\n        }/g,
  '        if (Array.isArray(parsed) && parsed.length > 5) {\n          localStorage.setItem(key, JSON.stringify(parsed.slice(0, 5)));\n        }'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched safeSetStorage");
