import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Initializing Supabase with URL:', supabaseUrl);
if (supabaseAnonKey) {
    console.log('Supabase Anon Key found (starts with):', supabaseAnonKey.substring(0, 10) + '...');
} else {
    console.error('Supabase Anon Key is MISSING!');
}

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. Check your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

