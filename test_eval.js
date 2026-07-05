const finalScores = { '黒胆質': 10, 'A': 5, 'Apple': 20, '多血質': 3, 'My Attr': 8 };
const scoringAttributes = ['黒胆質', 'A', 'Apple', '多血質', 'Missing', 'My Attr'];
let evalStr = "黒胆質 >= 多血質 + Missing && Apple > A && 'My Attr' == 8";

const allAttrs = Array.from(new Set([...Object.keys(finalScores), ...scoringAttributes]));
const keys = allAttrs.sort((a, b) => b.length - a.length);
keys.forEach(k => {
  const val = finalScores[k] || 0;
  const isAlphanumeric = /^[a-zA-Z0-9_]+$/.test(k);
  if (isAlphanumeric) {
    evalStr = evalStr.replace(new RegExp(`\\b${k}\\b`, 'g'), val.toString());
  } else {
    evalStr = evalStr.split(k).join(val.toString());
  }
});
console.log(evalStr);
console.log(eval(evalStr));
