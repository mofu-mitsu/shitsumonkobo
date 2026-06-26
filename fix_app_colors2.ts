import * as fs from 'fs';

let appStr = fs.readFileSync('src/App.tsx', 'utf8');

// replace getSeasons
appStr = appStr.replace(
  /export const getSeasons = \(\) => \[[\s\S]*?\];/,
  `export const getSeasons = () => [
  { name: "春 (桜色)", bgColor: "from-pink-500/15 via-rose-400/10 to-pink-50", accentColor: "#ec4899", textColor: "text-pink-500", accentBg: "bg-pink-500/20 border-pink-500/30 text-pink-500", icon: "🌸", effect: "petals", titleGradient: "from-pink-600 to-rose-500", buttonGradient: "from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600", tagGradient: "from-pink-400 to-rose-400" },
  { name: "夏 (空色)", bgColor: "from-sky-500/10 via-blue-500/5 to-transparent", accentColor: "#0ea5e9", textColor: "text-sky-500", accentBg: "bg-sky-500/20 border-sky-500/30 text-sky-500", icon: "🌻", effect: "none", titleGradient: "from-sky-600 to-indigo-600", buttonGradient: "from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600", tagGradient: "from-sky-400 to-indigo-500" },
  { name: "秋 (紅葉色)", bgColor: "from-orange-500/15 via-yellow-500/10 to-green-500/5", accentColor: "#ea580c", textColor: "text-orange-600", accentBg: "bg-orange-500/20 border-orange-500/30 text-orange-600", icon: "🍁", effect: "leaves", titleGradient: "from-orange-600 to-amber-600", buttonGradient: "from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600", tagGradient: "from-orange-400 to-amber-500" },
  { name: "冬 (深雪色)", bgColor: "from-slate-300/30 via-cyan-500/10 to-blue-600/10", accentColor: "#0284c7", textColor: "text-cyan-700", accentBg: "bg-cyan-600/20 border-cyan-600/30 text-cyan-700", icon: "❄️", effect: "snow", titleGradient: "from-cyan-600 to-blue-600", buttonGradient: "from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600", tagGradient: "from-cyan-400 to-blue-500" }
];`
);

// replace titles & buttons
appStr = appStr.replace(
  /className="bg-gradient-to-tr from-sky-400 to-indigo-500 text-white font-black text-xs py-1.5 px-3 rounded-2xl shadow-md tracking-wider flex items-center gap-1.5"/g,
  'className={`bg-gradient-to-tr ${season.tagGradient} text-white font-black text-xs py-1.5 px-3 rounded-2xl shadow-md tracking-wider flex items-center gap-1.5`}'
);

appStr = appStr.replace(
  /className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600 tracking-tight pl-1"/g,
  'className={`text-xl font-black bg-clip-text text-transparent bg-gradient-to-r ${season.titleGradient} tracking-tight pl-1`}'
);

appStr = appStr.replace(
  /className="hidden sm:flex bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold px-4 py-2 rounded-2xl items-center gap-1.5 transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"/g,
  'className={`hidden sm:flex bg-gradient-to-r ${season.buttonGradient} text-white text-xs font-bold px-4 py-2 rounded-2xl items-center gap-1.5 transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer`}'
);

appStr = appStr.replace(
  /className="sm:hidden bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 shadow-sm"/g,
  'className={`sm:hidden bg-gradient-to-r ${season.buttonGradient} text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 shadow-sm`}'
);

// replace bg-sky-50 hover:bg-sky-100 text-sky-600
appStr = appStr.replace(
  /className="bg-sky-50 hover:bg-sky-100 text-sky-600 px-3 py-1.5 rounded-xl border border-sky-200 font-bold flex items-center gap-1 transition-colors cursor-pointer"/g,
  'className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1 transition-colors cursor-pointer ${season.accentBg} hover:opacity-80`}'
);

fs.writeFileSync('src/App.tsx', appStr);
