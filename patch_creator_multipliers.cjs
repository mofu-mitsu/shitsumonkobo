const fs = require('fs');
let code = fs.readFileSync('src/components/ContentCreator.tsx', 'utf-8');

// I need to add a small component AttributeMultiplierEditor.
// Where should I put it? Near the top of the file.
const editorComponent = `
// 属性加点用の汎用エディタ
const AttributeMultiplierEditor = ({ value, onChange, availableAttributes }: { value: Record<string, number> | undefined, onChange: (val: Record<string, number> | undefined) => void, availableAttributes: string[] }) => {
  const attrs = ['Score', ...availableAttributes];
  const currentVal = value || {};
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
      {attrs.map(attr => (
        <div key={attr} className="bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200 flex flex-col justify-center">
          <div className="flex justify-between text-[10px] text-slate-600">
            <span className="font-bold truncate" title={attr}>{attr}</span>
            <span className="font-mono text-emerald-600 font-bold">
               {currentVal[attr] > 0 ? "+" + currentVal[attr] : currentVal[attr] || 0}
            </span>
          </div>
          <input
            type="number"
            value={currentVal[attr] ?? ""}
            onChange={(e) => {
              const nextVal = { ...currentVal };
              const v = Number(e.target.value);
              if (!e.target.value || isNaN(v)) {
                delete nextVal[attr];
              } else {
                nextVal[attr] = v;
              }
              onChange(Object.keys(nextVal).length > 0 ? nextVal : undefined);
            }}
            className="w-full mt-1 bg-white border border-slate-200 rounded px-1 py-0.5 text-xs text-center focus:outline-none focus:border-emerald-300"
            placeholder="0"
          />
        </div>
      ))}
    </div>
  );
};
`;

code = code.replace(/export default function ContentCreator/, editorComponent + '\\nexport default function ContentCreator');

// Now replace tapBeat
code = code.replace(/<input\\s*type="text"\\s*placeholder='例: Se 1 Score 5'\\s*value=\{stringifySimpleAttributes\\(content\\.gimmicks\\.tapBeatAttributeMultiplier\\)\}[\\s\\S]*?className="[^"]*"\\s*\/>/, 
  `<AttributeMultiplierEditor 
      value={content.gimmicks.tapBeatAttributeMultiplier} 
      onChange={(parsed) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, tapBeatAttributeMultiplier: parsed } }))}
      availableAttributes={content.scoringAttributes}
   />`);

// caterpillar
code = code.replace(/<input\\s*type="text"\\s*placeholder="例: Score 10 Ni 5"\\s*value=\{stringifySimpleAttributes\\(content\\.gimmicks\\.caterpillarAttributeMultiplier\\)\}[\\s\\S]*?className="[^"]*"\\s*\/>/,
  `<AttributeMultiplierEditor 
      value={content.gimmicks.caterpillarAttributeMultiplier} 
      onChange={(parsed) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, caterpillarAttributeMultiplier: parsed } }))}
      availableAttributes={content.scoringAttributes}
   />`);

// secretLetter
code = code.replace(/<input\\s*type="text"\\s*placeholder='例: Score 10 Ni 2'\\s*value=\{stringifySimpleAttributes\\(content\\.gimmicks\\.secretLetterAttributeMultiplier\\)\}[\\s\\S]*?className="[^"]*"\\s*\/>/,
  `<AttributeMultiplierEditor 
      value={content.gimmicks.secretLetterAttributeMultiplier} 
      onChange={(parsed) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, secretLetterAttributeMultiplier: parsed } }))}
      availableAttributes={content.scoringAttributes}
   />`);

// pairingAttributeScores
code = code.replace(/<input\\s*type="text"\\s*value=\{stringifySimpleAttributes\\(q\\.pairingAttributeScores\\)\}[\\s\\S]*?placeholder="例: Score 10 Ni 5"\\s*\/>/,
  `<AttributeMultiplierEditor 
      value={q.pairingAttributeScores} 
      onChange={(parsed) => {
         const updatedQs = content.questions.map(qu => qu.id === q.id ? { ...qu, pairingAttributeScores: parsed } : qu);
         setContent({ ...content, questions: updatedQs });
      }}
      availableAttributes={content.scoringAttributes}
   />`);

fs.writeFileSync('src/components/ContentCreator.tsx', code);
console.log("Patched creator multipliers!");
