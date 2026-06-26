import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentCreator.tsx', 'utf8');

const isCorrectUI = `
                              {content.type === 'quiz' && (
                                <label className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                  <input 
                                    type="checkbox" 
                                    checked={choice.isCorrect || false}
                                    onChange={e => updateChoice(q.id, choice.id, choice.text, choice.scores, e.target.checked)}
                                    className="cursor-pointer"
                                  />
                                  正解設定
                                </label>
                              )}
`;

content = content.replace(
  '{/* 選択肢テキスト */}',
  isCorrectUI + '\n                              {/* 選択肢テキスト */}'
);

const parameterRemoveUIregex = /\{\/\* 各属性のスコア設定（スライダー） \*\/\}/g;

const parameterRemoveUIreplacement = `
                                {content.type !== 'quiz' && content.type !== 'survey' && (
                                  <div className="text-[10px] text-slate-400 font-bold col-span-full border-t border-slate-100 pt-2 flex items-center justify-between">
                                    <span>⚙️ 選択時の加点パラメータ設定 (スライダーで調整)</span>
                                  </div>
                                )}
                                {/* 各属性のスコア設定（スライダー） */}
                                {content.type !== 'quiz' && content.type !== 'survey' && content.scoringAttributes.map(attr => {
`;

// we need to wrap the whole map operation.
// So let's write a targeted replace logic.

fs.writeFileSync('src/components/ContentCreator.tsx', content);
