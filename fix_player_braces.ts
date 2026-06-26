import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf8');

const regex = /if \(rule && rule\.isCorrect\) fbIsCorrect = true;\n\s*\}\);\n\s*setFeedbackModal\(\{ show: true, type: 'survey', mockStats \}\);\n\s*playSound\("synth"\);\n\s*return;\n\s*\}/;

const replaceWith = `if (rule && rule.isCorrect) fbIsCorrect = true;
      }
      
      setFeedbackModal({ show: true, type: 'quiz', isCorrect: fbIsCorrect, explanation: fbExplanation });
      playSound("synth");
      return;
    } else if (content.type === 'survey' && content.surveyShowStats) {
      const mockStats = { "A": 45, "B": 30, "C": 25 }; // モックデータ
      setFeedbackModal({ show: true, type: 'survey', mockStats });
      playSound("synth");
      return;
    }`;

content = content.replace(regex, replaceWith);
fs.writeFileSync('src/components/ContentPlayer.tsx', content);
