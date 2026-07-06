const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /\(currentUser\?\.user_metadata\?\.avatar_url \|\| currentUser\?\.user_metadata\?\.picture \|\| currentUser\?\.user_metadata\?\.custom_claims\?\.picture\) \|\| ""/g,
  `(currentUser?.user_metadata?.avatar_url || currentUser?.user_metadata?.picture || currentUser?.user_metadata?.custom_claims?.picture) || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${currentUser?.id}\``
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched avatar fallback");
