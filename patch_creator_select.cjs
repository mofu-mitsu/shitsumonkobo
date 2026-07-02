const fs = require('fs');
let code = fs.readFileSync('src/components/ContentCreator.tsx', 'utf-8');

// For "ジャンプ先:"
const oldSelect = `<select
                                value={choice.nextQuestionId || ""}
                                onChange={(e) => updateChoice(q.id, choice.id, choice.text, choice.scores, choice.isCorrect, choice.feedback, e.target.value)}
                                className="flex-1 bg-white border border-slate-200 text-xs px-2 py-1.5 rounded-lg text-slate-700 focus:outline-none focus:border-sky-300"
                              >`;
const newSelect = `<select
                                value={choice.nextQuestionId || ""}
                                onChange={(e) => updateChoice(q.id, choice.id, choice.text, choice.scores, choice.isCorrect, choice.feedback, e.target.value)}
                                className="flex-1 w-0 min-w-0 bg-white border border-slate-200 text-xs px-2 py-1.5 rounded-lg text-slate-700 focus:outline-none focus:border-sky-300 truncate"
                              >`;

code = code.replace(oldSelect, newSelect);

fs.writeFileSync('src/components/ContentCreator.tsx', code);
console.log("Patched select box!");
