import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ========================================
// CONFIGURATION
// ========================================
const SUPABASE_URL = "https://hxwbbymzinxmtmfhyxdt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_cUkHi6YR7FyK74vr1dCk4w_UojIyVYv";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
