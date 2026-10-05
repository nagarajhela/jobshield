import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

let client = null;

const isValidHttpUrl = (urlString) => {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

if (rawUrl && rawKey && isValidHttpUrl(rawUrl)) {
  try {
    client = createClient(rawUrl, rawKey);
  } catch (err) {
    console.warn('[JobShield Supabase] Failed to initialize client:', err);
  }
} else {
  console.warn(
    '[JobShield Supabase] Missing or invalid VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in environment variables.'
  );
}

export const supabase = client;
