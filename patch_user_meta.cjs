const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/currentUser\.photoURL/g, "(currentUser?.user_metadata?.avatar_url || currentUser?.user_metadata?.picture || currentUser?.user_metadata?.custom_claims?.picture)");
code = code.replace(/currentUser\.displayName/g, "(currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || '名無しの職人')");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched user metadata in App.tsx");
