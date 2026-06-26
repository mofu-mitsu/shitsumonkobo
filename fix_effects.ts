import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf8');

const backgroundEffectUI = `
      {/* 🌦 背景エフェクト */}
      {content.gimmicks?.enableBackgroundEffect && content.gimmicks.enableBackgroundEffect !== 'none' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl opacity-50 z-0">
          {Array.from({ length: 20 }).map((_, i) => (
             <motion.div
               key={i}
               initial={{ y: -50, x: Math.random() * 400 }}
               animate={{ 
                 y: 800, 
                 x: Math.random() * 400 + (Math.random() < 0.5 ? -100 : 100),
                 rotate: Math.random() * 360
               }}
               transition={{ 
                 duration: Math.random() * 3 + 5, 
                 repeat: Infinity, 
                 ease: "linear",
                 delay: Math.random() * 5 
               }}
               className="absolute"
             >
               {content.gimmicks.enableBackgroundEffect === 'snow' ? "❄️"
               : content.gimmicks.enableBackgroundEffect === 'petals' ? "🌸"
               : content.gimmicks.enableBackgroundEffect === 'stars' ? "✨"
               : content.gimmicks.enableBackgroundEffect === 'rain' ? <div className="w-0.5 h-6 bg-sky-400 opacity-50 rotate-12"></div>
               : ""}
             </motion.div>
          ))}
        </div>
      )}
`;

const randomEncounterUI = `
      {/* ランダム遭遇イベント */}
      <AnimatePresence>
        {showEncounter && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 flex items-center gap-4 cursor-pointer"
            onClick={() => { setShowEncounter(false); playSound("synth"); }}
          >
            <div className="text-4xl animate-bounce">🐱</div>
            <div className="text-sm font-bold text-slate-700">猫が現れた！<br/><span className="text-[10px] text-slate-400 font-normal">特に意味はないようだ… (タップで閉じる)</span></div>
          </motion.div>
        )}
      </AnimatePresence>
`;

// Add showEncounter state
if (!content.includes('const [showEncounter, setShowEncounter]')) {
  content = content.replace(
    'const [isStarted, setIsStarted] = useState(false);',
    'const [isStarted, setIsStarted] = useState(false);\n  const [showEncounter, setShowEncounter] = useState(false);'
  );
}

// Trigger in goToNext
const goToNextRegex = /const goToNext = \(\) => \{/;
const nextLogic = `const goToNext = () => {
    // ランダム遭遇 (約15%の確率で発生)
    if (content.gimmicks?.enableRandomEncounter && Math.random() < 0.15 && currentIdx < playQuestions.length - 1) {
      setShowEncounter(true);
      playSound("bell");
      setTimeout(() => setShowEncounter(false), 3000);
    }
`;
content = content.replace(goToNextRegex, nextLogic);

// Add the background effect layer just below the main container wrapper.
// So just inside `div min-h-[500px] ...`
content = content.replace(
  '{/* 芋虫ギミックの召喚 */}',
  backgroundEffectUI + '\n      {/* 芋虫ギミックの召喚 */}'
);

// Add randomEncounterUI before final return closure
content = content.replace(
  '</div>\n  );\n}',
  randomEncounterUI + '\n    </div>\n  );\n}'
);

fs.writeFileSync('src/components/ContentPlayer.tsx', content);
