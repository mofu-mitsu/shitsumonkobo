const fs = require('fs');
let code = fs.readFileSync('src/lib/supabase.ts', 'utf-8');

code = code.replace(
  /if \(supabaseAnonKey\.includes\('eyJ'\)\) \{\n  supabaseAnonKey = 'eyJ' \+ supabaseAnonKey\.split\('eyJ'\)\[1\];\n\}/g,
  `if (supabaseAnonKey.includes('eyJ')) {\n  supabaseAnonKey = supabaseAnonKey.substring(supabaseAnonKey.indexOf('eyJ'));\n}`
);

fs.writeFileSync('src/lib/supabase.ts', code);
