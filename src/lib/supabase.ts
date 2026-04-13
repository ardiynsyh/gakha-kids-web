import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gtewlyijcsiucxykbkrs.supabase.co';
const supabaseAnonKey = 'sb_publishable_GfMGSjONl5SEaQcNKOPWKg_WRj8FUtb';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
