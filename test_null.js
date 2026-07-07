import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL.trim();
let SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY.trim();
if (SUPABASE_KEY.includes('eyJ')) {
  SUPABASE_KEY = SUPABASE_KEY.substring(SUPABASE_KEY.indexOf('eyJ'));
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data, error } = await supabase.from('shitsumon_play_logs').insert([{
    content_id: 'test_null',
    creator_x_handle: 'test',
    user_id: null,
    data: {}
  }]);
  console.log("Insert null user_id:", error);
}
run();
