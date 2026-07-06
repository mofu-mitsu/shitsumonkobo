const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /import \{ auth, loginWithGoogle, logout \} from "\.\/lib\/firebase";\nimport \{ onAuthStateChanged, User \} from "firebase\/auth";/g,
  `import { loginWithGoogle, logout, onAuthStateChanged } from "./lib/auth";\ntype User = any;`
);

code = code.replace(
  /const unsubscribe = onAuthStateChanged\(auth, async \(user\) => \{/g,
  `const unsubscribe = onAuthStateChanged(async (user) => {`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx auth");
