import * as fs from 'fs';

let content = fs.readFileSync('src/types.ts', 'utf8');

if (!content.includes('enableReactionEffect')) {
  // We need to add all gimmick flags
  content = content.replace('// 新規追加ギミック', '// 新規追加ギミック\n  enableReactionEffect?: boolean;\n  enableBackgroundEffect?: "none" | "snow" | "rain" | "petals" | "stars";\n  enableRandomEncounter?: boolean;\n');
  fs.writeFileSync('src/types.ts', content);
}
