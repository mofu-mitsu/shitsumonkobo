const fs = require('fs');
let code = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf-8');

const searchStr = `      maxExprResults.forEach(r => {
        if (r.advancedCondition) {
          try {
            const allAttrs = Array.from(new Set([...Object.keys(finalScores), ...(content.scoringAttributes || [])]));`;

const replacement = `      maxExprResults.forEach(r => {
        let expr = r.advancedCondition;
        if (!expr) {
          const matchingAttr = content.scoringAttributes.find(attr => r.title.includes(attr));
          if (matchingAttr) {
            expr = matchingAttr;
          }
        }
        if (expr) {
          try {
            const allAttrs = Array.from(new Set([...Object.keys(finalScores), ...(content.scoringAttributes || [])]));`;

code = code.replace(searchStr, replacement);

const searchStr2 = `            if (allAttrs.includes(r.advancedCondition)) {
              val = finalScores[r.advancedCondition] || 0;
            } else {
              let evalStr = r.advancedCondition;`;

const replacement2 = `            if (allAttrs.includes(expr)) {
              val = finalScores[expr] || 0;
            } else {
              let evalStr = expr;`;

code = code.replace(searchStr2, replacement2);

fs.writeFileSync('src/components/ContentPlayer.tsx', code);
console.log("Patched ContentPlayer.tsx");
