import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL.trim();
let SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY.trim();
if (SUPABASE_KEY.includes('eyJ')) {
  SUPABASE_KEY = SUPABASE_KEY.substring(SUPABASE_KEY.indexOf('eyJ'));
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data, error } = await supabase
    .from('shitsumon_contents')
    .update({ creatorId: 'f7966c7d-f92a-4aac-8a33-ca7faa6281ad' })
    .eq('creatorId', 'mAKrOWr4GaaCsNi9Nvj53AFe9Ld2');
  console.log("Update result:", error, data);
}
run();
