const fs = require('fs');
let code = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf-8');

code = code.replace(/<button\s+onClick=\{handleXShare\}\s+className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center justify-center gap-1\.5 transition-all shadow-md active:scale-95 cursor-pointer w-full sm:w-auto"\s*>\s*<Share2 size=\{13\} \/> 結果をXに投稿する\s*<\/button>/, 
`<button onClick={handleSaveImage} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer w-full sm:w-auto"><Download size={13} /> 画像で保存</button>\n                <button onClick={handleXShare} className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer w-full sm:w-auto"><Share2 size={13} /> 結果をXに投稿する</button>`);

fs.writeFileSync('src/components/ContentPlayer.tsx', code);
console.log("Patched btn2");
