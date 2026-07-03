const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf-8');

const defaultOgp = `
    <!-- Default OGP Tags (Used if server.ts is not running, e.g. static Vercel) -->
    <meta property="og:title" content="しつもん工房 | ノーコードで診断・心理テスト・クイズ・アンケート・ガチャが作れる" />
    <meta property="og:description" content="「しつもん工房」は誰でも簡単にオリジナルの診断、クイズ、アンケートを作成して遊べるプラットフォームです。あなたの個性をカタチにして、友達とシェアしよう！" />
    <meta property="og:image" content="https://shitsumonkobo.vercel.app/ogp.jpg" />
    <meta property="og:url" content="https://shitsumonkobo.vercel.app/" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="しつもん工房 | ノーコードで診断・心理テスト・クイズ・アンケート・ガチャが作れる" />
    <meta name="twitter:description" content="「しつもん工房」は誰でも簡単にオリジナルの診断、クイズ、アンケートを作成して遊べるプラットフォームです。" />
    <meta name="twitter:image" content="https://shitsumonkobo.vercel.app/ogp.jpg" />
    <!-- OGP_PLACEHOLDER -->
`;

code = code.replace(/<!-- OGP_PLACEHOLDER -->/, defaultOgp);

fs.writeFileSync('index.html', code);
console.log("Patched index.html with static OGP");
