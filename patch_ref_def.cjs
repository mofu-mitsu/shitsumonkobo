const fs = require('fs');
let code = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf-8');

code = code.replace(/export default function ContentPlayer\(.*?\) \{/, 
  "export default function ContentPlayer({ content, season, currentUser, onClose, initialShowDashboard = false, showAlert }: ContentPlayerProps) {\n  const resultCardRef = useRef<HTMLDivElement>(null);");

fs.writeFileSync('src/components/ContentPlayer.tsx', code);
console.log("Patched resultCardRef definition");
