import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** ブラウザ用Supabaseクライアント（Client Components向け） */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
