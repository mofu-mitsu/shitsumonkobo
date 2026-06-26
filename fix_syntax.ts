import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /return getSeasons\(\)\[3\];\n  \};\n\nexport default function App\(\) \{/;
const replaceWith = `return getSeasons()[3];
  }
};

export default function App() {`;

content = content.replace(regex, replaceWith);
fs.writeFileSync('src/App.tsx', content);
