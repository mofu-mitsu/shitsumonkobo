import * as fs from 'fs';

let playerStr = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf8');

// Remove the survey mock stats from proceedWithFeedbackCheck
playerStr = playerStr.replace(
  /\} else if \(content\.type === 'survey' && content\.surveyShowStats\) \{[\s\S]*?return;\s*\}/,
  `}`
);

fs.writeFileSync('src/components/ContentPlayer.tsx', playerStr);
