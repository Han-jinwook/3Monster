import { supabase } from './lib/supabase';

const ADMINS = [
    'chiu369@naver.com',
    'sundream7878@gmail.com'
];

export async function bootstrapAdmins() {
    try {
        console.log('🚀 Starting admin bootstrap for Supabase...');
        for (const email of ADMINS) {
            const emailKey = email.toLowerCase();
            const { error } = await supabase
                .from('users')
                .upsert({ email: emailKey, role: 'admin' }, { onConflict: 'email' });
            
            if (error) throw error;
            console.log(`✅ Admin added to Supabase: ${emailKey}`);
        }
        console.log('✨ Supabase Admin bootstrap complete.');
    } catch (error: any) {
        console.error('❌ Supabase Bootstrap Error:', error);
    }
}
