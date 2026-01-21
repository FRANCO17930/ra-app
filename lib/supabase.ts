import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_j1Tff1oyJQgJOnMtrAXkEQ_U3F6H4J0';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing.');
}

// Para el cliente público, usamos la Anon Key (aunque tengamos la Service Key disponible en el env)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
