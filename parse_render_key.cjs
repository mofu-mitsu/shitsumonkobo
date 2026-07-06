const fs = require('fs');
let code = fs.readFileSync('api/render.ts', 'utf-8');

code = code.replace(
  /process\.env\.VITE_SUPABASE_ANON_KEY \|\| ''/g,
  `(process.env.VITE_SUPABASE_ANON_KEY || '').includes('eyJ') ? (process.env.VITE_SUPABASE_ANON_KEY || '').substring((process.env.VITE_SUPABASE_ANON_KEY || '').indexOf('eyJ')) : process.env.VITE_SUPABASE_ANON_KEY`
);

fs.writeFileSync('api/render.ts', code);
