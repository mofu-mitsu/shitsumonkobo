import React, { useState, useEffect } from "react";
import { ShitsumonKobo_Content } from "./types";
import ContentCreator from "./components/ContentCreator";
import ContentPlayer from "./components/ContentPlayer";
import { playSound } from "./components/SoundEngine";
import WeatherEffect from "./components/WeatherEffect";
import { auth, loginWithGoogle, logout } from "./lib/firebase";
import { getPublicContents, getMyContents, getContentById, saveContent, deleteContent } from "./lib/contents";
import { onAuthStateChanged, User } from "firebase/auth";
import { Search, Sparkles, Plus, Download, Upload, Share2, Eye, Edit2, Trash2, Globe, Heart, Compass, Pocket, ArrowRight, Palette, X, Menu, HelpCircle, BarChart } from "lucide-react";
import SponsorAd from "./components/SponsorAd";
import { initialSamples } from "./data/initialSamples";

// 季節ごとのオートカラーを算出

export const getSeasons = () => [
  { name: "春 (桜色)", bgColor: "from-pink-500/15 via-rose-400/10 to-pink-50", accentColor: "#ec4899", textColor: "text-pink-500", accentBg: "bg-pink-500/20 border-pink-500/30 text-pink-500", icon: "🌸", effect: "petals", titleGradient: "from-pink-600 to-rose-500", buttonGradient: "from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600", tagGradient: "from-pink-400 to-rose-400" },
  { name: "夏 (空色)", bgColor: "from-sky-500/10 via-blue-500/5 to-transparent", accentColor: "#0ea5e9", textColor: "text-sky-500", accentBg: "bg-sky-500/20 border-sky-500/30 text-sky-500", icon: "🌻", effect: "none", titleGradient: "from-sky-600 to-indigo-600", buttonGradient: "from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600", tagGradient: "from-sky-400 to-indigo-500" },
  { name: "秋 (紅葉色)", bgColor: "from-orange-500/15 via-yellow-500/10 to-green-500/5", accentColor: "#ea580c", textColor: "text-orange-600", accentBg: "bg-orange-500/20 border-orange-500/30 text-orange-600", icon: "🍁", effect: "leaves", titleGradient: "from-orange-600 to-amber-600", buttonGradient: "from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600", tagGradient: "from-orange-400 to-amber-500" },
  { name: "冬 (深雪色)", bgColor: "from-slate-300/30 via-cyan-500/10 to-blue-600/10", accentColor: "#0284c7", textColor: "text-cyan-700", accentBg: "bg-cyan-600/20 border-cyan-600/30 text-cyan-700", icon: "❄️", effect: "snow", titleGradient: "from-cyan-600 to-blue-600", buttonGradient: "from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600", tagGradient: "from-cyan-400 to-blue-500" }
];

const getAutoSeasonColor = () => {
  const month = new Date().getMonth() + 1; // 1〜12月
  if (month >= 3 && month <= 5) {
    return getSeasons()[0];
  } else if (month >= 6 && month <= 8) {
    return getSeasons()[1];
  } else if (month >= 9 && month <= 11) {
    return getSeasons()[2];
  } else {
    return getSeasons()[3];
  }
};

export default function App() {
  const [season, setSeason] = useState(getAutoSeasonColor());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        loadMyStudio(user.uid);
      } else {
        // Fallback to local storage for guests
        loadMyStudioLocal();
      }
    });
    return () => unsubscribe();
  }, []);

  // 基本データステート
  const [publicContents, setPublicContents] = useState<ShitsumonKobo_Content[]>([]);
  const [myContents, setMyContents] = useState<ShitsumonKobo_Content[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sortOrder, setSortOrder] = useState('newest');
  
  // ナビゲーション・ビュー制御
  const [activeView, setActiveView] = useState<'gallery' | 'studio'>('gallery');
  
  // モード：'idle' | 'creating' | 'playing'
  const [appMode, setAppMode] = useState<'idle' | 'creating' | 'playing'>('idle');
  
  // 選択中のデータ（編集またはプレイ用）
  const [targetContent, setTargetContent] = useState<ShitsumonKobo_Content | null>(null);
  const [initDashboard, setInitDashboard] = useState(false);

  // モバイルメニューの開閉状態
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ヘルプモーダルの開閉状態
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // 公開・共有リンク検知用 (例: /?id=ShitsumonKobo_xxxxx)
  useEffect(() => {
    const handleUrlQuery = async () => {
      const params = new URLSearchParams(window.location.search);
      const sharedId = params.get("id");
      if (sharedId) {
        // まずサーバーから共有データを直接引っ張る
        try {
          const data = await getContentById(sharedId);
          if (data) {
            setTargetContent(data);
            setAppMode('playing');
            playSound("bell");
          } else {
            console.warn("指定された共有しつもんIDが見つかりませんでした。");
          }
        } catch (err) {
          console.error("共有しつもんのロード中に通信エラーが発生しました:", err);
        }
      }
    };
    handleUrlQuery();
  }, []);

  // サーバーの公開診断のロード
  const fetchPublicList = async () => {
    try {
      let list = await getPublicContents();
      if (list.length === 0) {
        list = initialSamples;
      }
      setPublicContents(list);
    } catch (error) {
      console.error("サーバーから公開リストの取得に失敗しました:", error);
      setPublicContents(initialSamples);
    }
  };

  // 自分の作った診断をロード
  const loadMyStudio = async (userId: string) => {
    try {
      const list = await getMyContents(userId);
      // ローカルのものとマージする
      const raw = localStorage.getItem("my_shitsumonkobo_studio");
      let localList: ShitsumonKobo_Content[] = [];
      if (raw) {
        localList = JSON.parse(raw);
      }
      
      const merged = [...list];
      localList.forEach(localItem => {
        if (!merged.find(m => m.id === localItem.id)) {
          merged.push(localItem);
        }
      });
      setMyContents(merged);
    } catch (e) {
      console.error("スタジオの読み込みに失敗しました:", e);
    }
  };

  const loadMyStudioLocal = () => {
    try {
      const raw = localStorage.getItem("my_shitsumonkobo_studio");
      if (raw) {
        setMyContents(JSON.parse(raw));
      } else {
        setMyContents([]);
      }
    } catch (e) {
      console.error("ローカルスタジオの読み込みに失敗しました:", e);
    }
  };

  useEffect(() => {
    fetchPublicList();
    if (!currentUser) {
      loadMyStudioLocal();
    }
  }, []);

  // 自身が作成した診断のローカル・サーバー重複保存＆同期
  const handleSaveContent = async (updated: ShitsumonKobo_Content) => {
    try {
      if (currentUser && !updated.creatorId) {
        updated.creatorId = currentUser.uid;
      }
      // 1. サーバーへ保存
      await saveContent(updated);

      // 2. ローカル側の更新
      let nextMy = [...myContents];
      const matchIdx = nextMy.findIndex(c => c.id === updated.id);
      if (matchIdx !== -1) {
        nextMy[matchIdx] = updated;
      } else {
        nextMy.unshift(updated);
      }
      setMyContents(nextMy);
      localStorage.setItem("my_shitsumonkobo_studio", JSON.stringify(nextMy));
      
      fetchPublicList(); // 公開リスト再ロード
      
      setAppMode('idle');
      setTargetContent(null);
      alert(`診断を保存・共有可能にしました！✨\n自分のスタジオ、またはギャラリーから選択して遊んでね。`);
    } catch (error) {
      console.error("保存失敗:", error);
      alert("保存に失敗しました。もう一度お試しください。");
    }
  };

  // 削除処理
  const handleDeleteContent = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("本当にこの診断を削除しますか？\n（マイスタジオおよび公開ギャラリーから完全に削除されます）")) return;

    try {
      // 1. サーバーから削除
      await deleteContent(id);

      // 2. ローカルから削除
      const nextMy = myContents.filter(c => c.id !== id);
      setMyContents(nextMy);
      localStorage.setItem("my_shitsumonkobo_studio", JSON.stringify(nextMy));
      
      fetchPublicList();
      playSound("bloop");
    } catch (err) {
      console.error("削除サーバー送信エラー:", err);
    }
  };

  // 共有用URLをクリップボードにコピー
  const handleCopyShareLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playSound("synth");
    
    // 一意の共有パラメータURLを創出
    const base = window.location.origin + window.location.pathname;
    const shareUrl = `${base}?id=${id}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      alert("🔗 共有専用URLをコピーしました！\n非公開診断でも、このリンクを共有すれば友達がすぐあそべるよ！");
    }).catch(err => {
      console.error("コピー失敗:", err);
      alert(`共有リンクはこちらです:\n${shareUrl}`);
    });
  };

  // JSONファイルのインポート
  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const payload = JSON.parse(e.target?.result as string);
        if (!payload.title || (!payload.questions && !payload.gachaItems)) {
          alert("これは『しつもん工房』の有効なデータファイル(.kobo.json)ではありません。");
          return;
        }

        // 新しいIDを付与してマイスタジオにインクルード
        const importedItem: ShitsumonKobo_Content = {
          ...payload,
          id: "ShitsumonKobo_" + Math.random().toString(36).substring(2, 9),
          createdAt: new Date().toISOString(),
          creatorId: currentUser?.uid
        };

        // サーバーに保存
        await saveContent(importedItem);

        const nextMy = [importedItem, ...myContents];
        setMyContents(nextMy);
        localStorage.setItem("my_shitsumonkobo_studio", JSON.stringify(nextMy));
        
        fetchPublicList();

        playSound("bell");
        alert(`ファイルから「${importedItem.title}」を正常にインポートしました！マイスタジオに格納されています。`);
      } catch (err) {
        console.error(err);
        alert("JSONファイルのパースに失敗しました。ファイルが破損している可能性があります。");
      }
    };
    reader.readAsText(file);
  };

  // JSONファイルのエクスポート
  const handleExportFile = (item: ShitsumonKobo_Content, e: React.MouseEvent) => {
    e.stopPropagation();
    playSound("synth");
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(item, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `${item.title.replace(/\s+/g, '_')}.kobo.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  // 選択してプレイ
  const launchPlayer = (item: ShitsumonKobo_Content, showDash: boolean = false) => {
    playSound("synth");
    setTargetContent(item);
    setInitDashboard(showDash);
    setAppMode('playing');
  };

  // 新規ボタン
  const launchNewCreator = () => {
    playSound("synth");
    setTargetContent(null);
    setAppMode('creating');
  };

  return (
    <div className={`bg-slate-50 bg-gradient-to-br text-slate-800 min-h-screen font-sans flex flex-col relative overflow-x-hidden ${season.bgColor}`}>
      <WeatherEffect type={(season as any).effect} />
      
      {/* 季節のオートグラデーション背景 (サマー・クリアソーダ) */}
      
 
      {/* ヘッダー */}
      <header className="border-b border-sky-100/80 bg-white/80 backdrop-blur-md sticky top-0 z-40 select-none shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
          
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              playSound("synth");
              setAppMode('idle');
              setActiveView('gallery');
            }}
          >
            <div className={`bg-gradient-to-tr ${season.tagGradient} text-white font-black text-xs py-1.5 px-3 rounded-2xl shadow-md tracking-wider flex items-center gap-1.5`}>
              <span>{season.icon}</span> しつもん工房
            </div>
            <h1 className={`text-xl font-black bg-clip-text text-transparent bg-gradient-to-r ${season.titleGradient} tracking-tight pl-1`}>
              みんなの遊び場
            </h1>
          </div>
 
          {/* PC用右側エリア */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-3">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <img src={currentUser.photoURL || ""} alt="avatar" className="w-8 h-8 rounded-full border border-sky-200" />
                  <span className="text-xs font-bold text-slate-600 max-w-[100px] truncate">{currentUser.displayName}</span>
                  <button onClick={logout} className="text-[10px] text-slate-400 hover:text-slate-600 underline cursor-pointer">ログアウト</button>
                </div>
              ) : (
                <button 
                  onClick={async () => {
                    try {
                      await loginWithGoogle();
                    } catch (err: any) {
                      if (err?.code === 'auth/operation-not-allowed') {
                        alert('FirebaseコンソールのAuthentication設定で、Googleプロバイダを有効にしてください。');
                      } else {
                        console.log("Login popup closed or failed:", err);
                      }
                    }
                  }}
                  className="bg-sky-500 hover:bg-sky-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  Googleでログイン
                </button>
              )}
            </div>

            {/* ビュー・タブ切り替え */}
            {appMode === 'idle' && (
              <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-3xl text-xs font-bold gap-1 shadow-inner">
                <button 
                  onClick={() => { setActiveView('gallery'); playSound("synth"); }}
                  className={`px-4 py-2 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeView === 'gallery' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Compass size={14} /> 公開ギャラリー
                </button>
                <button 
                  onClick={() => { setActiveView('studio'); playSound("synth"); }}
                  className={`px-4 py-2 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeView === 'studio' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Pocket size={14} /> マイスタジオ
                </button>
              </div>
            )}

            <button
              onClick={launchNewCreator}
              className={`bg-gradient-to-r ${season.buttonGradient} text-white text-xs font-bold px-4 py-2 rounded-2xl flex items-center gap-1.5 transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer`}
            >
              <Plus size={14} strokeWidth={3} /> 新しいしつもんを作る
            </button>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer"
              title="使い方・ヘルプ"
            >
              <HelpCircle size={20} />
            </button>
          </div>

          {/* スマホ用ハンバーガーボタン */}
          <div className="sm:hidden flex items-center gap-2">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="p-2 text-slate-400 hover:text-sky-500 rounded-xl transition-colors cursor-pointer"
            >
              <HelpCircle size={24} />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* スマホ用展開メニュー */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-white border-b border-slate-200 px-4 py-3 flex flex-col gap-3 shadow-md animate-in slide-in-from-top-2">
            {appMode === 'idle' && (
              <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-3xl text-xs font-bold gap-1 shadow-inner">
                <button 
                  onClick={() => { setActiveView('gallery'); playSound("synth"); setIsMobileMenuOpen(false); }}
                  className={`flex-1 py-2 rounded-2xl transition-all cursor-pointer flex justify-center items-center gap-1.5 ${
                    activeView === 'gallery' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Compass size={14} /> ギャラリー
                </button>
                <button 
                  onClick={() => { setActiveView('studio'); playSound("synth"); setIsMobileMenuOpen(false); }}
                  className={`flex-1 py-2 rounded-2xl transition-all cursor-pointer flex justify-center items-center gap-1.5 ${
                    activeView === 'studio' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Pocket size={14} /> スタジオ
                </button>
              </div>
            )}

            <button
              onClick={() => { launchNewCreator(); setIsMobileMenuOpen(false); }}
              className={`bg-gradient-to-r ${season.buttonGradient} w-full text-white text-xs font-bold px-4 py-3 rounded-2xl flex justify-center items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer`}
            >
              <Plus size={14} strokeWidth={3} /> 新しいしつもんを作る
            </button>

            <div className="h-px bg-slate-200 w-full my-1"></div>

            <div className="flex justify-center items-center">
              {currentUser ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <img src={currentUser.photoURL || ""} alt="avatar" className="w-8 h-8 rounded-full border border-sky-200" />
                    <span className="text-xs font-bold text-slate-600 truncate">{currentUser.displayName}</span>
                  </div>
                  <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-[10px] text-slate-400 hover:text-slate-600 underline cursor-pointer">ログアウト</button>
                </div>
              ) : (
                <button 
                  onClick={async () => {
                    try {
                      await loginWithGoogle();
                      setIsMobileMenuOpen(false);
                    } catch (err: any) {
                      if (err?.code === 'auth/operation-not-allowed') {
                        alert('FirebaseコンソールのAuthentication設定で、Googleプロバイダを有効にしてください。');
                      } else {
                        console.log("Login popup closed or failed:", err);
                      }
                    }
                  }}
                  className="bg-sky-500 w-full justify-center hover:bg-sky-600 text-white text-[10px] font-bold px-4 py-3 rounded-2xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  Googleでログイン
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 z-10 space-y-6 animate-fade-in">

        {/* ================= idle: リスト画面 ================= */}
        {appMode === 'idle' && (
          <div className="space-y-6">
            <div className="bg-white/80 rounded-3xl py-3 px-5 border border-sky-100 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-600 select-none shadow-sm gap-2">
              <span className="flex items-center gap-1.5">
                <span className="text-sky-500 animate-bounce">{season.icon}</span> 
                現在の季節カラー： <strong>{season.name} オート配色モード</strong> が稼働中です。
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playSound("bloop");
                    setSeason(getSeasons()[Math.floor(Math.random() * getSeasons().length)]);
                  }}
                  className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1 transition-colors cursor-pointer ${season.accentBg} hover:opacity-80`}
                >
                  <Palette size={13} /> ランダムにカラー変更する
                </button>
                <button
                  onClick={launchNewCreator}
                  className={`sm:hidden bg-gradient-to-r ${season.buttonGradient} text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 shadow-sm`}
                >
                  <Plus size={13} /> 作る
                </button>
              </div>
            </div>

            {/* A. ギャラリービュー */}
            {activeView === 'gallery' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white/70 p-3 rounded-2xl border border-sky-100 shadow-sm">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="キーワードで検索..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-[10px] font-bold text-slate-500">並び順</span>
                    <select 
                      value={sortOrder}
                      onChange={e => setSortOrder(e.target.value)}
                      className="bg-white border border-slate-200 text-xs px-2 py-1.5 rounded-xl text-slate-600 focus:outline-none focus:border-sky-400"
                    >
                      <option value="newest">新着順</option>
                      <option value="oldest">古い順</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-md font-bold text-slate-800 flex items-center gap-1.5">
                    <Globe size={16} className="text-sky-500" /> 
                    みんなの遊び場ギャラリー ({publicContents.length}件公開中)
                  </h3>
                  <p className="text-xs text-slate-500 leading-none">
                    みんなが自由に作って公開した、診断、クイズ、アンケート、ガチャで遊べます！
                  </p>
                </div>

                {publicContents.length === 0 ? (
                  <div className="text-center py-20 text-slate-500 font-sans bg-white/70 rounded-2xl border border-sky-100/55">
                    公開されているしつもんが見つかりません。右上から自分でつくってみましょう！
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {publicContents.filter(item => item.title.includes(searchQuery) || (item.description || '').includes(searchQuery)).sort((a, b) => sortOrder === 'newest' ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((item) => {
                      // 好みの着色にする
                      const itemColor = item.themeColorMode === 'custom' ? item.customColor : season.accentColor;
                      return (
                        <div 
                          key={item.id}
                          onClick={() => launchPlayer(item)}
                          className="bg-white border border-sky-100 hover:border-sky-300 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all hover:scale-101 flex flex-col justify-between cursor-pointer group min-h-[185px]"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-mono text-slate-400 block">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                              <span 
                                className="font-bold px-2 py-0.5 rounded border text-[9px]"
                                style={{ color: itemColor, borderColor: itemColor + "30", backgroundColor: itemColor + "10" }}
                              >
                                {item.type === 'diagnostic' ? '🔮 診断' : item.type === 'quiz' ? '🎯 クイズ' : item.type === 'survey' ? '📊 アンケート' : '🎁 ガチャ'}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-md font-bold text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-1 leading-snug">
                                {item.title}
                              </h4>
                              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                {item.description || "（説明文はありません）"}
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-[10px] text-slate-400 mt-3 select-none">
                            <span>作者: <strong>{item.creatorName || "名無しさん"}</strong></span>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyShareLink(item.id, e);
                                }}
                                className="text-slate-400 hover:text-sky-500 transition-colors p-1"
                                title="共有用リンク(URL)をコピー"
                              >
                                <Share2 size={13} />
                              </button>
                              <span className="text-sky-500 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-bold">
                                あそぶ <ArrowRight size={10} />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* B. マイスタジオビュー (自分が作ったもの) */}
            {activeView === 'studio' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-md font-bold text-slate-800 flex items-center gap-1.5">
                    <Heart size={16} className="text-rose-500" />
                    マイスタジオ (自身のエディター創作室)
                  </h3>
                  <p className="text-xs text-slate-500 leading-none">
                    あなたが作った診断はローカルおよびサーバーに保存されます。ここから再表示・編集・削除・エクスポートなどが選べます。
                  </p>
                </div>

                {myContents.length === 0 ? (
                  <div className="text-center py-20 text-slate-500 bg-white/70 font-sans border-2 border-dashed border-sky-100/70 rounded-2xl">
                    まだ自分で作った診断はありません。右上「自分でしつもんを作る」から作成してみてね！
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {myContents.map((item) => {
                      const itemColor = item.themeColorMode === 'custom' ? item.customColor : season.accentColor;
                      return (
                        <div 
                          key={item.id}
                          className="bg-white border border-sky-100 hover:border-sky-300 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group min-h-[180px]"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-mono text-slate-400">
                                登録ID: {item.id} ({item.isPublic ? "🌍 公開" : "🔒 非公開"})
                              </span>
                              <span 
                                className="font-bold px-2 py-0.5 rounded border text-[9px]"
                                style={{ color: itemColor, borderColor: itemColor + "30", backgroundColor: itemColor + "10" }}
                              >
                                {item.type === 'diagnostic' ? '🔮 診断' : item.type === 'quiz' ? '🎯 クイズ' : item.type === 'survey' ? '📊 アンケート' : '🎁 ガチャ'}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-md font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                                {item.title}
                              </h4>
                              <p className="text-xs text-slate-500 line-clamp-2">
                                {item.description || "（説明文はありません）"}
                              </p>
                            </div>
                          </div>

                          {/* アクション一覧 */}
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4 select-none">
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => launchPlayer(item)}
                                className="bg-sky-500 hover:bg-sky-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                              >
                                <Eye size={11} /> プレイ
                              </button>
                              <button
                                onClick={() => launchPlayer(item, true)}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                                title="プレイログと統計を見る"
                              >
                                <BarChart size={11} /> 統計
                              </button>
                              <button
                                onClick={() => {
                                  playSound("synth");
                                  setTargetContent(item);
                                  setAppMode('creating');
                                }}
                                className="bg-sky-50/60 hover:bg-sky-100 text-sky-700 border border-sky-100 rounded-lg text-[10px] font-bold px-3 py-1.5 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Edit2 size={11} /> 編集
                              </button>
                              <button
                                onClick={(e) => handleCopyShareLink(item.id, e)}
                                className="bg-sky-50/60 hover:bg-sky-100 text-sky-700 border border-sky-100 rounded-lg text-[10px] font-bold px-3 py-1.5 flex items-center gap-1 cursor-pointer transition-colors"
                                title="共有用リンク(URL)をコピー"
                              >
                                <Share2 size={11} /> 共有コピー
                              </button>
                              <button
                                onClick={(e) => handleExportFile(item, e)}
                                className="bg-sky-50/60 hover:bg-sky-100 text-sky-700 border border-sky-100 rounded-lg text-[10px] font-bold px-3 py-1.5 flex items-center gap-1 cursor-pointer transition-colors"
                                title="JSONエクスポート"
                              >
                                <Download size={11} /> 保存
                              </button>
                            </div>

                            <button
                              onClick={(e) => handleDeleteContent(item.id, e)}
                              className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                              title="マイスタジオから完全に削除"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= playing: プレイ画面（最大化） ================= */}
        {appMode === 'playing' && targetContent && (
          <ContentPlayer 
            content={targetContent} 
            season={season} 
            currentUser={currentUser} 
            initialShowDashboard={initDashboard}
            onClose={() => {
              playSound("bloop");
              setAppMode('idle');
              setTargetContent(null);
              setInitDashboard(false);
              // URLクエリから来た場合はURLパラメータを削除してリストに戻る
              const url = new URL(window.location.href);
              url.searchParams.delete("id");
              window.history.pushState({}, "", url.toString());
            }} 
          />
        )}

        {/* ================= creating: 編集・作成室 ================= */}
        {appMode === 'creating' && (
          <ContentCreator 
            season={season}
            currentUser={currentUser}
            initialContent={targetContent}
            onCancel={() => {
              playSound("bloop");
              setAppMode('idle');
              setTargetContent(null);
            }}
            onSave={handleSaveContent}
          />
        )}

      </main>

      {/* ヘルプモーダル */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-sky-50/50">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <HelpCircle size={20} className="text-sky-500" />
                しつもん工房の使い方 🛠️
              </h2>
              <button 
                onClick={() => setIsHelpOpen(false)}
                className="p-2 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-600 leading-relaxed">
              <section>
                <h3 className="text-sky-600 font-bold mb-2 flex items-center gap-1.5"><Globe size={16} /> 1. 遊ぶ (公開ギャラリー)</h3>
                <p>
                  「公開ギャラリー」では、みんなが作った診断やクイズ、たたきゲームを自由に遊ぶことができます。
                  遊び終わった後は、X(旧Twitter)で結果をシェアして盛り上がりましょう！
                </p>
              </section>

              <section>
                <h3 className="text-emerald-600 font-bold mb-2 flex items-center gap-1.5"><Plus size={16} /> 2. 作る (マイスタジオ)</h3>
                <p>
                  「新しいしつもんを作る」ボタンから、自分だけのオリジナル診断やクイズを無料で作成できます。
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>AIにおまかせ:</strong> 「AIで自動生成」を使えば、キーワードを入れるだけで質問や結果を自動で作ってくれます。</li>
                  <li><strong>ノーコード編集:</strong> スライダーや選択肢、判定式など細かい部分も直感的にカスタマイズできます。</li>
                  <li><strong>多彩なギミック:</strong> 隠しNPC、たたきゲーム、手紙、ガチャ機能など、面白い仕掛けを自由に追加！</li>
                </ul>
              </section>

              <section>
                <h3 className="text-rose-500 font-bold mb-2 flex items-center gap-1.5"><Pocket size={16} /> 3. ログインのすすめ</h3>
                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-rose-800">
                  <p className="font-bold mb-1">💡 Googleでログインすると便利です！</p>
                  <p className="text-xs">
                    ログインせずに作った作品は、ブラウザの履歴を消すと<b>編集できなくなってしまいます</b>。
                    Googleでログインしておけば、スマホやPCが変わっても、いつでも自分の作った作品を編集・管理したり、
                    他の人がどんな回答をしたかの傾向（ログ）を見ることができるようになります。
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-amber-500 font-bold mb-2 flex items-center gap-1.5"><Share2 size={16} /> 4. シェアする</h3>
                <p>
                  作った作品は「共有コピー」ボタンでURLを取得できます。友達に送ったり、SNSで宣伝して、たくさんの人に遊んでもらいましょう！
                </p>
              </section>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setIsHelpOpen(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* フッター */}
      <footer className="border-t border-sky-100 bg-white py-6 select-none z-10 text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center text-xs text-slate-500 gap-3">
          <span>
            しつもん工房 — 性格・心理類型診断・クイズ・アンケート・たたきゲーム・ガチャ・ノーコード作成プラットフォーム 🚀
          </span>
          <a href="https://mofu-mitsu.github.io/lab.html" target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:text-sky-600 transition-colors font-bold flex items-center gap-1">
            <Compass size={14} /> ホームへ戻る (LAB)
          </a>
        </div>
        <SponsorAd />
      </footer>

    </div>
  );
}
