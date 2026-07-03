const fs = require('fs');
let code = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf-8');

// Add pairingConnections state
code = code.replace(/const \[pairingScores, setPairingScores\] = useState<Record<string, number>>\(\{\}\);/, 
  "const [pairingScores, setPairingScores] = useState<Record<string, number>>({});\n  const [pairingConnections, setPairingConnections] = useState<Record<string, Record<string, string>>>({});");

// Update handlePairingGameComplete
code = code.replace(/const handlePairingGameComplete = \(quizScore: number\) => \{/, 
  "const handlePairingGameComplete = (quizScore: number, conns?: Record<string, string>) => {\n    if (conns) setPairingConnections(prev => ({ ...prev, [currentQ.id]: conns }));");

// Modify visibleAnswers for pairing
code = code.replace(/if \(pairingScores\[q\.id\] !== undefined\) visibleAnswers\[q\.id\] = pairingScores\[q\.id\];/, 
  "if (pairingScores[q.id] !== undefined) visibleAnswers[q.id] = { score: pairingScores[q.id], connections: pairingConnections[q.id] };");

// Update isAnswered logic
code = code.replace(/isAnswered = pairingScores\[currentQ\.id\] !== undefined;/, 
  "isAnswered = pairingScores[currentQ.id] !== undefined;"); // unchanged

// Update finalScores calculation
code = code.replace(/const pairingScore = pairingScores\[q\.id\] \|\| 0;/g, 
  "const pairingScore = pairingScores[q.id] || 0;"); // unchanged because we access pairingScores, not answers

// Update feedback isCorrect logic
code = code.replace(/const pScore = pairingScores\[currentQ\.id\] \|\| 0;/, 
  "const pScore = pairingScores[currentQ.id] || 0;"); // unchanged

fs.writeFileSync('src/components/ContentPlayer.tsx', code);
console.log("Patched ContentPlayer pairing state");
