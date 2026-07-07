import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL.trim(), process.env.VITE_SUPABASE_ANON_KEY.trim().substring(process.env.VITE_SUPABASE_ANON_KEY.indexOf('eyJ')));

async function run() {
  const { data, error } = await supabase.from('shitsumon_play_logs').select('content_id');
  console.log("Count:", data ? data.length : 0);
  console.log("Error:", error);
}
run();
