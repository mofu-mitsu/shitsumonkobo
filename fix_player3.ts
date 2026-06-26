import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf8');

if (!content.includes('const [feedbackModal, setFeedbackModal] = useState')) {
  content = content.replace('const [isStarted, setIsStarted] = useState(false);',
    "const [isStarted, setIsStarted] = useState(false);\n  const [feedbackModal, setFeedbackModal] = useState<{ show: boolean, isCorrect?: boolean, explanation?: string, type: 'quiz' | 'survey', mockStats?: Record<string, number> } | null>(null);");
}

const customProceedLogic = `
  const proceedWithFeedbackCheck = () => {
    let showFb = false;
    let fbIsCorrect = false;
    let fbExplanation = currentQ.explanation || "";

    if (content.type === 'quiz' && content.quizImmediateFeedback) {
      if (currentQ.type === 'radio' || currentQ.type === 'five_choices' || currentQ.type === 'dropdown') {
        const cId = textAnswers[currentQ.id];
        const c = currentQ.choices.find(c => c.id === cId);
        if (c && c.isCorrect) fbIsCorrect = true;
      } else if (currentQ.type === 'checkbox') {
        const ansMap = checkboxAnswers[currentQ.id] || {};
        let allCorrect = true;
        let anySelected = false;
        currentQ.choices.forEach(c => {
          if (ansMap[c.id]) anySelected = true;
          if ((c.isCorrect && !ansMap[c.id]) || (!c.isCorrect && ansMap[c.id])) allCorrect = false;
        });
        if (anySelected && allCorrect) fbIsCorrect = true;
      } else if (currentQ.type === 'text') {
        const text = textAnswers[currentQ.id] || '';
        const rule = currentQ.textRules.find(r => !r.isFallback && r.keywords.some(kw => text.includes(kw)));
        if (rule && rule.isCorrect) fbIsCorrect = true;
      }
      
      setFeedbackModal({ show: true, type: 'quiz', isCorrect: fbIsCorrect, explanation: fbExplanation });
      playSound(fbIsCorrect ? "bell" : "bloop");
      return;
    } else if (content.type === 'survey' && currentQ.choices && currentQ.choices.length > 0 && currentQ.type !== 'slider' && currentQ.type !== 'text') {
      const mockStats: Record<string, number> = {};
      let total = 0;
      currentQ.choices.forEach(c => {
        const p = Math.floor(Math.random() * 80) + 10;
        mockStats[c.id] = p;
        total += p;
      });
      // 正規化
      let sum = 0;
      currentQ.choices.forEach((c, idx) => {
        if(idx === currentQ.choices.length - 1) {
          mockStats[c.id] = 100 - sum;
        } else {
          mockStats[c.id] = Math.round((mockStats[c.id] / total) * 100);
          sum += mockStats[c.id];
        }
      });
      setFeedbackModal({ show: true, type: 'survey', mockStats });
      playSound("synth");
      return;
    }
    
    // フィードバック表示不要な場合
    if (currentQ.type === 'text') commitTextAnswer();
    else if (currentQ.type === 'slider') commitSliderAnswer();
    else goToNext();
  };

  const closeFeedbackAndNext = () => {
    setFeedbackModal(null);
    if (currentQ.type === 'text') commitTextAnswer();
    else if (currentQ.type === 'slider') commitSliderAnswer();
    else goToNext();
  };
`;
if (!content.includes('proceedWithFeedbackCheck')) {
  // insert logic
  content = content.replace('// 記述判定用の一致計算', customProceedLogic + '\n  // 記述判定用の一致計算');
}

// 決定ボタンへの置き換え
content = content.replace(/onClick=\{\(\) => \{\n\s*if \(currentQ\.type === 'text'\) commitTextAnswer\(\);\n\s*else if \(currentQ\.type === 'slider'\) commitSliderAnswer\(\);\n\s*else goToNext\(\);\n\s*\}\}/, 'onClick={proceedWithFeedbackCheck}');


// モーダルUIの末尾追加
const endTagsRegex = /(<\/div>\n\s*<\/div>\n\s*\))/g;
const feedbackModalUI = `
      {/* フィードバックモーダル */}
      <AnimatePresence>
        {feedbackModal && feedbackModal.show && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl relative w-full max-w-sm flex flex-col p-6 text-center border-2 border-emerald-100"
            >
              {feedbackModal.type === 'quiz' ? (
                <>
                  <div className="text-6xl mb-3">
                    {feedbackModal.isCorrect ? "⭕" : "❌"}
                  </div>
                  <h3 className={\`text-2xl font-black \${feedbackModal.isCorrect ? 'text-emerald-500' : 'text-rose-500'}\`}>
                    {feedbackModal.isCorrect ? "正解！" : "残念！"}
                  </h3>
                  {feedbackModal.explanation && (
                    <p className="mt-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl text-left leading-relaxed">
                      {feedbackModal.explanation}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-lg font-black text-slate-800 mb-4">みんなの回答状況（参考）</h3>
                  <div className="space-y-2 mb-4 text-left">
                    {currentQ.choices?.map(c => {
                       const p = feedbackModal.mockStats?.[c.id] || 0;
                       return (
                         <div key={c.id} className="text-xs">
                           <div className="flex justify-between mb-1 font-bold text-slate-700">
                             <span>{c.text}</span>
                             <span>{p}%</span>
                           </div>
                           <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                             <div className="bg-sky-400 h-2 rounded-full" style={{ width: \`\${p}%\` }}></div>
                           </div>
                         </div>
                       );
                    })}
                  </div>
                </>
              )}
              
              <button
                onClick={closeFeedbackAndNext}
                className="mt-6 w-full text-sm bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all"
              >
                次の問題へ
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
$1`;

content = content.replace(endTagsRegex, feedbackModalUI);


fs.writeFileSync('src/components/ContentPlayer.tsx', content);
