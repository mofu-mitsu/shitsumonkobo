import * as fs from 'fs';

let appStr = fs.readFileSync('src/App.tsx', 'utf8');

// App.tsx で ContentPlayer に currentUser を渡すようにする
if (!appStr.includes('currentUser={currentUser}')) {
  appStr = appStr.replace(
    /<ContentPlayer content=\{targetContent\} season=\{season\} onClose=/,
    '<ContentPlayer content={targetContent} season={season} currentUser={currentUser} onClose='
  );
}
fs.writeFileSync('src/App.tsx', appStr);

let playerStr = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf8');

// ContentPlayerProps に currentUser を追加
if (!playerStr.includes('currentUser?: any;')) {
  playerStr = playerStr.replace(
    /interface ContentPlayerProps \{/,
    'interface ContentPlayerProps {\n  currentUser?: any;'
  );
}
if (!playerStr.includes('currentUser, onClose')) {
  playerStr = playerStr.replace(
    /export default function ContentPlayer\(\{ content, season, onClose \}: ContentPlayerProps\) \{/,
    'export default function ContentPlayer({ content, season, currentUser, onClose }: ContentPlayerProps) {'
  );
}

// xAccount を作成者名の下に表示
if (!playerStr.includes('content.creatorXHandle')) {
  playerStr = playerStr.replace(
    /<span>\{content\.creatorName\}<\/span>/,
    `<span>{content.creatorName} {content.creatorXHandle && <a href={\`https://x.com/\${content.creatorXHandle}\`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sky-500 hover:underline"><X size={10} />{content.creatorXHandle}</a>}</span>`
  );
}
// そもそも X が import されてるか確認
if (!playerStr.includes('X } from "lucide-react"')) {
  playerStr = playerStr.replace(
    /Check \} from "lucide-react";/,
    'Check, X, BarChart } from "lucide-react";'
  );
}
fs.writeFileSync('src/components/ContentPlayer.tsx', playerStr);
