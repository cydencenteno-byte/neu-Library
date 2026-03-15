import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://kyknrovufypueibvmkas.supabase.co'
const supabaseKey = 'sb_publishable_2Agdz5TqVj_YcZN7TvNEDg_oZL5HGWE'

export const supabase = createClient(supabaseUrl, supabaseKey)