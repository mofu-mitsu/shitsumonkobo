import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf8');

const regex = /<div className="text-4xl animate-bounce">🐱<\/div>\n\s*<div className="text-sm font-bold text-slate-700">猫が現れた！<br\/><span className="text-\[10px\] text-slate-400 font-normal">特に意味はないようだ… \(タップで閉じる\)<\/span><\/div>/;

const replaceWith = `<div className="text-4xl animate-bounce">
              {(content.gimmicks?.randomEventEmojiOrImage || "🐱").startsWith("http") ? (
                <img src={content.gimmicks.randomEventEmojiOrImage} alt="" className="w-10 h-10 object-contain" />
              ) : (
                content.gimmicks?.randomEventEmojiOrImage || "🐱"
              )}
            </div>
            <div className="text-sm font-bold text-slate-700">
              {content.gimmicks?.randomEventText || "猫が現れた！"}
              <br/><span className="text-[10px] text-slate-400 font-normal">特に意味はないようだ… (タップで閉じる)</span>
            </div>`;

content = content.replace(regex, replaceWith);
fs.writeFileSync('src/components/ContentPlayer.tsx', content);
