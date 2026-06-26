import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf8');

const aggRegex = /const doAggregateScores = \(\) => \{[\s\S]*?finalScores\[attr\] = \(finalScores\[attr\] \|\| 0\) \+ Number\(val\);\n\s*\}\);\n\s*\}\n\s*\}\n\s*\};\n\n\s*return finalScores;\n\s*\};/;

const newAggLogic = `  const doAggregateScores = () => {
    const finalScores: Record<string, number> = {};
    
    // attributes 初期化
    content.scoringAttributes.forEach(attr => {
      finalScores[attr] = 0;
    });

    if (content.type === 'quiz') {
      finalScores['correct'] = 0;
    }

    playQuestions.forEach(q => {
      if (q.type === 'five_choices' || q.type === 'radio' || q.type === 'dropdown') {
        const choiceId = textAnswers[q.id];
        const selectedChoice = q.choices.find(c => c.id === choiceId);
        if (selectedChoice) {
          if (content.type === 'quiz' && selectedChoice.isCorrect) {
            finalScores['correct'] += 1;
          }
          if (selectedChoice.scores) {
            Object.entries(selectedChoice.scores).forEach(([attr, val]) => {
              finalScores[attr] = (finalScores[attr] || 0) + Number(val);
            });
          }
        }
      } else if (q.type === 'checkbox') {
        const qAns = checkboxAnswers[q.id] || {};
        let allCorrect = true;
        let anySelected = false;
        q.choices.forEach(choice => {
          if (qAns[choice.id]) {
            anySelected = true;
            if (choice.scores) {
              Object.entries(choice.scores).forEach(([attr, val]) => {
                finalScores[attr] = (finalScores[attr] || 0) + Number(val);
              });
            }
          }
          if (content.type === 'quiz') {
            if ((choice.isCorrect && !qAns[choice.id]) || (!choice.isCorrect && qAns[choice.id])) {
              allCorrect = false;
            }
          }
        });
        if (content.type === 'quiz' && anySelected && allCorrect) {
          finalScores['correct'] += 1;
        }
      } else if (q.type === 'pairing') {
        const pairingScore = pairingScores[q.id] || 0;
        if (content.type === 'quiz') {
           // ペアリングの場合はペア成立数を追加
           finalScores['correct'] += pairingScore;
        }
      } else if (q.type === 'text') {
        const textValue = textAnswers[q.id] || '';
        const matchingRule = q.textRules.find(r => !r.isFallback && r.keywords.some(kw => textValue.includes(kw)));
        if (matchingRule) {
           if (content.type === 'quiz' && matchingRule.isCorrect) finalScores['correct'] += 1;
           if (matchingRule.scores) {
              Object.entries(matchingRule.scores).forEach(([attr, val]) => {
                finalScores[attr] = (finalScores[attr] || 0) + Number(val);
              });
           }
        } else {
           const fallback = q.textRules.find(r => r.isFallback);
           if (fallback && fallback.scores) {
              Object.entries(fallback.scores).forEach(([attr, val]) => {
                finalScores[attr] = (finalScores[attr] || 0) + Number(val);
              });
           }
        }
      } else if (q.type === 'slider') {
         const val = sliderAnswers[q.id] || 3;
         if (q.sliderScores) {
            Object.entries(q.sliderScores).forEach(([attr, multiplier]) => {
              finalScores[attr] = (finalScores[attr] || 0) + (val * multiplier);
            });
         }
      }
    });

    return finalScores;
  };`;

// replace using index to be safe.
const startIdx = content.indexOf('const doAggregateScores = () => {');
const endIdx = content.indexOf('return finalScores;\n  };') + 'return finalScores;\n  };'.length;

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + newAggLogic + content.substring(endIdx);
  fs.writeFileSync('src/components/ContentPlayer.tsx', content);
}
