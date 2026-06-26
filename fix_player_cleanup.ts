import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf8');

// 過去に挿入した <AnimatePresence> のフィードバックモーダル部分を全て消す。
const regex = /\{\/\* フィードバックモーダル \*\/\}[\s\S]*?<\/AnimatePresence>[\s\n]*?(<\/div>\n\s*<\/div>\n\s*\))/g;
let newContent = content.replace(regex, "$1");

// 改めて、一番最後に追加する
// return (...) の末尾。
const lastRegex = /(<\/div>\n\s*)$/;

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
`;

newContent = newContent.replace(lastRegex, feedbackModalUI + "\n$1");

fs.writeFileSync('src/components/ContentPlayer.tsx', newContent);
