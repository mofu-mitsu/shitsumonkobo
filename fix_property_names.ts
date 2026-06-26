import * as fs from 'fs';

let creator = fs.readFileSync('src/components/ContentCreator.tsx', 'utf8');
creator = creator.replace(/enableRandomEncounter/g, 'enableRandomEvent');
creator = creator.replace(/enableBackgroundEffect/g, 'weatherEffect');
fs.writeFileSync('src/components/ContentCreator.tsx', creator);

let player = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf8');
player = player.replace(/enableRandomEncounter/g, 'enableRandomEvent');
player = player.replace(/enableBackgroundEffect/g, 'weatherEffect');
fs.writeFileSync('src/components/ContentPlayer.tsx', player);
