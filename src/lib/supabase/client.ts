import { createBrowserClient } from "@supabase/ssr";
import { createClient as createBaseClient, type SupabaseClient } from "@supabase/supabase-js";

let clientSingleton: SupabaseClient | null = null;

/**
 * Creates or retrieves a singleton Supabase client for client-side React components.
 * Supports NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (modern) or NEXT_PUBLIC_SUPABASE_ANON_KEY (legacy).
 * Safely falls back to null when environment variables are absent.
 */
export function createClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  if (!clientSingleton) {
    if (typeof window !== "undefined") {
      clientSingleton = createBrowserClient(supabaseUrl, supabaseKey);
    } else {
      clientSingleton = createBaseClient(supabaseUrl, supabaseKey);
    }
  }

  return clientSingleton;
}

export function resetClientSingleton() {
  clientSingleton = null;
}
