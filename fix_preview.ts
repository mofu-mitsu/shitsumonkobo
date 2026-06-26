import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentCreator.tsx', 'utf8');

if (!content.includes('import { AnimatePresence, motion } from "motion/react";')) {
  content = content.replace('import { playSound } from "./SoundEngine";', 
    'import { playSound } from "./SoundEngine";\nimport { AnimatePresence, motion } from "motion/react";');
}

const previewModalUI = `

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
              className="bg-white rounded-3xl overflow-hidden shadow-2xl relative w-full max-w-md h-[80vh] flex flex-col border border-sky-100"
            >
              <div className="bg-slate-800 text-white p-3 flex justify-between items-center z-10 sticky top-0">
                <div className="text-xs font-bold flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                   プレビューモード (動作確認)
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

if (!content.includes('プレビューモード (動作確認)')) {
  // 注入。最後の </div> の直前。
  content = content.replace(/(<\/div>\n\s*<\/div>\n\s*\);\n\s*\})/, "</div>\n" + previewModalUI + "$1");
}

fs.writeFileSync('src/components/ContentCreator.tsx', content);

// Also correct the preview button handler:
// playSound("synth") and setIsPreviewMode(true) -> already setup, just need previewModalUI
