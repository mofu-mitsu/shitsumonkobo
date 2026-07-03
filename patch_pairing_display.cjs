const fs = require('fs');
let code = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf-8');

const oldPairingRender = `{typeof l.answers[q.id] === 'object' ? JSON.stringify(l.answers[q.id]) : l.answers[q.id]}%`;

const newPairingRender = `
                                        {(() => {
                                          const ansObj = l.answers[q.id];
                                          if (typeof ansObj === 'object' && ansObj !== null && ansObj.score !== undefined) {
                                            const conns = ansObj.connections || {};
                                            const details = Object.entries(conns).map(([lId, rId]) => {
                                              const leftItem = q.pairItems?.find(p => p.id === lId);
                                              const rightItem = q.pairItems?.find(p => p.id === rId);
                                              const lText = leftItem ? (leftItem.leftLabel || leftItem.leftEmojiOrUrl) : "?";
                                              const rText = rightItem ? (rightItem.rightLabel || rightItem.rightEmojiOrUrl) : "?";
                                              return \`\${lText} ↔ \${rText}\`;
                                            }).join(", ");
                                            return <span className="flex flex-col gap-0.5"><span>スコア: {ansObj.score}%</span><span className="text-[9px] text-slate-500 opacity-80">{details}</span></span>;
                                          }
                                          return \`\${ansObj}%\`;
                                        })()}
`;

// It's inside a JSX expression, we need to remove the outer {} in oldPairingRender if we use an IIFE inside {}.
// Let's replace the whole span content.
code = code.replace(/\{typeof l\.answers\[q\.id\] === 'object' \? JSON\.stringify\(l\.answers\[q\.id\]\) : l\.answers\[q\.id\]\}%/, newPairingRender);

fs.writeFileSync('src/components/ContentPlayer.tsx', code);
console.log("Patched Pairing Game Display");
