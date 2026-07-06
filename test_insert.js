import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL.trim();
let SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY.trim();
if (SUPABASE_KEY.includes('eyJ')) SUPABASE_KEY = SUPABASE_KEY.substring(SUPABASE_KEY.indexOf('eyJ'));
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data: cols, error: err } = await supabase.rpc('hello_world'); // no.
  // let's just fetch one row but check what's going on with the columns
  const res = await fetch(`${SUPABASE_URL}/rest/v1/shitsumon_contents?limit=1`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  console.log(res.status, await res.text());
}
run();
