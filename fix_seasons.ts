import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /export const getSeasons = \(\) => \[[\s\S]*?\];\n\nconst getAutoSeasonColor = \(\) => \{[\s\S]*?else \{\n.*return \{\n.*name: "冬 \(雪の銀世界\)",[\s\S]*?\}\n\}/;

const replacement = `export const getSeasons = () => [
  { name: "春 (桜色)", bgColor: "from-pink-500/15 via-rose-400/10 to-pink-50", accentColor: "#ec4899", textColor: "text-pink-500", accentBg: "bg-pink-500/20 border-pink-500/30 text-pink-500", icon: "🌸", effect: "petals" },
  { name: "夏 (空色)", bgColor: "from-sky-500/10 via-blue-500/5 to-transparent", accentColor: "#0ea5e9", textColor: "text-sky-500", accentBg: "bg-sky-500/20 border-sky-500/30 text-sky-500", icon: "🌻", effect: "none" },
  { name: "秋 (紅葉色)", bgColor: "from-orange-500/15 via-yellow-500/10 to-green-500/5", accentColor: "#ea580c", textColor: "text-orange-600", accentBg: "bg-orange-500/20 border-orange-500/30 text-orange-600", icon: "🍁", effect: "leaves" },
  { name: "冬 (深雪色)", bgColor: "from-slate-300/30 via-cyan-500/10 to-blue-600/10", accentColor: "#0284c7", textColor: "text-cyan-700", accentBg: "bg-cyan-600/20 border-cyan-600/30 text-cyan-700", icon: "❄️", effect: "snow" }
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
  }`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content);
