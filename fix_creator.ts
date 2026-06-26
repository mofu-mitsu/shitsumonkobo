import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentCreator.tsx', 'utf8');

// インポート追加
if (!content.includes('import ContentPlayer from "./ContentPlayer";')) {
  content = content.replace('import { playSound } from "./SoundEngine";',
    'import { playSound } from "./SoundEngine";\nimport ContentPlayer from "./ContentPlayer";');
}
if (!content.includes('Upload,')) {
   content = content.replace('Trash2, ListTodo', 'Trash2, ListTodo, Upload, Play, X, Download');
}

// previewMode State
if (!content.includes('const [isPreviewMode, setIsPreviewMode] = useState(false);')) {
  content = content.replace('const [isSaving, setIsSaving] = useState(false);',
    'const [isSaving, setIsSaving] = useState(false);\n  const [isPreviewMode, setIsPreviewMode] = useState(false);');
}

// プレビューボタンの追加（保存ボタンの横）
const saveButtonRegex = /(<button \n\s*disabled=\{isSaving\}\n\s*onClick=\{handleSave\})/g;
const previewButtonStr = `
          <button 
            type="button"
            onClick={() => { setIsPreviewMode(true); playSound("synth"); }}
            className="text-xs bg-sky-100 hover:bg-sky-200 text-sky-700 font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer mr-2"
          >
            <Play size={14} /> プレビュー
          </button>
          $1`;
content = content.replace(saveButtonRegex, previewButtonStr);

// プレビューモーダルレンダリングを return ( ... の一番外側に追加するため、最下層の直前に挿入。
// 末尾付近の </div> </div> のどれかに挿入。
const endTagsRegex = /(<\/div>\s*)$/;
const previewModalStr = `
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
                   プレビューモード (保存前の動作確認)
                </div>
                <button 
                  onClick={() => { setIsPreviewMode(false); playSound("bloop"); }}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-auto bg-slate-50 relative">
                <ContentPlayer content={content} onClose={() => setIsPreviewMode(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
$1`;
content = content.replace(endTagsRegex, previewModalStr);

// 「通常」の質問タイプのドロップダウン追加
const qTypeAddStr = `
                <button 
                  onClick={() => addQuestion("checkbox")}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  ＋ 複数チェック
                </button>
                <button 
                  onClick={() => addQuestion("dropdown")}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  ＋ プルダウン
                </button>`;
content = content.replace(/<button \n\s*onClick=\{([^}]*)\("checkbox"\)\}([\s\S]*?)<\/button>/, qTypeAddStr);

// 「通常」の質問一覧表示のタイトルにプルダウン追加
content = content.replace(/q.type === 'slider' \? '数値スライダー' :/g, "q.type === 'slider' ? '数値スライダー' :\n                         q.type === 'dropdown' ? 'プルダウン' :");


fs.writeFileSync('src/components/ContentCreator.tsx', content);
