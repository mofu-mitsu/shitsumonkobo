const fs = require('fs');
let code = fs.readFileSync('src/components/ContentCreator.tsx', 'utf-8');

function replaceInputWithEditor(code, targetAttributeName) {
  const regex = new RegExp('<input[^>]*value=\\{stringifySimpleAttributes\\([^)]*' + targetAttributeName + '\\)\\}[\\s\\S]*?\\/>', 'g');
  return code.replace(regex, (match) => {
    let valuePath = '';
    if (match.includes('content.gimmicks')) {
      valuePath = 'content.gimmicks.' + targetAttributeName;
    } else {
      valuePath = 'q.' + targetAttributeName;
    }
    
    let onChangeLogic = '';
    if (match.includes('content.gimmicks')) {
       onChangeLogic = "(parsed) => setContent(prev => ({ ...prev, gimmicks: { ...prev.gimmicks, " + targetAttributeName + ": parsed } }))";
    } else {
       onChangeLogic = "(parsed) => { const updatedQs = content.questions.map(qu => qu.id === q.id ? { ...qu, " + targetAttributeName + ": parsed } : qu); setContent({ ...content, questions: updatedQs }); }";
    }

    return "<AttributeMultiplierEditor value={" + valuePath + "} onChange={" + onChangeLogic + "} availableAttributes={content.scoringAttributes} />";
  });
}

code = replaceInputWithEditor(code, 'tapBeatAttributeMultiplier');
code = replaceInputWithEditor(code, 'caterpillarAttributeMultiplier');
code = replaceInputWithEditor(code, 'secretLetterAttributeMultiplier');
code = replaceInputWithEditor(code, 'pairingAttributeScores');

fs.writeFileSync('src/components/ContentCreator.tsx', code);
console.log("Patched creator multipliers FORCE!");
