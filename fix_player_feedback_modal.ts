import * as fs from 'fs';

let playerStr = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf8');

if (!playerStr.includes('feedbackModal.show')) {
  playerStr = playerStr.replace(
    /\{showDashboard && \(/,
    `{/* =============== フィードバックモーダル =============== */}
        <AnimatePresence>
          {feedbackModal?.show && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={closeFeedbackAndNext}
            >
              <motion.div 
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-5 text-center relative border border-slate-100"
              >
                {feedbackModal.type === 'quiz' ? (
                  <>
                    <div className="flex justify-center mb-2">
                      <div className={\`w-16 h-16 rounded-2xl flex items-center justify-center \${feedbackModal.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'}\`}>
                        {feedbackModal.isCorrect ? <CheckCircle2 size={32} /> : <X size={32} />}
                      </div>
                    </div>
                    <h3 className={\`text-xl font-black tracking-tight \${feedbackModal.isCorrect ? 'text-emerald-600' : 'text-rose-500'}\`}>
                      {feedbackModal.isCorrect ? "正解！" : "残念…間違いです"}
                    </h3>
                    {feedbackModal.explanation && (
                      <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap leading-relaxed">
                        {feedbackModal.explanation}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex justify-center mb-2">
                      <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
                        <Check size={32} />
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-sky-600 tracking-tight">手紙の中身</h3>
                    {feedbackModal.explanation && (
                      <div className="text-sm text-slate-600 bg-sky-50/50 p-4 rounded-xl border border-sky-100 whitespace-pre-wrap leading-relaxed">
                        {feedbackModal.explanation}
                      </div>
                    )}
                  </>
                )}
                
                <button
                  onClick={closeFeedbackAndNext}
                  className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-sm transition-transform hover:scale-[1.02] active:scale-95"
                >
                  {currentIdx + 1 < playQuestions.length ? "次の問題へ" : "結果を見る"}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {showDashboard && (`
  );
}

// Ensure loadSurveyStats is triggered only once when isFinished is true
// Let's modify the useEffect for loadSurveyStats to avoid infinite loops and correctly use playStats

fs.writeFileSync('src/components/ContentPlayer.tsx', playerStr);
