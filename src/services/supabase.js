import { createClient } from '@supabase/supabase-js';

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' ? process.env : {});
const supabaseUrl = env?.VITE_SUPABASE_URL;
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

let isSupabaseOnline = false;
let healthCheckPromise = null;

// Helper to run any promise with a strict timeout
export const withTimeout = (promise, ms = 1200) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), ms))
    ]);
};

// Quick health check to test if Supabase domain is reachable
export const checkSupabaseHealth = async () => {
    if (!hasSupabaseConfig) {
        isSupabaseOnline = false;
        return false;
    }

    if (healthCheckPromise) return healthCheckPromise;

    healthCheckPromise = (async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1200);
            
            // Ping the Supabase REST health or root endpoint
            const res = await fetch(`${supabaseUrl}/rest/v1/`, {
                method: 'HEAD',
                headers: {
                    apikey: supabaseAnonKey,
                    Authorization: `Bearer ${supabaseAnonKey}`
                },
                signal: controller.signal
            }).catch(() => null);

            clearTimeout(timeoutId);
            isSupabaseOnline = Boolean(res && (res.status === 200 || res.status === 401 || res.status === 404));
        } catch (err) {
            isSupabaseOnline = false;
        }
        return isSupabaseOnline;
    })();

    return healthCheckPromise;
};

// Non-blocking background health check
checkSupabaseHealth().then(online => {
    console.log(`[Supabase] Status: ${online ? 'ONLINE' : 'OFFLINE (Local Mode Active)'}`);
});

export const isOnline = () => isSupabaseOnline;

export const supabase = (hasSupabaseConfig) 
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true
        }
    })
    : null;
