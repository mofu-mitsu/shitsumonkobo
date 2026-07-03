const fs = require('fs');
let code = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf-8');

// Add states
code = code.replace(/const \[secretLetterOpened, setSecretLetterOpened\] = useState\(false\);/, 
  "const [secretLetterOpened, setSecretLetterOpened] = useState(false);\n  const [secretLetterCount, setSecretLetterCount] = useState(0);\n  const [randomEventCount, setRandomEventCount] = useState(0);");

// Update handle trigger
const oldTrigger = `    // ランダム遭遇 (約15%の確率で発生)
    if (content.gimmicks?.enableSecretLetter && !secretLetterOpened && Math.random() < 0.20 && currentIdx > 0 && currentIdx < playQuestions.length - 1) {
      setShowSecretLetter(true);
      playSound("synth");
    } else if (content.gimmicks?.enableRandomEvent && Math.random() < 0.15 && currentIdx < playQuestions.length - 1) {
      setShowEncounter(true);
      playSound("bell");
      setTimeout(() => setShowEncounter(false), 3000);
    }`;

const newTrigger = `    // ランダム遭遇 (約15%の確率で発生)
    const slMax = content.gimmicks?.secretLetterMaxAppearances;
    const reMax = content.gimmicks?.randomEventMaxAppearances;
    const canShowSL = content.gimmicks?.enableSecretLetter && (slMax === undefined || secretLetterCount < slMax) && currentIdx > 0 && currentIdx < playQuestions.length - 1;
    const canShowRE = content.gimmicks?.enableRandomEvent && (reMax === undefined || randomEventCount < reMax) && currentIdx < playQuestions.length - 1;

    if (canShowSL && Math.random() < 0.20) {
      setShowSecretLetter(true);
      setSecretLetterCount(c => c + 1);
      playSound("synth");
    } else if (canShowRE && Math.random() < 0.15) {
      setShowEncounter(true);
      setRandomEventCount(c => c + 1);
      playSound("bell");
      setTimeout(() => setShowEncounter(false), 3000);
    }`;

code = code.replace(oldTrigger, newTrigger);

fs.writeFileSync('src/components/ContentPlayer.tsx', code);
console.log("Patched ContentPlayer.tsx for gimmick limits");
