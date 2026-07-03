const fs = require('fs');
let code = fs.readFileSync('src/components/ContentCreator.tsx', 'utf-8');

// tapBeat
code = code.replace(/<input[^>]*value=\{stringifySimpleAttributes\(content\.gimmicks\.tapBeatAttributeMultiplier\)\}[^>]*\/>/,
  `<AttributeMultiplierEditor 
      value={content.gimmicks.tapBeatAttributeMultiplier} 
      onChange={(parsed) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, tapBeatAttributeMultiplier: parsed } }))}
      availableAttributes={content.scoringAttributes}
   />`);

// caterpillar
code = code.replace(/<input[^>]*value=\{stringifySimpleAttributes\(content\.gimmicks\.caterpillarAttributeMultiplier\)\}[^>]*\/>/,
  `<AttributeMultiplierEditor 
      value={content.gimmicks.caterpillarAttributeMultiplier} 
      onChange={(parsed) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, caterpillarAttributeMultiplier: parsed } }))}
      availableAttributes={content.scoringAttributes}
   />`);

// secretLetter
code = code.replace(/<input[^>]*value=\{stringifySimpleAttributes\(content\.gimmicks\.secretLetterAttributeMultiplier\)\}[^>]*\/>/,
  `<AttributeMultiplierEditor 
      value={content.gimmicks.secretLetterAttributeMultiplier} 
      onChange={(parsed) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, secretLetterAttributeMultiplier: parsed } }))}
      availableAttributes={content.scoringAttributes}
   />`);

// pairingAttributeScores
code = code.replace(/<input[^>]*value=\{stringifySimpleAttributes\(q\.pairingAttributeScores\)\}[^>]*\/>/g,
  `<AttributeMultiplierEditor 
      value={q.pairingAttributeScores} 
      onChange={(parsed) => {
         const updatedQs = content.questions.map(qu => qu.id === q.id ? { ...qu, pairingAttributeScores: parsed } : qu);
         setContent({ ...content, questions: updatedQs });
      }}
      availableAttributes={content.scoringAttributes}
   />`);

fs.writeFileSync('src/components/ContentCreator.tsx', code);
console.log("Patched creator multipliers again!");
