import * as fs from 'fs';

let appStr = fs.readFileSync('src/App.tsx', 'utf8');

appStr = appStr.replace(
  /className=\{\`bg-slate-50 text-slate-800 min-h-screen font-sans flex flex-col relative overflow-x-hidden \$\{season\.bgColor\}\`\}/,
  'className={`bg-slate-50 bg-gradient-to-br text-slate-800 min-h-screen font-sans flex flex-col relative overflow-x-hidden ${season.bgColor}`}'
);

appStr = appStr.replace(
  /<ContentPlayer \s*content=\{targetContent\} \s*onClose=/,
  '<ContentPlayer content={targetContent} season={season} onClose='
);

fs.writeFileSync('src/App.tsx', appStr);
