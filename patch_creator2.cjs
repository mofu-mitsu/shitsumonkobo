const fs = require('fs');
let code = fs.readFileSync('src/components/ContentCreator.tsx', 'utf-8');

code = code.replace(
  /import \{ User \} from "firebase\/auth";/g,
  `type User = any;`
);

fs.writeFileSync('src/components/ContentCreator.tsx', code);
console.log("Patched ContentCreator.tsx User");
