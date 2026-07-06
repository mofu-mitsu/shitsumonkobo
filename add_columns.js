import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL.trim();
let SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY.trim();
if (SUPABASE_KEY.includes('eyJ')) {
  SUPABASE_KEY = SUPABASE_KEY.substring(SUPABASE_KEY.indexOf('eyJ'));
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// We can't directly run DDL via the JS client unless we have a RPC. 
// Let's just fetch one row and see if the columns are there, if not, maybe the user hasn't added them, but let's check.
async function run() {
  const { data, error } = await supabase.from('shitsumon_contents').select('*').limit(1);
  console.log("Current schema data:", data);
  if (error) console.error("Error fetching schema:", error);
}

run();
