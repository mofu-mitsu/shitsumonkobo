import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add WeatherEffect import
if (!content.includes("WeatherEffect")) {
  content = content.replace(
    /import { playSound } from "\.\/components\/SoundEngine";/,
    `import { playSound } from "./components/SoundEngine";\nimport WeatherEffect from "./components/WeatherEffect";`
  );
}

// 2. Replace root div classes and gradients
const oldRoot = /<div className="bg-\[#f0f9ff\]\/70 text-slate-800 min-h-screen font-sans flex flex-col relative overflow-x-hidden">/;
const newRoot = `<div className={\`bg-slate-50 text-slate-800 min-h-screen font-sans flex flex-col relative overflow-x-hidden \${season.bgColor}\`}>
      <WeatherEffect type={(season as any).effect} />`;

content = content.replace(oldRoot, newRoot);

const oldGrad = /<div className="absolute top-0 left-0 right-0 h-\[480px\] bg-gradient-to-b from-\[#e0f2fe\] via-\[#f0fdf4\] to-transparent pointer-events-none z-0" \/>/;
content = content.replace(oldGrad, "");

fs.writeFileSync('src/App.tsx', content);
