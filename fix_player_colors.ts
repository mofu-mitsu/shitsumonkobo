import * as fs from 'fs';

let playerStr = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf8');

playerStr = playerStr.replace(
  /interface ContentPlayerProps \{/,
  'interface ContentPlayerProps {\n  season?: { name: string; accentColor: string; bgGradient?: string; bgColor?: string; textColor?: string; accentBg?: string; icon: string };'
);

playerStr = playerStr.replace(
  /export default function ContentPlayer\(\{ content, onClose \}: ContentPlayerProps\) \{/,
  'export default function ContentPlayer({ content, season, onClose }: ContentPlayerProps) {'
);

// themeColorMode === "custom" 以外の時は season.bgColor などを適用するようにする。
// <div className={`min-h-[500px] flex flex-col justify-between rounded-3xl border overflow-hidden shadow-xl relative w-full font-sans ${content.themeColorMode === 'custom' ? 'text-slate-900 border-white/20' : 'bg-white/95 text-slate-800 border-sky-100'}`}
playerStr = playerStr.replace(
  /className=\{\`min-h-\[500px\] flex flex-col justify-between rounded-3xl border overflow-hidden shadow-xl relative w-full font-sans \$\{content\.themeColorMode === 'custom' \? 'text-slate-900 border-white\/20' : 'bg-white\/95 text-slate-800 border-sky-100'\}\`\}/,
  'className={`min-h-[500px] flex flex-col justify-between rounded-3xl border overflow-hidden shadow-xl relative w-full font-sans ${content.themeColorMode === "custom" ? "text-slate-900 border-white/20" : `bg-white/95 text-slate-800 border-white/40 shadow-${season?.textColor?.split("-")[1] || "sky"}-500/10`}`}'
);

// ヘッダーの背景
playerStr = playerStr.replace(
  /className=\{\` \$\{content\.themeColorMode === "custom" \? "bg-black\/10" : "bg-sky-50\/80"\} px-6 py-4 border-b border-sky-100 flex justify-between items-center flex-shrink-0 z-10\`\}/,
  'className={` ${content.themeColorMode === "custom" ? "bg-black/10" : season?.accentBg || "bg-sky-50/80"} px-6 py-4 border-b border-white/20 flex justify-between items-center flex-shrink-0 z-10 backdrop-blur-md`}'
);

// フッターの背景
playerStr = playerStr.replace(
  /className=\{\` \$\{content\.themeColorMode === "custom" \? "bg-black\/10" : "bg-sky-50\/80"\} px-6 py-4 flex-shrink-0 border-t border-sky-100 flex justify-between items-center text-xs text-slate-500 z-10 select-none\`\}/,
  'className={` ${content.themeColorMode === "custom" ? "bg-black/10" : season?.accentBg || "bg-sky-50/80"} px-6 py-4 flex-shrink-0 border-t border-white/20 flex justify-between items-center text-xs ${season?.textColor || "text-slate-500"} z-10 select-none backdrop-blur-md`}'
);

fs.writeFileSync('src/components/ContentPlayer.tsx', playerStr);
