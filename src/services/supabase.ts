import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://zpcvxpwkiicnoclrjidb.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_dSIU0aH_K5HssFmQPl5K3g_c0ZaDAvm';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
