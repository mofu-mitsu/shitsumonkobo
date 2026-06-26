import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentCreator.tsx', 'utf8');

const previewModalUI = `

      {/* プレビューモーダル */}
      <AnimatePresence>
        {isPreviewMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl relative w-full mt-10 md:mt-0 md:max-w-md h-[80vh] flex flex-col border border-sky-100"
            >
              <div className="bg-slate-800 text-white p-3 flex justify-between items-center z-10 sticky top-0">
                <div className="text-xs font-bold flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                   プレビューモード
                </div>
                <button 
                  onClick={() => { setIsPreviewMode(false); playSound("bloop"); }}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-auto bg-slate-50 relative pointer-events-auto">
                <ContentPlayer content={content} onClose={() => setIsPreviewMode(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
`;

if (!content.includes('プレビューモード')) {
  content = content.replace(
    'しつもん工房 — 自由な回答からつながる無限の選択肢 🚀\n        </span>\n      </div>',
    'しつもん工房 — 自由な回答からつながる無限の選択肢 🚀\n        </span>\n      </div>' + previewModalUI
  );
  fs.writeFileSync('src/components/ContentCreator.tsx', content);
}
