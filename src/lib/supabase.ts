import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
if (supabaseAnonKey.includes('eyJ')) {
  supabaseAnonKey = supabaseAnonKey.substring(supabaseAnonKey.indexOf('eyJ'));
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
