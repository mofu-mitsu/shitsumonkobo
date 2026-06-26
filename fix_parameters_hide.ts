import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentCreator.tsx', 'utf8');

const regex = /\{\/\* 属性加点の詳細スライダ\/数値微調整 \*\/\}[\s\S]*?className="w-full mt-1 accent-indigo-500 cursor-pointer h-1 rounded text-indigo-500"[\s\S]*?\/>\n\s*<\/div>\n\s*\);\n\s*\}\)\}\n\s*<\/div>\n\s*<\/div>/g;

content = content.replace(regex, (match) => {
  return `{content.type !== 'quiz' && content.type !== 'survey' && (\n` + match + `\n)}`;
});

fs.writeFileSync('src/components/ContentCreator.tsx', content);
