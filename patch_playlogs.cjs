const fs = require('fs');
let code = fs.readFileSync('src/lib/playLogs.ts', 'utf-8');

code = code.replace(
  /import \{ auth \} from '\.\/firebase';/g,
  `import { supabase } from './supabase';`
);

code = code.replace(
  /user_id: auth\.currentUser\?\.uid \|\| "anonymous",/g,
  `user_id: (await supabase.auth.getSession()).data.session?.user?.id || "anonymous",`
);

fs.writeFileSync('src/lib/playLogs.ts', code);
console.log("Patched playLogs.ts");
