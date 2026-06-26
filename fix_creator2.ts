import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentCreator.tsx', 'utf8');


const questionBlockRegex = /(<input\n\s*type="text"\n\s*value=\{q\.text\})/g;

// 画像アップロード機能（Question用）
const fileUploadLogic = `
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result && typeof ev.target.result === 'string') {
        callback(ev.target.result);
      }
    };
    reader.readAsDataURL(file);
  };
`;

if (!content.includes('handleImageUpload')) {
  content = content.replace('const updateQuestion =', fileUploadLogic + '\n  const updateQuestion =');
}


// Questionレンダリング内に画像アップロードボタン等を追加する
// <div className="flex gap-2 items-center"> ... </div> (Qテキスト入力欄) の下に差し込む
const newQInputBlock = `
                    <div className="flex flex-col gap-2">
                       <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                          <input
                            type="text"
                            value={q.imageUrlOrEmoji || ""}
                            onChange={(e) => updateQuestion(q.id, { imageUrlOrEmoji: e.target.value })}
                            className="bg-transparent text-xs text-slate-700 font-bold flex-1 px-2 focus:outline-none placeholder-slate-400"
                            placeholder="絵文字(🎈) または URL"
                          />
                          <label className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 py-1 rounded-lg cursor-pointer transition-colors font-bold whitespace-nowrap">
                            画像アップロード
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, (base64) => updateQuestion(q.id, { imageUrlOrEmoji: base64 }))}
                            />
                          </label>
                       </div>
                       {q.imageUrlOrEmoji && q.imageUrlOrEmoji.startsWith("data:") && (
                         <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative">
                           <img src={q.imageUrlOrEmoji} className="w-full h-full object-cover" alt="" />
                           <button onClick={() => updateQuestion(q.id, {imageUrlOrEmoji: ''})} className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 flex items-center justify-center text-[8px]">&times;</button>
                         </div>
                       )}
                    </div>
`;

content = content.replace(/(placeholder="質問の質問文を入力してね"\n\s*\/>\n\s*<\/div>)/g, "$1\n" + newQInputBlock);


// クイズモードの場合の isCorrect トグル処理を追加
const choiceLoopRegex = /onChange=\{\(e\) => updateChoice\(q\.id, c\.id, e\.target\.value, c\.scores\)\}/g;
const correctToggleBlock = `
                              onChange={(e) => updateChoice(q.id, c.id, e.target.value, c.scores)}
                            />
                            {content.type === 'quiz' && (
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!c.isCorrect}
                                  onChange={(e) => updateChoice(q.id, c.id, c.text, c.scores, e.target.checked)}
                                  className="w-3.5 h-3.5 text-emerald-500 rounded border-slate-300 focus:ring-emerald-500"
                                />
                                <span className="text-[10px] text-emerald-600 font-bold whitespace-nowrap">正解</span>
                              </label>
                            )}
`;

// updateChoiceのシグネチャを書き換え
content = content.replace(/const updateChoice = \(qId: string, choiceId: string, text: string, scores: Record<string, number>\) => \{/g, 
"const updateChoice = (qId: string, choiceId: string, text: string, scores: Record<string, number>, isCorrect?: boolean) => {");

content = content.replace(/choices: q\.choices\.map\(c => c\.id === choiceId \? \{ \.\.\.c, text, scores \} : c\)/g, 
"choices: q.choices.map(c => c.id === choiceId ? { ...c, text, scores, isCorrect: isCorrect !== undefined ? isCorrect : c.isCorrect } : c)");

content = content.replace(/(<input[\s\S]*?className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 focus:border-sky-300 focus:outline-none"[\s\S]*?)onChange=\{\(e\) => updateChoice\(q\.id, c\.id, e\.target\.value, c\.scores\)\}([\s\S]*?\/>)/g, 
"$1onChange={(e) => updateChoice(q.id, c.id, e.target.value, c.scores)}$2" + `
                            {content.type === 'quiz' && (
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!c.isCorrect}
                                  onChange={(e) => updateChoice(q.id, c.id, c.text, c.scores, e.target.checked)}
                                  className="w-4 h-4 text-emerald-500 rounded border-slate-300 focus:ring-emerald-500"
                                />
                                <span className="text-xs text-emerald-600 font-bold whitespace-nowrap">正解に設定</span>
                              </label>
                            )}
`);


// Gacha景品への画像アップロード追加
const gachaImageRegex = /(value=\{item\.imageUrlOrEmoji\}\n\s*onChange=\{\(e\) => updateGachaItem\(\{ imageUrlOrEmoji: e\.target\.value \}, idx\)\}\n\s*className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 flex-1 focus:border-sky-300 focus:outline-none"\n\s*placeholder="🎁 or URL"\n\s*\/>\n\s*<\/div>)/g;
const gachaImageUpload = `
$1
                            <label className="text-[10px] mt-1 bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 py-1 rounded-lg cursor-pointer transition-colors font-bold whitespace-nowrap inline-block">
                              画像アップロード
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, (base64) => updateGachaItem({imageUrlOrEmoji: base64}, idx))}
                              />
                            </label>
`;
content = content.replace(gachaImageRegex, gachaImageUpload);

// ギミックタブへの追加
const gimmickTabContent = `
            {/* リアクションエフェクト */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={content.gimmicks.enableReactionEffect || false}
                  onChange={(e) => setContent(prev => ({...prev, gimmicks: {...prev.gimmicks, enableReactionEffect: e.target.checked}}))}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div>
                  <div className="text-sm font-bold text-slate-800">🎉 選択時のリアクション演出</div>
                  <div className="text-xs text-slate-500 mt-0.5">選択肢を選んだ瞬間に紙吹雪などのエフェクトが出ます</div>
                </div>
              </label>
            </div>

            {/* 背景エフェクト */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
              <div className="mb-3">
                <div className="text-sm font-bold text-slate-800">🌦 背景イベント演出</div>
                <div className="text-xs text-slate-500 mt-0.5">質問中に常に流れる背景エフェクトを設定できます</div>
              </div>
              <select
                value={content.gimmicks.weatherEffect || 'none'}
                onChange={(e) => setContent(prev => ({...prev, gimmicks: {...prev.gimmicks, weatherEffect: e.target.value as any}}))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="none">なし</option>
                <option value="rain">雨 (Rain)</option>
                <option value="snow">雪 (Snow)</option>
                <option value="petals">花びら (Petals)</option>
                <option value="leaves">紅葉 (Leaves)</option>
                <option value="stars">星 (Stars)</option>
              </select>
            </div>
`;
content = content.replace(/(<h3 className="text-sm font-black text-slate-800">🐛 芋虫マスコット<\/h3>)/, gimmickTabContent + "\n\n$1");

fs.writeFileSync('src/components/ContentCreator.tsx', content);
