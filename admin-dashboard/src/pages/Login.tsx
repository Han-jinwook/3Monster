import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { OtpInput } from '../components/ui/OtpInput';
import { Mail, ChevronRight, AlertTriangle, CheckCircle2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
    const { refreshRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const redirectUrl = searchParams.get('redirect') || '/';

    const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
    const [email, setEmail] = useState(() => localStorage.getItem('remember_email') || '');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpStep, setOtpStep] = useState(1); // 1: Email, 2: OTP
    const [error, setError] = useState('');
    const [infoMessage, setInfoMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const completeLogin = async (userEmail: string) => {
        const emailKey = userEmail.trim().toLowerCase();
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            await supabase.auth.signInAnonymously();
        }

        localStorage.setItem('user_email', emailKey);
        localStorage.setItem('buyer_email', emailKey); 
        localStorage.setItem('remember_email', emailKey);
        
        console.log('🔄 Refreshing authentication role...');
        await refreshRole();
        
        setTimeout(() => {
            console.log(`🚀 Navigating to ${redirectUrl}...`);
            navigate(redirectUrl, { replace: true });
        }, 100);
    };

    const normalizeLoginInput = (raw: string): string => {
        const trimmed = raw.trim().toLowerCase();
        if (trimmed === 'test' || trimmed === 'test1' || trimmed === 'pgtest') {
            return 'test@sundreamer.app';
        }
        return trimmed;
    };

    const handlePasswordLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!email.trim() || !password || loading) return;
        setLoading(true);
        setError('');
        setInfoMessage('');
        try {
            const emailKey = normalizeLoginInput(email);

            // PG 심사 및 공용 테스트 계정 검증
            const isTestAccount = (
                (emailKey === 'test@sundreamer.app' || emailKey === 'pgtest@3monster.net' || emailKey === 'test@3monster.net') && 
                (password === 'test1234!' || password === 'test1234')
            );

            let authSuccess = isTestAccount;

            if (!authSuccess) {
                // Supabase Auth 연동 검증
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: emailKey,
                    password: password
                });
                if (!signInError) {
                    authSuccess = true;
                }
            }

            if (!authSuccess) {
                setError('아이디 또는 비밀번호가 올바르지 않습니다.');
                return;
            }

            await completeLogin(emailKey);
        } catch (err: any) {
            console.error('Password Login Error:', err);
            setError(err.message || '로그인 처리 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async () => {
        if (!email.trim() || loading) return;
        setLoading(true);
        setError('');
        setInfoMessage('');
        try {
            const emailKey = normalizeLoginInput(email);

            // 테스트 계정은 이메일 발송 없이 즉시 통과 모드로 전환
            if (emailKey === 'test@sundreamer.app' || emailKey === 'pgtest@3monster.net') {
                setInfoMessage('심사용 테스트 계정입니다. 인증번호 [ 123456 ]을 입력해 주세요.');
                setOtpStep(2);
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                await supabase.auth.signInAnonymously();
            }

            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
            
            const { error: upsertError } = await supabase
                .from('otps')
                .upsert({ 
                    email: emailKey, 
                    code, 
                    expires_at: expiresAt 
                }, { onConflict: 'email' });

            if (upsertError) throw upsertError;

            // FOR DEVELOPMENT: Log OTP to console
            console.log('-----------------------------------------');
            console.log('🔓 [DEV ONLY] OTP CODE:', code);
            console.log('📧 Target Email:', emailKey);
            console.log('-----------------------------------------');

            const res = await fetch('/api/resend/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: '3Monster <admin@3monster.net>',
                    to: [emailKey],
                    subject: '[3Monster] 로그인 인증번호',
                    html: `
                        <div style="font-family: sans-serif; padding: 40px; color: #334155; line-height: 1.6;">
                            <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; background: white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                                <div style="background: #0f172a; padding: 40px; text-align: center;">
                                    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.025em;">3Monster</h1>
                                </div>
                                <div style="padding: 40px;">
                                    <h2 style="color: #0f172a; margin-top: 0; font-weight: 800; font-size: 20px;">인증번호 안내</h2>
                                    <p>안녕하세요, 3Monster 서비스를 이용해 주셔서 감사합니다.</p>
                                    <p>서비스 접속을 위한 6자리 인증번호를 안내해 드립니다.</p>
                                    
                                    <div style="background: #f8fafc; border-radius: 16px; padding: 32px; margin: 32px 0; text-align: center;">
                                        <div style="font-size: 48px; font-weight: 900; color: #3b82f6; letter-spacing: 0.2em;">${code}</div>
                                        <div style="margin-top: 12px; font-size: 13px; color: #94a3b8; font-weight: 600;">유효시간: 5분</div>
                                    </div>
                                    
                                    <p style="font-size: 14px; color: #64748b;">본인이 요청하지 않은 경우 이 메일을 무시하셔도 됩니다.</p>
                                    <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 32px 0;" />
                                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">본 메일은 발신전용입니다. 관련 문의는 공식 홈페이지를 이용해 주세요.</p>
                                </div>
                            </div>
                        </div>
                    `,
                }),
            });

            if (!res.ok) {
                const contentType = res.headers.get('content-type');
                let errorMessage = '이메일 발송에 실패했습니다.';
                
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await res.json();
                    console.error('Resend API Error details:', errorData);
                    errorMessage = errorData.message || errorMessage;
                    
                    if (res.status === 403) {
                        setError('Resend 샌드박스 모드 제한: 등록된 이메일 또는 도메인만 발송 가능합니다. 개발자 도구(F12) 콘솔에서 인증번호를 확인해주세요!');
                        setOtpStep(2);
                        return;
                    }
                } else {
                    const text = await res.text();
                    console.error('Resend API non-JSON error:', text);
                }
                throw new Error(errorMessage);
            }

            setInfoMessage('인증번호가 메일로 전송되었습니다.');
            setOtpStep(2);
        } catch (err: any) {
            console.error('OTP Error:', err);
            setError(err.message || '인증번호 전송 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError('');
        setInfoMessage('');
        try {
            const emailKey = normalizeLoginInput(email);

            // 테스트 계정 전용 고정 인증번호 통과
            const isTestOtp = (emailKey === 'test@sundreamer.app' || emailKey === 'pgtest@3monster.net') && (otp === '123456' || otp === '000000');

            if (!isTestOtp) {
                const { data: otpData, error: otpError } = await supabase
                    .from('otps')
                    .select('*')
                    .eq('email', emailKey)
                    .maybeSingle();

                if (otpError || !otpData || otpData.code !== otp) {
                    setError('인증번호가 올바르지 않거나 만료되었습니다.');
                    return;
                }

                const expiresAt = new Date(otpData.expires_at);
                if (new Date() > expiresAt) {
                    setError('인증번호가 만료되었습니다. 다시 시도해주세요.');
                    setOtpStep(1);
                    setOtp('');
                    return;
                }
            }

            await completeLogin(emailKey);
        } catch (err: any) {
            setError('로그인 처리 중 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Auto submit when OTP reaches 6 digits
    useEffect(() => {
        if (loginMode === 'otp' && otp.length === 6 && otpStep === 2 && !loading) {
            handleOtpLogin();
        }
    }, [otp, otpStep, loginMode]);

    // Alt + V 키보드 입력 시 브라우저 메뉴 단축키 간섭 방지 및 클립보드 자동 붙여넣기 지원
    useEffect(() => {
        const handleGlobalKeyDown = async (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                navigate(redirectUrl);
                return;
            }

            // Alt + V 또는 Alt 키와 V 키 조합 감지
            if (e.altKey && (e.key === 'v' || e.key === 'V' || e.code === 'KeyV')) {
                e.preventDefault();
                e.stopPropagation();
                try {
                    const text = await navigator.clipboard.readText();
                    if (text && document.activeElement instanceof HTMLInputElement) {
                        const input = document.activeElement;
                        const start = input.selectionStart || 0;
                        const end = input.selectionEnd || 0;
                        const val = input.value;
                        const newVal = val.substring(0, start) + text + val.substring(end);
                        
                        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                        nativeInputValueSetter?.call(input, newVal);
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                } catch (err) {
                    console.warn('Clipboard read error:', err);
                }
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [navigate, redirectUrl]);

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-md p-4 overflow-y-auto"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[460px] relative"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
            >
                <Card className="p-8 md:p-10 shadow-2xl border border-slate-150 bg-white rounded-[2.5rem] relative">
                    {/* Close Button */}
                    <button 
                        type="button"
                        onClick={() => navigate(redirectUrl)}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        aria-label="닫기"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="h-14 w-auto flex items-center justify-center mb-3">
                            <img src="/logo.png" alt="3Monster Logo" className="h-full object-contain" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900">3Monster 로그인</h2>
                        <p className="text-slate-400 font-bold text-xs mt-1">구매 및 라이선스 발급을 위해 로그인해 주세요.</p>
                    </div>

                    {/* Login Mode Tabs */}
                    <div className="flex rounded-2xl bg-slate-100 p-1.5 mb-6">
                        <button
                            type="button"
                            onClick={() => { setLoginMode('password'); setError(''); setInfoMessage(''); }}
                            className={cn(
                                "flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                                loginMode === 'password'
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>아이디 / 비밀번호</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setLoginMode('otp'); setError(''); setInfoMessage(''); }}
                            className={cn(
                                "flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                                loginMode === 'otp'
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            <Mail className="w-3.5 h-3.5" />
                            <span>이메일 인증번호</span>
                        </button>
                    </div>

                    {/* Mode 1: Password Login */}
                    {loginMode === 'password' ? (
                        <form onSubmit={handlePasswordLogin} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">아이디 / 이메일</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="text"
                                    autoComplete="username"
                                    placeholder="이메일 또는 아이디 (예: test 또는 test@sundreamer.app)"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="flex h-12 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 transition-all outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 font-bold placeholder:text-slate-400"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">비밀번호</label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        placeholder="비밀번호를 입력해주세요"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="flex h-12 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 pr-11 py-2 text-sm text-slate-800 transition-all outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 font-bold placeholder:text-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                                        aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="min-h-[10px] space-y-2 pt-1">
                                {infoMessage && (
                                    <div className="flex gap-2 items-start text-xs text-emerald-600 font-bold bg-emerald-50 p-3 rounded-xl">
                                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                                        <p className="leading-relaxed">{infoMessage}</p>
                                    </div>
                                )}

                                {error && (
                                    <div className="flex gap-2 items-start text-xs text-red-500 font-bold bg-red-50 p-3 rounded-xl">
                                        <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                                        <p className="leading-relaxed">{error}</p>
                                    </div>
                                )}
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-12 text-sm font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-md cursor-pointer"
                                isLoading={loading}
                                disabled={!email || !password}
                            >
                                로그인 <ChevronRight className="ml-1.5 w-4 h-4" />
                            </Button>
                        </form>
                    ) : (
                        /* Mode 2: OTP Login */
                        <form onSubmit={handleOtpLogin} className="space-y-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`step-${otpStep}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">이메일 또는 아이디</label>
                                        <input
                                            id="otp-email"
                                            name="email"
                                            type="text"
                                            autoComplete="username"
                                            placeholder="이메일 또는 아이디 (예: test 또는 test@sundreamer.app)"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={otpStep === 2}
                                            className="flex h-12 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 transition-all outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 font-bold placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    
                                    {otpStep === 2 && (
                                        <div className="space-y-2 pt-1">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">인증번호 (6자리)</label>
                                                <button 
                                                    type="button" 
                                                    onClick={() => { setOtpStep(1); setOtp(''); }}
                                                    className="text-[10px] font-black text-indigo-600 hover:underline cursor-pointer"
                                                >
                                                    이메일 변경
                                                </button>
                                            </div>
                                            <OtpInput
                                                value={otp}
                                                onChange={setOtp}
                                                disabled={loading}
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            <div className="min-h-[10px] space-y-2">
                                {infoMessage && (
                                    <div className="flex gap-2 items-start text-xs text-emerald-600 font-bold bg-emerald-50 p-3 rounded-xl">
                                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                                        <p className="leading-relaxed">{infoMessage}</p>
                                    </div>
                                )}

                                {error && (
                                    <div className="flex gap-2 items-start text-xs text-red-500 font-bold bg-red-50 p-3 rounded-xl">
                                        <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                                        <p className="leading-relaxed">{error}</p>
                                    </div>
                                )}
                            </div>

                            {otpStep === 1 ? (
                                <Button 
                                    type="button" 
                                    className="w-full h-12 text-sm font-black bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl shadow-md cursor-pointer" 
                                    onClick={handleSendOTP}
                                    isLoading={loading}
                                    disabled={!email}
                                >
                                    <Mail className="w-4 h-4 mr-2" /> 인증번호 전송
                                </Button>
                            ) : (
                                <Button 
                                    type="submit" 
                                    className="w-full h-12 text-sm font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-md cursor-pointer" 
                                    isLoading={loading}
                                    disabled={otp.length !== 6}
                                >
                                    로그인 <ChevronRight className="ml-1.5 w-4 h-4" />
                                </Button>
                            )}
                        </form>
                    )}
                </Card>
                <p className="text-center mt-6 text-[10px] text-slate-400 font-black tracking-widest uppercase">
                    © 2026 3Monster Platform. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
};

