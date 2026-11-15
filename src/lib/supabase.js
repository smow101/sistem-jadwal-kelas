import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'ISI_SUPABASE_URL_DISINI';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'ISI_SUPABASE_ANON_KEY_DISINI';

export const isConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  SUPABASE_URL !== 'ISI_SUPABASE_URL_DISINI' &&
  SUPABASE_ANON_KEY !== 'ISI_SUPABASE_ANON_KEY_DISINI'
);

export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
