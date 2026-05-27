import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type UserRole = 'admin' | 'buyer' | 'user' | null;


interface AuthContextType {
    user: User | null;
    email: string | null;
    role: UserRole;
    loading: boolean;
    logout: () => Promise<void>;
    refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    email: null,
    role: null,
    loading: true,
    logout: async () => { },
    refreshRole: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);

    const checkRole = async (userEmail: string) => {
        try {
            console.log(`🔍 Checking role for: ${userEmail}`);
            // 1. Check users table
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('role')
                .eq('email', userEmail.toLowerCase())
                .maybeSingle();
            
            if (userError) {
                throw userError;
            }

            if (userData) {
                console.log(`📊 Role result: ${userData.role}`);
                return userData.role as UserRole;
            }

            // 2. Check licenses table (fallback if not registered in users)
            const { data: licenseData, error: licenseError } = await supabase
                .from('licenses')
                .select('id')
                .eq('contact', userEmail.toLowerCase())
                .limit(1);

            if (licenseError) {
                throw licenseError;
            }

            if (licenseData && licenseData.length > 0) {
                console.log(`📊 Role result: buyer (via licenses table)`);
                return 'buyer';
            }

            console.log(`📊 Role result: user (Not a registered user)`);
            return 'user';
        } catch (error) {
            console.error('❌ Error checking role:', error);
            return 'user';
        }
    };


    const registerUserMapping = async (uid: string, userEmail: string) => {
        try {
            const emailKey = userEmail.toLowerCase();
            const { error } = await supabase
                .from('users')
                .upsert({
                    email: emailKey,
                    uid: uid
                }, { onConflict: 'email' });

            if (error) throw error;
            console.log(`👤 User mapping registered: ${emailKey} -> ${uid}`);
        } catch (error: any) {
            console.error('❌ Error registering user mapping:', error);
        }
    };

    const refreshRole = async () => {
        const userEmail = localStorage.getItem('user_email');
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (userEmail && currentUser) {
            const detectedRole = await checkRole(userEmail);
            setRole(detectedRole);
            setEmail(userEmail.toLowerCase());
            setUser(currentUser); // 유저 정보 명시적 세팅 (누락 예방)
            await registerUserMapping(currentUser.id, userEmail);
            console.log('✅ Auth state synchronized successfully');
        } else {
            console.log('⚠️ refreshRole: userEmail or currentUser is missing', { userEmail, currentUser });
        }
    };

    useEffect(() => {
        // 초기 세션 확인
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                handleUserChange(session.user);
            } else {
                setLoading(false);
            }
        });

        // 상태 변경 감지
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                handleUserChange(session.user);
            } else {
                setUser(null);
                setEmail(null);
                setRole(null);
                localStorage.removeItem('user_email');
                setLoading(false);
            }
        });

        const handleUserChange = async (supabaseUser: User) => {
            const userEmail = localStorage.getItem('user_email') || supabaseUser.email;
            if (userEmail) {
                const detectedRole = await checkRole(userEmail);
                setRole(detectedRole);
                setEmail(userEmail.toLowerCase());
                await registerUserMapping(supabaseUser.id, userEmail);
            } else {
                setRole('user');
                setEmail(null);
            }
            setUser(supabaseUser);
            setLoading(false);
        };

        return () => subscription.unsubscribe();
    }, []);

    const logout = async () => {
        localStorage.removeItem('user_email');
        localStorage.removeItem('buyer_email');
        await supabase.auth.signOut();
    };

    const value = {
        user,
        email,
        role,
        loading,
        logout,
        refreshRole
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
