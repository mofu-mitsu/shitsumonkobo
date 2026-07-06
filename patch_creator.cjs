const fs = require('fs');
let code = fs.readFileSync('src/components/ContentCreator.tsx', 'utf-8');

code = code.replace(
  /const \{ loginWithGoogle \} = await import\("\.\.\/lib\/firebase"\);/g,
  `const { loginWithGoogle } = await import("../lib/auth");`
);

code = code.replace(
  /FirebaseコンソールのAuthentication設定で、Googleプロバイダを有効にしてください。/g,
  `SupabaseコンソールのAuthentication設定で、Googleプロバイダを有効にしてください。`
);

fs.writeFileSync('src/components/ContentCreator.tsx', code);
console.log("Patched ContentCreator.tsx auth");
