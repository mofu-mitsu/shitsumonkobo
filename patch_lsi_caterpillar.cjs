const fs = require('fs');
let code = fs.readFileSync('src/components/LsiCaterpillar.tsx', 'utf-8');

// Add maxAppearances to props
code = code.replace(/onTap\?: \(\) => void;/g, 'onTap?: () => void;\n  maxAppearances?: number;');
code = code.replace(/onTap\n\}/g, 'onTap,\n  maxAppearances\n}');

// Find where it's spawned
const spawnLogicOld = `    const spawnInterval = setInterval(() => {
      if (!isVisible && !isSquished) {
        if (Math.random() < 0.15) {
          setIsVisible(true);
        }
      }
    }, 5000);`;

const spawnLogicNew = `    const spawnInterval = setInterval(() => {
      if (!isVisible && !isSquished) {
        if (maxAppearances !== undefined && appearanceCountRef.current >= maxAppearances) {
          clearInterval(spawnInterval);
          return;
        }
        if (Math.random() < 0.15) {
          setIsVisible(true);
          appearanceCountRef.current += 1;
        }
      }
    }, 5000);`;

code = code.replace(spawnLogicOld, spawnLogicNew);

// Add appearanceCountRef
code = code.replace(/const \[isSquished, setIsSquished\] = useState\(false\);/, 'const [isSquished, setIsSquished] = useState(false);\n  const appearanceCountRef = useRef(0);');

fs.writeFileSync('src/components/LsiCaterpillar.tsx', code);
console.log("Patched LsiCaterpillar!");
