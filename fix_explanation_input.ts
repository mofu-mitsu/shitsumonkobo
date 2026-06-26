import * as fs from 'fs';

let ccStr = fs.readFileSync('src/components/ContentCreator.tsx', 'utf8');

if (!ccStr.includes('content.type === \'quiz\' && (')) {
  // Let's find the skipEnabled div block end:
  ccStr = ccStr.replace(
    /<\/label>\s*<\/div>\s*\)\}/,
    `</label>
                      </div>
                    )}
                    {content.type === 'quiz' && (
                      <div className="mt-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                        <label className="block text-[10px] font-bold text-indigo-700 mb-1">
                          ✨ クイズの正誤判定時の解説文（任意）
                        </label>
                        <textarea
                          placeholder="例: あなたが選んだのは間違いです。正解は○○でした！なぜなら..."
                          value={q.explanation || ''}
                          onChange={(e) => updateQuestion(q.id, { explanation: e.target.value })}
                          className="w-full bg-white border border-indigo-200 rounded-lg p-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-400 min-h-[60px]"
                        />
                      </div>
                    )}`
  );
}

fs.writeFileSync('src/components/ContentCreator.tsx', ccStr);
