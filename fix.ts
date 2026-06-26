import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentCreator.tsx', 'utf8');

const startIndex = content.indexOf('// 診断結果パターンの追加');
const endIndex = content.indexOf('<div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl max-w-4xl mx-auto flex flex-col h-[750px]">');

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `// 診断結果パターンの追加
  const addResultOption = () => {
    const newResult: ShitsumonKobo_ResultOption = {
      id: "r_" + Math.random().toString(36).substring(2, 9),
      title: "診断結果の仮の名前",
      description: "結果の詳しい説明文をここに入力してください。",
      conditionFormula: "attribute == '条件'",
      imageUrlOrEmoji: "✨"
    };
    setContent(prev => ({
      ...prev,
      resultOptions: [...prev.resultOptions, newResult]
    }));
    playSound("synth");
  };

  // 保存処理
  const handleSave = async () => {
    if (!content.title.trim()) {
      alert("しつもんのタイトルを入力してください！");
      return;
    }

    if (content.type !== 'gacha') {
      if (content.questions.length === 0) {
        alert("質問を1つ以上追加してください！");
        return;
      }
    }

    setIsSaving(true);
    playSound("bell");
    try {
      await onSave(content);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    `;

  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync('src/components/ContentCreator.tsx', content);
  console.log("Fixed!");
} else {
  console.log("Not found indexes:", startIndex, endIndex);
}
