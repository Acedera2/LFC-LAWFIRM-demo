import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseEnabled
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

export function normalizeSupabaseProfile(profile, authUser) {
  if (!profile && !authUser) return null;
  return {
    id: profile?.id || authUser?.id,
    name: profile?.full_name || authUser?.user_metadata?.full_name || authUser?.email,
    email: profile?.email || authUser?.email,
    phone: profile?.phone || authUser?.user_metadata?.phone || null,
    status: "ACTIVE",
    role: {
      slug: profile?.role || "client",
      name: profile?.role || "client"
    }
  };
}

export function mapSupabaseNotification(row) {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.category?.toUpperCase() || "SYSTEM",
    readAt: row.read_at,
    createdAt: row.created_at
  };
}
