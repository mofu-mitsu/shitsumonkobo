import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const seasonsDef = `
export const getSeasons = () => [
  { name: "春 (桜色)", bgColor: "from-pink-500/10 via-rose-500/5 to-transparent", accentColor: "#ec4899", textColor: "text-pink-400", accentBg: "bg-pink-500/20 border-pink-500/30 text-pink-400", icon: "🌸" },
  { name: "夏 (空色)", bgColor: "from-sky-500/10 via-blue-500/5 to-transparent", accentColor: "#0ea5e9", textColor: "text-sky-400", accentBg: "bg-sky-500/20 border-sky-500/30 text-sky-400", icon: "🌻" },
  { name: "秋 (夕色)", bgColor: "from-orange-500/10 via-amber-500/5 to-transparent", accentColor: "#f97316", textColor: "text-orange-400", accentBg: "bg-orange-500/20 border-orange-500/30 text-orange-400", icon: "🍁" },
  { name: "冬 (雪色)", bgColor: "from-indigo-500/10 via-slate-500/5 to-transparent", accentColor: "#6366f1", textColor: "text-indigo-400", accentBg: "bg-indigo-500/20 border-indigo-500/30 text-indigo-400", icon: "❄️" }
];
`;

if (!content.includes('getSeasons = () =>')) {
  content = content.replace('const getAutoSeasonColor = () => {', seasonsDef + '\nconst getAutoSeasonColor = () => {');
}

fs.writeFileSync('src/App.tsx', content);
