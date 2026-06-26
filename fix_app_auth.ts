import * as fs from 'fs';

// 1. App.tsx に認証を追加する
let appStr = fs.readFileSync('src/App.tsx', 'utf8');

// インポートの追加
if (!appStr.includes('import { auth, loginWithTwitter, logout }')) {
  appStr = appStr.replace(
    /import \{ Search,/,
    `import { auth, loginWithTwitter, logout } from "./lib/firebase";\nimport { onAuthStateChanged, User } from "firebase/auth";\nimport { Search,`
  );
}

// ユーザー状態の追加
if (!appStr.includes('const [currentUser, setCurrentUser]')) {
  appStr = appStr.replace(
    /const \[searchQuery, setSearchQuery\] = useState\(''\);/,
    `const [searchQuery, setSearchQuery] = useState('');\n  const [currentUser, setCurrentUser] = useState<User | null>(null);`
  );
}

// useEffect で認証を監視
if (!appStr.includes('onAuthStateChanged(auth,')) {
  appStr = appStr.replace(
    /export default function App\(\) \{[\s\S]*?const \[season, setSeason\] = useState\(getAutoSeasonColor\(\)\);/,
    `export default function App() {\n  const [season, setSeason] = useState(getAutoSeasonColor());\n\n  useEffect(() => {\n    const unsubscribe = onAuthStateChanged(auth, (user) => {\n      setCurrentUser(user);\n    });\n    return () => unsubscribe();\n  }, []);`
  );
}

// ヘッダーにログインボタンを追加
if (!appStr.includes('currentUser ?')) {
  appStr = appStr.replace(
    /\{ \/\* ビュー・タブ切り替え \*\/ \}/,
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
          { /* ビュー・タブ切り替え */ }`
  );
}

// Xのインポート追加
if (!appStr.includes('X } from "lucide-react"')) {
  appStr = appStr.replace(/Palette \} from "lucide-react";/, 'Palette, X } from "lucide-react";');
}

// ユーザーを ContentCreator に渡す
if (!appStr.includes('currentUser={currentUser}')) {
  appStr = appStr.replace(
    /<ContentCreator \s*season=\{season\}/,
    '<ContentCreator \n            season={season}\n            currentUser={currentUser}'
  );
}

fs.writeFileSync('src/App.tsx', appStr);
