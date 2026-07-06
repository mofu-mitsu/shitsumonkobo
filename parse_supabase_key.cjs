const fs = require('fs');
let code = fs.readFileSync('src/lib/supabase.ts', 'utf-8');

code = code.replace(
  /const supabaseAnonKey = import\.meta\.env\.VITE_SUPABASE_ANON_KEY \|\| '';/,
  `let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
if (supabaseAnonKey.includes('eyJ')) {
  supabaseAnonKey = 'eyJ' + supabaseAnonKey.split('eyJ')[1];
}`
);

fs.writeFileSync('src/lib/supabase.ts', code);
