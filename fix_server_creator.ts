import * as fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/creatorName: "管理者"/g, 'creatorName: "デフォルト"');

fs.writeFileSync('server.ts', content);
