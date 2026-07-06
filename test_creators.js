import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL.trim(), process.env.VITE_SUPABASE_ANON_KEY.trim().substring(process.env.VITE_SUPABASE_ANON_KEY.indexOf('eyJ')));

async function run() {
  const { data } = await supabase.from('shitsumon_contents').select('id, creatorId, "creatorName"');
  console.log("All contents:");
  data.forEach(d => console.log(d.id, d.creatorId, d.creatorName));
}
run();
