import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf8');

// インポート追加
if (!content.includes('import confetti from "canvas-confetti";')) {
  content = content.replace('import { Sparkles, ArrowRight, RotateCcw, Share2, Milestone, HelpCircle, CheckCircle2, Ticket, Check } from "lucide-react";',
    'import { Sparkles, ArrowRight, RotateCcw, Share2, Milestone, HelpCircle, CheckCircle2, Ticket, Check } from "lucide-react";\nimport confetti from "canvas-confetti";');
}

// evalAnswers関数内で、クイズであれば isCorrect を元に scores["correct"] を加算する処理を仕込む。
// 記述やラジオなどの選択系全て。
const evalAnswersLogic = `
  const evalAnswers = () => {
    let newScores: Record<string, number> = { ...pairingScores, beatTaps: beatTapsScore };
    if (content.type === 'quiz') newScores['correct'] = 0;

    content.questions.forEach(q => {
      if (q.type === 'text') {
        const textObj = evalTextResult(textAnswers[q.id] || "");
        Object.entries(textObj).forEach(([k, v]) => {
          newScores[k] = (newScores[k] || 0) + v;
        });
        if (content.type === 'quiz') {
           const rule = q.textRules.find(r => !r.isFallback && r.keywords.some(kw => (textAnswers[q.id]||"").includes(kw)));
           if (rule && rule.isCorrect) newScores['correct'] = (newScores['correct'] || 0) + 1;
        }
      } else if (q.type === 'radio' || q.type === 'five_choices' || q.type === 'dropdown') {
        const cId = textAnswers[q.id];
        const c = q.choices.find(c => c.id === cId);
        if (c) {
          Object.entries(c.scores).forEach(([k, v]) => {
            newScores[k] = (newScores[k] || 0) + v;
          });
          if (content.type === 'quiz' && c.isCorrect) newScores['correct'] = (newScores['correct'] || 0) + 1;
        }
      } else if (q.type === 'checkbox') {
        const ansMap = checkboxAnswers[q.id] || {};
        let allCorrect = true;
        let anySelected = false;
        q.choices.forEach(c => {
          if (ansMap[c.id]) {
             anySelected = true;
             Object.entries(c.scores).forEach(([k, v]) => {
                newScores[k] = (newScores[k] || 0) + v;
             });
          }
          if (content.type === 'quiz') {
             // 完全に一致しているか(正解すべきを選択し、不正解を選択していないか)
             if ((c.isCorrect && !ansMap[c.id]) || (!c.isCorrect && ansMap[c.id])) {
                allCorrect = false;
             }
          }
        });
        if (content.type === 'quiz' && anySelected && allCorrect) {
          newScores['correct'] = (newScores['correct'] || 0) + 1;
        }
      } else if (q.type === 'slider') {
        const val = sliderAnswers[q.id] ?? q.sliderMin;
        const ratio = (val - q.sliderMin) / (q.sliderMax - q.sliderMin || 1);
        Object.entries(q.sliderScores).forEach(([k, v]) => {
          newScores[k] = (newScores[k] || 0) + (v * ratio);
        });
      }
    });

    // Tap Beat ゲームでの属性ポイント加算
    if (content.gimmicks?.enableTapBeat && content.gimmicks?.tapBeatAttributeMultiplier && beatTapsScore > 0) {
      Object.entries(content.gimmicks.tapBeatAttributeMultiplier).forEach(([k, val]) => {
         newScores[k] = (newScores[k] || 0) + (val * beatTapsScore);
      });
    }

    setScores(newScores);
`;

content = content.replace(/const evalAnswers = \(\) => \{[\s\S]*?setScores\(newScores\);/, evalAnswersLogic);

// 次へ進む、または回答した瞬間のリアクションエフェクト
const effectFunction = `
  const triggerReaction = () => {
    if (content.gimmicks?.enableReactionEffect) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#38bdf8', '#34d399', '#f472b6', '#fbbf24']
      });
      playSound("synth");
    }
  };
`;
if (!content.includes('triggerReaction')) {
   content = content.replace('const handleRadioSelect =', effectFunction + '\n  const handleRadioSelect =');
}
content = content.replace(/setTextAnswers\(prev => \(\{ \.\.\.prev, \[currentQ\.id\]: choiceId \}\)\);[\s]+playSound\("synth"\);/g, 
  "setTextAnswers(prev => ({ ...prev, [currentQ.id]: choiceId }));\n    triggerReaction();");
content = content.replace(/setCheckboxAnswers\(prev => \{/g, 
  "triggerReaction();\n    setCheckboxAnswers(prev => {");

// 背景イベントシステム (Weather)
const weatherCss = `
<style>
.weather-rain { position: absolute; top: -10px; width: 2px; height: 10px; background: rgba(255,255,255,0.6); animation: fall 0.5s linear infinite; }
.weather-snow { position: absolute; top: -10px; width: 5px; height: 5px; background: white; border-radius: 50%; opacity: 0.8; animation: fall 3s linear infinite; }
.weather-petals { position: absolute; top: -10px; width: 10px; height: 10px; background: pink; border-radius: 50% 0 50% 50%; animation: flutter 4s linear infinite; }
@keyframes fall { to { transform: translateY(100vh); } }
@keyframes flutter { 0% { transform: translateY(0) rotate(0deg) translateX(0); } 50% { transform: translateY(50vh) rotate(180deg) translateX(20px); } 100% { transform: translateY(100vh) rotate(360deg) translateX(0); } }
</style>
`;
const weatherElement = `
      {/* Weather Effects */ }
      {content.gimmicks?.weatherEffect && content.gimmicks.weatherEffect !== 'none' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
           {Array.from({length: 30}).map((_, i) => (
             <div 
               key={i} 
               className={\`weather-\${content.gimmicks.weatherEffect}\`} 
               style={{ 
                 left: \`\${Math.random() * 100}%\`, 
                 animationDelay: \`\${Math.random() * 3}s\`,
                 animationDuration: content.gimmicks.weatherEffect === 'rain' ? \`\${Math.random() * 0.2 + 0.5}s\` : \`\${Math.random() * 2 + 3}s\`
               }}
             />
           ))}
        </div>
      )}
`;

content = content.replace(/(<div className="min-h-full transition-colors duration-1000 flex flex-col p-4)/, 
  weatherCss + "\n      " + weatherElement + "\n      $1");

content = content.replace('className={`p-6 max-w-2xl mx-auto md:mt-10 mb-20 md:mb-10 w-full animate-fade-in relative',
  'className={`p-6 max-w-2xl mx-auto md:mt-10 mb-20 md:mb-10 w-full animate-fade-in relative z-10');

// const isQuiz = content.type === 'quiz'; などでクイズに関する部分を改修
// クイズの結果計算で conditionAttribute === '正解数' や conditionScoreMin/Max で拾えるようにする。
content = content.replace(/let matched = content\.results\.find\(r => \{\n\s*const v = newScores\[r\.conditionAttribute\] \|\| 0;\n\s*return v >= r\.conditionScoreMin;\n\s*\}\);/,
`let matched = content.results.find(r => {
        const v = content.type === 'quiz' ? (newScores['correct'] || 0) : (newScores[r.conditionAttribute] || 0); // クイズならcorrect優先、というか正解数で判定する
        return v >= r.conditionScoreMin && (r.conditionScoreMax === undefined || v <= r.conditionScoreMax);
      });`);


fs.writeFileSync('src/components/ContentPlayer.tsx', content);
