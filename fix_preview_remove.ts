import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentCreator.tsx', 'utf8');

const regex = /<AnimatePresence>[\s\S]*?プレビューモード \(動作確認\)[\s\S]*?<\/AnimatePresence>\n<\/div>/;

if (content.match(regex)) {
  content = content.replace(regex, "</div>");
  fs.writeFileSync('src/components/ContentCreator.tsx', content);
}

