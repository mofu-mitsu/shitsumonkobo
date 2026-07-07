import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL.trim(), process.env.VITE_SUPABASE_ANON_KEY.trim().substring(process.env.VITE_SUPABASE_ANON_KEY.indexOf('eyJ')));

async function run() {
  const { data, error } = await supabase.from('shitsumon_play_logs').select('data').limit(5);
  console.log(JSON.stringify(data, null, 2));
}
run();
