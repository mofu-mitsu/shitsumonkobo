import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentCreator.tsx', 'utf8');

const tabRegex = /\{\(content\.type === 'diagnostic' \|\| content\.type === 'quiz'\) && \(/;
const replaceTab = `{(content.type === 'diagnostic' || content.type === 'quiz' || content.type === 'survey') && (`;
content = content.replace(tabRegex, replaceTab);

const labelRegex = /<Sliders size=\{13\} style=\{\{ color: activeColor \}\} \/> 3\. 結果バリエーション/;
const replaceLabel = `<Sliders size={13} style={{ color: activeColor }} /> 3. {content.type === 'survey' ? '終了画面' : '結果バリエーション'}`;
content = content.replace(labelRegex, replaceLabel);

const descRegex = /心理テストやクイズの得点・パラメータに応じた「結果カード」を構成します。/;
const replaceDesc = `{content.type === 'survey' ? 'アンケート回答完了後に表示するサンクスページ（終了画面）を作成します。' : '心理テストやクイズの得点・パラメータに応じた「結果カード」を構成します。'}`;
content = content.replace(descRegex, replaceDesc);

fs.writeFileSync('src/components/ContentCreator.tsx', content);
