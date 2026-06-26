import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf8');

// ドロップダウン対応
const radioBlockStart = "{/* 2. 通常ラジオボタン (単一選択) */}";
const dropdownBlock = `
              {/* ドロップダウン (プルダウン選択) */}
              {currentQ.type === 'dropdown' && (
                <div className="pt-2">
                  <select
                    value={textAnswers[currentQ.id] || ''}
                    onChange={(e) => {
                      setTextAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }));
                      playSound("bloop");
                    }}
                    className="w-full py-4 px-4 rounded-xl border border-sky-100 bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer appearance-none shadow-sm"
                  >
                    <option value="" disabled>項目を選択してください</option>
                    {currentQ.choices.map((choice) => (
                      <option key={choice.id} value={choice.id}>{choice.text}</option>
                    ))}
                  </select>
                </div>
              )}
`;

content = content.replace(radioBlockStart, dropdownBlock + "\n              " + radioBlockStart);

// currentQ の画像があれば表示
const questionTitleRegex = /(<h2 className="text-xl font-bold text-slate-800 leading-relaxed break-all">)(\s*\{currentQ\.text\}\s*)(<\/h2>)/;
const imageBlock = `$1
                    {currentQ.imageUrlOrEmoji && (
                      <div className="mb-4">
                        {currentQ.imageUrlOrEmoji.startsWith("data:") || currentQ.imageUrlOrEmoji.startsWith("http") ? (
                          <img src={currentQ.imageUrlOrEmoji} alt="" className="w-full max-h-[300px] object-contain rounded-2xl bg-slate-50 border border-slate-100" />
                        ) : (
                          <div className="text-center text-7xl py-4">{currentQ.imageUrlOrEmoji}</div>
                        )}
                      </div>
                    )}
                    $2$3`;
content = content.replace(questionTitleRegex, imageBlock);

fs.writeFileSync('src/components/ContentPlayer.tsx', content);
