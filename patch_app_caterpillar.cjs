const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// The logic for spawning caterpillar
// Math.random() < 0.2 ...
const oldLogic = `// 芋虫（マスコット）ギミック
      if (currentContent.gimmicks?.enableLsiCaterpillar && !caterpillarState.isSquished) {
        if (Math.random() < 0.2 && !caterpillarState.isVisible) {`;
const newLogic = `// 芋虫（マスコット）ギミック
      if (currentContent.gimmicks?.enableLsiCaterpillar && !caterpillarState.isSquished) {
        const maxApp = currentContent.gimmicks.caterpillarMaxAppearances;
        if (Math.random() < 0.2 && !caterpillarState.isVisible && (maxApp === undefined || caterpillarState.appearanceCount < maxApp)) {`;

code = code.replace(oldLogic, newLogic);

// We need to add appearanceCount to caterpillarState
code = code.replace(/const \[caterpillarState, setCaterpillarState\] = useState\(\{ isVisible: false, clickCount: 0, currentQuote: "", isSquished: false \}\);/, 'const [caterpillarState, setCaterpillarState] = useState({ isVisible: false, clickCount: 0, currentQuote: "", isSquished: false, appearanceCount: 0 });');

// And increment appearanceCount when it appears
code = code.replace(/setCaterpillarState\(prev => \(\{ \.\.\.prev, isVisible: true \}\)\);/, 'setCaterpillarState(prev => ({ ...prev, isVisible: true, appearanceCount: prev.appearanceCount + 1 }));');


fs.writeFileSync('src/App.tsx', code);
console.log("Patched App caterpillar!");
