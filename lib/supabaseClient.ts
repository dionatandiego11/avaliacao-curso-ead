import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtifnohvgbplhqtvmjhs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aWZub2h2Z2JwbGhxdHZtamhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMTA1MzAsImV4cCI6MjA3Mzg4NjUzMH0.hUEVJKcsWt_ddIYCBj6sL4_2oyA8AJyxZf_nijHLW8A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
