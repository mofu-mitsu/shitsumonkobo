import * as fs from 'fs';

let appStr = fs.readFileSync('src/App.tsx', 'utf8');

if (!appStr.includes('Xログイン領域')) {
  appStr = appStr.replace(
    /\{\/\* ビュー・タブ切り替え \*\/\}/,
    `{/* Xログイン領域 */}
          <div className="hidden sm:flex items-center gap-3 mr-2">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <img src={currentUser.photoURL || ""} alt="avatar" className="w-8 h-8 rounded-full border border-sky-200" />
                <span className="text-xs font-bold text-slate-600 max-w-[100px] truncate">{currentUser.displayName}</span>
                <button onClick={logout} className="text-[10px] text-slate-400 hover:text-slate-600 underline">ログアウト</button>
              </div>
            ) : (
              <button 
                onClick={loginWithTwitter}
                className="bg-black hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <X size={12} /> ログイン
              </button>
            )}
          </div>
          {/* ビュー・タブ切り替え */}`
  );
}

fs.writeFileSync('src/App.tsx', appStr);
