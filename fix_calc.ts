import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf8');

const regex = /\/\/ たたきゲームの得点\(beatTapsScore\)も一番高いパラメータにボーナス[\s\S]*?finalScores\[key\] = \(finalScores\[key\] \|\| 0\) \+ beatTapsScore;\n\s*\}/;

const newCalcLogic = `    // たたきゲームの得点(beatTapsScore)を指定パラメータにボーナス加算
    if (beatTapsScore > 0) {
      if (content.gimmicks?.tapBeatAttributeMultiplier && Object.keys(content.gimmicks.tapBeatAttributeMultiplier).length > 0) {
        Object.entries(content.gimmicks.tapBeatAttributeMultiplier).forEach(([attr, multi]) => {
          if (attr !== 'gacha_point') {
            finalScores[attr] = (finalScores[attr] || 0) + (beatTapsScore * multi);
          }
        });
      } else {
        const key = content.scoringAttributes[0] || "BonusPoints";
        finalScores[key] = (finalScores[key] || 0) + beatTapsScore;
      }
    }`;

content = content.replace(regex, newCalcLogic);

// gachaScore に対するボーナス加算
// UI上でガチャポイントを表示しているとこを探すか、ガチャを引けるポイントの制限があるか確認
// 現在はガチャポイント消費の仕組みがないかもしれない。

fs.writeFileSync('src/components/ContentPlayer.tsx', content);
