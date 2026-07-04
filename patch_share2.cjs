const fs = require('fs');
let code = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf-8');

const newShare = `
  const handleSaveImage = async () => {
    if (!resultCardRef.current) return;
    try {
      const canvas = await html2canvas(resultCardRef.current, { backgroundColor: null, scale: 2 });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = \`\${content.title}_result.png\`;
      a.click();
    } catch (e) {
      console.error("Failed to save image", e);
    }
  };

  const handleXShare = () => {
    let shareText = "";
    const shortTitle = content.title.length > 20 ? content.title.substring(0, 20) + "…" : content.title;
    if (content.type === 'survey') {
      shareText = \`アンケート「\${shortTitle}」に回答しました！\`;
    } else if (content.type === 'quiz') {
      if (!finalResult) return;
      const totalQ = playQuestions.filter(isQuestionVisible).length;
      const correctQ = scores['correct'] || 0;
      const accuracy = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0;
      shareText = \`クイズ「\${shortTitle}」で【\${accuracy}%】正解しました！\\n結果: \${finalResult.title.substring(0, 20)}\`;
    } else if (content.type === 'gacha') {
      shareText = \`ガチャ「\${shortTitle}」を回しました！\`;
    } else {
      if (!finalResult) return;
      shareText = \`診断「\${shortTitle}」\\n結果は【\${finalResult.title.substring(0, 20)}】でした！\\n\\n\${finalResult.description.substring(0, 40)}…\`;
    }
    const appUrl = \`https://shitsumonkobo.vercel.app/?id=\${content.id}\`;
    const shareUrl = \`https://twitter.com/intent/tweet?text=\${encodeURIComponent(shareText)}&url=\${encodeURIComponent(appUrl)}&hashtags=しつもん工房\`;
    window.open(shareUrl, "_blank");
  };`;

code = code.replace(/const handleXShare = \(\) => \{[\s\S]*?window\.open\(shareUrl, "_blank"\);\n  \};/, newShare);

if (!code.includes("import html2canvas")) {
  code = code.replace(/import \{ Search/, "import html2canvas from 'html2canvas';\nimport { Search");
}
if (!code.includes("resultCardRef = useRef")) {
  code = code.replace(/const currentStepIndex = /, "const resultCardRef = useRef<HTMLDivElement>(null);\n  const currentStepIndex = ");
}

fs.writeFileSync('src/components/ContentPlayer.tsx', code);
console.log("Patched share X correctly");
