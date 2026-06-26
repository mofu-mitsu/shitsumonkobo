import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf8');

// 1. Add gimmickScores state
const stateRegex = /const \[pairingScores, setPairingScores\] = useState<Record<string, number>>\(\{\}\);\n\s*const \[beatTapsScore, setBeatTapsScore\] = useState\(0\);/;
const replaceState = `const [pairingScores, setPairingScores] = useState<Record<string, number>>({});
  const [beatTapsScore, setBeatTapsScore] = useState(0);
  const [gimmickScores, setGimmickScores] = useState<Record<string, number>>({});
  const [showSecretLetter, setShowSecretLetter] = useState(false);
  const [secretLetterOpened, setSecretLetterOpened] = useState(false);`;
content = content.replace(stateRegex, replaceState);

// 2. Clear gimmickScores
const clearRegex = /setPairingScores\(\{\}\);\n\s*setBeatTapsScore\(0\);/;
const replaceClear = `setPairingScores({});
    setBeatTapsScore(0);
    setGimmickScores({});
    setSecretLetterOpened(false);
    setShowSecretLetter(false);`;
content = content.replace(clearRegex, replaceClear);

// 3. Add to aggregation
const aggRegex = /let finalScores: Record<string, number> = \{ \.\.\.scores \};/;
const replaceAgg = `let finalScores: Record<string, number> = { ...scores };
    Object.entries(gimmickScores).forEach(([k, v]) => {
      finalScores[k] = (finalScores[k] || 0) + v;
    });`;
content = content.replace(aggRegex, replaceAgg);

// 4. Update TapBeatGame handlers
// For diagnostic:
const diagTapBeatRegex = /onScoreGained=\{\(pts\) => setBeatTapsScore\(s => s \+ pts\)\}/g;
const replaceDiagTapBeat = `onScoreGained={(pts) => {
                  setBeatTapsScore(s => s + (content.type === 'gacha' && content.gimmicks.tapBeatGachaPoints ? content.gimmicks.tapBeatGachaPoints : pts));
                  if (content.gimmicks.tapBeatAttributeMultiplier) {
                    setGimmickScores(prev => {
                      const next = { ...prev };
                      Object.entries(content.gimmicks.tapBeatAttributeMultiplier || {}).forEach(([attr, val]) => {
                        next[attr] = (next[attr] || 0) + Number(val);
                      });
                      return next;
                    });
                  }
                }}`;
content = content.replace(diagTapBeatRegex, replaceDiagTapBeat);

// 5. Update LsiCaterpillar
const lsiRegex = /<LsiCaterpillar \n\s*quotes=\{content\.gimmicks\.caterpillarQuotes\}\n\s*squishTarget=\{content\.gimmicks\.caterpillarSquishTarget\}\n\s*mascot=\{content\.gimmicks\.caterpillarEmoji || "🐛"\}\n\s*\/>/;
const replaceLsi = `<LsiCaterpillar 
          quotes={content.gimmicks.caterpillarQuotes}
          squishTarget={content.gimmicks.caterpillarSquishTarget}
          mascot={content.gimmicks.caterpillarEmoji || "🐛"}
          onTap={() => {
            if (content.gimmicks.caterpillarAttributeMultiplier) {
              setGimmickScores(prev => {
                const next = { ...prev };
                Object.entries(content.gimmicks.caterpillarAttributeMultiplier || {}).forEach(([attr, val]) => {
                  next[attr] = (next[attr] || 0) + Number(val);
                });
                return next;
              });
            }
          }}
          onSquish={() => {
            if (content.gimmicks.caterpillarAttributeMultiplier) {
              setGimmickScores(prev => {
                const next = { ...prev };
                Object.entries(content.gimmicks.caterpillarAttributeMultiplier || {}).forEach(([attr, val]) => {
                  next[attr] = (next[attr] || 0) + (Number(val) * 5); // 潰した時はボーナス5倍
                });
                return next;
              });
            }
          }}
        />`;
content = content.replace(lsiRegex, replaceLsi);

// 6. Handle random letter event (Drop logic in goToNext)
const encounterRegex = /if \(content\.gimmicks\?\.enableRandomEvent && Math\.random\(\) < 0\.15 && currentIdx < playQuestions\.length - 1\) \{/;
const replaceEncounter = `if (content.gimmicks?.enableSecretLetter && !secretLetterOpened && Math.random() < 0.20 && currentIdx > 0 && currentIdx < playQuestions.length - 1) {
      setShowSecretLetter(true);
      playSound("synth");
    } else if (content.gimmicks?.enableRandomEvent && Math.random() < 0.15 && currentIdx < playQuestions.length - 1) {`;
content = content.replace(encounterRegex, replaceEncounter);

// 7. Add Secret Letter UI inside AnimatePresence (near random encounter)
const animateRegex = /\{showEncounter && \(/;
const replaceAnimate = `{showSecretLetter && !secretLetterOpened && (
          <motion.div 
            initial={{ y: -100, opacity: 0, rotate: -10 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 100, opacity: 0, scale: 0.5 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-white border border-rose-200 shadow-xl rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer w-64 text-center"
            onClick={() => {
              playSound("bell");
              setSecretLetterOpened(true);
              setShowSecretLetter(false);
              if (content.gimmicks.secretLetterAttributeMultiplier) {
                setGimmickScores(prev => {
                  const next = { ...prev };
                  Object.entries(content.gimmicks.secretLetterAttributeMultiplier || {}).forEach(([attr, val]) => {
                    next[attr] = (next[attr] || 0) + Number(val);
                  });
                  return next;
                });
              }
              // Show modal or just alert for simplicity, wait, let's show an alert for now or a feedback modal
              setFeedbackModal({ 
                show: true, 
                type: 'survey', 
                mockStats: undefined, 
                explanation: content.gimmicks.secretLetterText || "手紙を読みました！ポイントが加算されたよ！",
                isCorrect: true // Just a visual styling
              });
            }}
          >
            <div className="text-4xl">✉️</div>
            <div className="text-sm font-bold text-slate-700">謎の手紙が落ちてきた！</div>
            <div className="text-[10px] text-slate-400">タップして開ける</div>
          </motion.div>
        )}
        
        {showEncounter && (`
content = content.replace(animateRegex, replaceAnimate);

fs.writeFileSync('src/components/ContentPlayer.tsx', content);
