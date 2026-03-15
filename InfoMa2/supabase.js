import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://kyknrovufypueibvmkas.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5a25yb3Z1ZnlwdWVpYnZta2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NDE3MzAsImV4cCI6MjA4OTExNzczMH0.fqNMkSi2Ye_In8XIlkzDKqn15GJMhZ-_42yUnwOEj0Y'

export const supabase = createClient(supabaseUrl, supabaseKey)