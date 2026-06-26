import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf8');

const regex = /let topAttr = content\.scoringAttributes\[0\];\n\s*let topScore = finalScores\[topAttr\] \|\| 0;\n\n\s*content\.scoringAttributes\.forEach\(attr => \{\n\s*const cur = finalScores\[attr\] \|\| 0;\n\s*if \(cur > topScore\) \{\n\s*topScore = cur;\n\s*topAttr = attr;\n\s*\}\n\s*\}\);/;

const newLogic = `    let topAttr = content.scoringAttributes[0];
    let topScore = finalScores[topAttr] || 0;

    if (content.type === 'quiz') {
       topAttr = 'correct';
       topScore = finalScores['correct'] || 0;
    } else {
      content.scoringAttributes.forEach(attr => {
        const cur = finalScores[attr] || 0;
        if (cur > topScore) {
          topScore = cur;
          topAttr = attr;
        }
      });
    }`;

content = content.replace(regex, newLogic);
fs.writeFileSync('src/components/ContentPlayer.tsx', content);
