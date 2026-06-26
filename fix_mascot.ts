import * as fs from 'fs';

let lsiContent = fs.readFileSync('src/components/LsiCaterpillar.tsx', 'utf8');

lsiContent = lsiContent.replace('quotes?: string[];\n  squishTarget?: number;\n}', 'quotes?: string[];\n  squishTarget?: number;\n  mascot?: string;\n}');
lsiContent = lsiContent.replace('squishTarget = 30,\n}: LsiCaterpillarProps) {', 'squishTarget = 30,\n  mascot = "🐛"\n}: LsiCaterpillarProps) {');

const renderMascot = `{mascot.startsWith("http") || mascot.startsWith("data:") 
      ? <img src={mascot} className="w-10 h-10 object-contain filter drop-shadow-md" alt="mascot" draggable={false} />
      : mascot}`;

lsiContent = lsiContent.replace('🐛\n          </motion.div>', renderMascot + '\n          </motion.div>');
lsiContent = lsiContent.replace('僕は、感覚と主観的論理の塊なのだ…🐛', '僕は、感覚と主観的論理の塊なのだ…');
lsiContent = lsiContent.replace('ぎゃーーー！潰されたァーー！！！🐛💥', '💥 ぎゃーーー！潰されたァーー！！！');
lsiContent = lsiContent.replace('🌱 芋虫を復活させる', '🌱 復活させてあげる');

fs.writeFileSync('src/components/LsiCaterpillar.tsx', lsiContent);

let playerContent = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf8');
playerContent = playerContent.replace(/<LsiCaterpillar[\s\S]*?\/>/, 
  `<LsiCaterpillar quotes={content.gimmicks.caterpillarQuotes} squishTarget={content.gimmicks.caterpillarSquishTarget} mascot={content.gimmicks.lsiMascotImageOrEmoji || "🐛"} />`);
fs.writeFileSync('src/components/ContentPlayer.tsx', playerContent);

