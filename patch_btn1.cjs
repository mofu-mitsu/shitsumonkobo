const fs = require('fs');
let code = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf-8');

code = code.replace(/<button\s+onClick=\{handleXShare\}\s+className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer text-sm w-full sm:w-auto flex items-center justify-center gap-1\.5"\s*>\s*<Share2 size=\{14\} \/> Xでシェアする\s*<\/button>/, 
`<button onClick={handleSaveImage} className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer text-sm w-full sm:w-auto flex items-center justify-center gap-1.5"><Download size={14} /> 画像で保存</button>\n                <button onClick={handleXShare} className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer text-sm w-full sm:w-auto flex items-center justify-center gap-1.5"><Share2 size={14} /> Xでシェアする</button>`);

fs.writeFileSync('src/components/ContentPlayer.tsx', code);
console.log("Patched btn1");
