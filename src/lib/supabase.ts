import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let _admin: SupabaseClient | null = null;

/** Server-only Supabase client using the service role key. Never import in client components. */
export function getSupabaseAdmin(): SupabaseClient {
  if (!URL || !SERVICE_KEY) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  if (!_admin) {
    _admin = createClient(URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _admin;
}

export function isSupabaseConfigured(): boolean {
  return !!URL && !!SERVICE_KEY;
}
