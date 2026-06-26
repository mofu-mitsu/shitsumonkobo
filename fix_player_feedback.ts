import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf8');

// Update proceedWithFeedbackCheck
const regexFB = /\} else if \(currentQ\.type === 'checkbox'\) \{[\s\S]*?\}\n\s*\}/;

const replaceFB = `} else if (currentQ.type === 'checkbox') {
        const ansMap = checkboxAnswers[currentQ.id] || {};
        let allCorrect = true;
        let anySelected = false;
        currentQ.choices.forEach(c => {
          if (ansMap[c.id]) anySelected = true;
          if (c.isCorrect && !ansMap[c.id]) allCorrect = false;
          if (!c.isCorrect && ansMap[c.id]) allCorrect = false;
        });
        if (anySelected && allCorrect) fbIsCorrect = true;
      } else if (currentQ.type === 'pairing') {
        fbIsCorrect = (pairingScores[currentQ.id] === 100);
      } else if (currentQ.type === 'text') {
        const val = textAnswers[currentQ.id] || "";
        const rule = currentQ.textRules?.find(r => !r.isFallback && r.keywords.some(kw => val.includes(kw)));
        if (rule && rule.isCorrect) fbIsCorrect = true;
      }`;

content = content.replace(regexFB, replaceFB);
fs.writeFileSync('src/components/ContentPlayer.tsx', content);
