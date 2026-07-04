const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// We need to move the app.get("*") block BEFORE Vite/Express static middleware.
// Let's extract it.

const getIndex = code.indexOf('app.get("*", async (req, res, next) => {');
if (getIndex === -1) throw new Error("Could not find app.get('*')");

// It ends at:
//     res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
//   });
const endText = "res.status(200).set({ 'Content-Type': 'text/html' }).end(html);\n  });";
const endIndex = code.indexOf(endText) + endText.length;

const getBlock = code.substring(getIndex, endIndex);

// Remove it from the current position
code = code.substring(0, getIndex) + code.substring(endIndex);

// Find where to insert it: BEFORE the static middleware
const insertIndex = code.indexOf('  if (!isProd) {');

code = code.substring(0, insertIndex) + getBlock + "\n\n" + code.substring(insertIndex);

fs.writeFileSync('server.ts', code);
console.log("Moved OGP handler before static middlewares");
