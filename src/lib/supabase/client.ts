import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for client-side React components.
 * Supports NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (modern) or NEXT_PUBLIC_SUPABASE_ANON_KEY (legacy).
 * Safely falls back to null when environment variables are absent.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
