import * as fs from 'fs';

let content = fs.readFileSync('src/types.ts', 'utf8');

const newGimmicks = `
  enableLsiCaterpillar: boolean; // マスコットギミックをオンにするか
  lsiMascotImageOrEmoji?: string; // デフォルトは🐛、カスタマイズ可能

  // 新規追加ギミック
  enableAchievements?: boolean; // 実績機能
  achievements?: { id: string; conditionAttribute: string; conditionScoreMin: number; title: string }[];
  
  enableRandomEvent?: boolean; // ランダムイベント（猫が現れるなど）
  randomEventEmojiOrImage?: string; 
  randomEventText?: string;
  
  secretNpcEvent?: { questionIndex: number; npcCameoText: string; npcEmoji: string }[]; // Q数経過で乱入するNPC
  
  secretMessage?: string; // 最後に手紙が届くギミック
`;

content = content.replace('enableLsiCaterpillar: boolean; // LSI芋虫(🐛)ギミックをオンにするか', newGimmicks);

fs.writeFileSync('src/types.ts', content);
