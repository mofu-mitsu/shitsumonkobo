import * as fs from 'fs';

let playerContent = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf8');

playerContent = playerContent.replace(
  '<div className="bg-white/95 text-slate-800 min-h-[500px] flex flex-col justify-between rounded-3xl border border-sky-100 overflow-hidden shadow-xl relative w-full font-sans">', 
  `<div 
      className={\`min-h-[500px] flex flex-col justify-between rounded-3xl border overflow-hidden shadow-xl relative w-full font-sans \${content.themeColorMode === 'custom' ? 'text-slate-900 border-white/20' : 'bg-white/95 text-slate-800 border-sky-100'}\`}
      style={content.themeColorMode === 'custom' && content.customColor ? { backgroundColor: content.customColor } : undefined}
    >`
);

playerContent = playerContent.replace(/<div className="bg-sky-50\/80 px-6 py-4/g, '<div className={`${content.themeColorMode === "custom" ? "bg-black/10" : "bg-sky-50/80"} px-6 py-4');

fs.writeFileSync('src/components/ContentPlayer.tsx', playerContent);
