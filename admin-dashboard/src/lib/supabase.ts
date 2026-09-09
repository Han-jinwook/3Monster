import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is missing. Check your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// 세션 토큰에 영향받지 않는 퍼블릭 데이터 조회용 클라이언트 (라이선스 등 RLS 익명 우회)
export const supabasePublic = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: { persistSession: false, autoRefreshToken: false }
});
