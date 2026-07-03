const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// handleLoginClick は App() 内に定義されているので、
// まず handleLoginClick のブラウザ判定を小文字比較に修正する
code = code.replace(/const isLine = navigator.userAgent.includes\("Line"\);/, 'const ua = navigator.userAgent.toLowerCase();\n    const isLine = ua.includes("line");');
code = code.replace(/const isTwitter = navigator.userAgent.includes\("Twitter"\) \|\| navigator.userAgent.includes\("FBAV"\) \|\| navigator.userAgent.includes\("Instagram"\);/, 'const isTwitter = ua.includes("twitter") || ua.includes("fbav") || ua.includes("instagram");');

// onClickを置換
code = code.replace(/onClick=\{async \(\) => \{\s*try \{\s*await loginWithGoogle\(\);\s*\} catch \(err: any\) \{\s*if \(err\?\.code === 'auth\/operation-not-allowed'\) \{\s*showAlert\('設定エラー', 'FirebaseコンソールのAuthentication設定で、Googleプロバイダを有効にしてください。', 'error'\);\s*\} else \{\s*console\.log\("Login popup closed or failed:", err\);\s*showAlert\('ログインエラー', `ログイン処理中にエラーが発生しました。\\n\$\{err\?\.message \|\| ''\}`, 'error'\);\s*\}\s*\}\s*\}\}/g, 'onClick={handleLoginClick}');

code = code.replace(/onClick=\{async \(\) => \{\s*try \{\s*await loginWithGoogle\(\);\s*setIsMobileMenuOpen\(false\);\s*\} catch \(err: any\) \{\s*if \(err\?\.code === 'auth\/operation-not-allowed'\) \{\s*showAlert\('設定エラー', 'FirebaseコンソールのAuthentication設定で、Googleプロバイダを有効にしてください。', 'error'\);\s*\} else \{\s*console\.log\("Login popup closed or failed:", err\);\s*showAlert\('ログインエラー', `ログイン処理中にエラーが発生しました。\\n\$\{err\?\.message \|\| ''\}`, 'error'\);\s*\}\s*\}\s*\}\}/g, 'onClick={handleLoginClick}');

fs.writeFileSync('src/App.tsx', code);
console.log("Patched login button again!");
