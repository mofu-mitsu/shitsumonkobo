import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL.trim();
let SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY.trim();
if (SUPABASE_KEY.includes('eyJ')) {
  SUPABASE_KEY = SUPABASE_KEY.substring(SUPABASE_KEY.indexOf('eyJ'));
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data, error } = await supabase.from('shitsumon_play_logs').select('id, data');
  if (error) { console.error(error); return; }
  
  const toDelete = data.filter(r => !r.data || Object.keys(r.data).length === 0);
  console.log("Empty logs:", toDelete.length);
  
  if (toDelete.length > 0) {
    const ids = toDelete.map(r => r.id);
    for (let i = 0; i < ids.length; i += 50) {
      const batch = ids.slice(i, i + 50);
      await supabase.from('shitsumon_play_logs').delete().in('id', batch);
    }
    console.log("Deleted empty logs");
  }
}
run();
