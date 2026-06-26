import * as fs from 'fs';

let content = fs.readFileSync('src/components/ContentCreator.tsx', 'utf8');

const regex = /\{content\.scoringAttributes\.map\(attr => \(\n\s*<option key=\{attr\} value=\{attr\}>\{attr\}<\/option>\n\s*\)\)\}/;

const newLogic = `                              {content.type === 'quiz' ? (
                                <option value="correct">正解数 (correct)</option>
                              ) : (
                                content.scoringAttributes.map(attr => (
                                  <option key={attr} value={attr}>{attr}</option>
                                ))
                              )}`;

content = content.replace(regex, newLogic);
fs.writeFileSync('src/components/ContentCreator.tsx', content);
