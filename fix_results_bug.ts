import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentCreator.tsx', 'utf8');

const regexResultOption = /const newResult: ShitsumonKobo_ResultOption = \{[\s\S]*?\};[\s\S]*?setContent\(prev => \(\{[\s\S]*?\.\.\.prev,[\s\S]*?resultOptions: \[\.\.\.prev\.resultOptions, newResult\][\s\S]*?\}\)\);/g;

const newResultOption = `const newResult: ShitsumonKobo_ResultOption = {
      id: "r_" + Math.random().toString(36).substring(2, 9),
      title: "診断結果の仮の名前",
      description: "結果の詳しい説明文をここに入力してください。",
      conditionAttribute: content.type === 'quiz' ? 'correct' : 'A',
      conditionScoreMin: 1,
      imageUrl: "✨"
    };
    setContent(prev => ({
      ...prev,
      results: [...prev.results, newResult]
    }));`;

content = content.replace(regexResultOption, newResultOption);

// ------------------------------------
// UIの条件入力部分の修正
// クイズの場合、conditionAttribute は "正解数" として扱うなど。
// ------------------------------------

fs.writeFileSync('src/components/ContentCreator.tsx', content);
