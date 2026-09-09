import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, supabasePublic } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
    User, 
    Mail, 
    Calendar, 
    LogOut, 
    ShoppingBag, 
    Check, 
    AlertCircle, 
    Shield,
    Sparkles,
    CheckCircle2,
    Copy,
    ChevronDown,
    ChevronUp,
    Clock,
    RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface LicenseItem {
    id: string;
    product_id: string;
    serial_key: string;
    status: 'active' | 'used' | 'unused' | 'expired' | 'blocked';
    expire_date: string;
    created_at: string;
    first_run_date?: string;
    price_sold?: number;
    license_type?: string;
    collection_limit?: number;
    contact?: string;
    buyer_name?: string;
}

export const Profile = () => {
    const navigate = useNavigate();
    const { email: authEmail, role, logout } = useAuth();
    const userEmail = authEmail || localStorage.getItem('user_email') || '';

    const [loading, setLoading] = useState(true);
    const [savingNickname, setSavingNickname] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [toasts, setToasts] = useState<Array<{ id: number; message: string }>>([]);

    // User Profile state
    const [name, setName] = useState('');
    const [initialName, setInitialName] = useState('');
    const [signupDate, setSignupDate] = useState('');
    
    // Notification toggle
    const [notify, setNotify] = useState(() => {
        return localStorage.getItem('notify_enabled') !== 'false';
    });

    // Purchase List state
    const [licenses, setLicenses] = useState<LicenseItem[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());


    const showToast = (message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 2500);
    };

    const toggleGroup = (prodId: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(prodId)) {
                next.delete(prodId);
            } else {
                next.add(prodId);
            }
            return next;
        });
    };

    const fetchProfileData = async () => {
        if (!userEmail) return;
        setLoading(true);
        try {
            // 1. Fetch User details
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('email', userEmail.toLowerCase())
                .maybeSingle();

            if (userError) console.warn("User data fetch warning:", userError);

            let currentUserName = '';
            if (userData) {
                currentUserName = userData.name || '';
                setName(currentUserName);
                setInitialName(currentUserName);
                if (userData.created_at) {
                    const date = new Date(userData.created_at);
                    setSignupDate(`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`);
                }
            }

            // 2. Fetch Licenses details (안전하고 완벽한 다중 매칭 - RLS 세션 영향 없는 supabasePublic 사용)
            const emailClean = userEmail.toLowerCase().trim();
            const emailId = emailClean.split('@')[0].trim();
            const nameClean = currentUserName.toLowerCase().trim();

            const { data: licenseData, error: licenseError } = await supabasePublic
                .from('licenses')
                .select('*')
                .order('created_at', { ascending: false });

            if (licenseError) throw licenseError;

            if (role === 'admin') {
                // 관리자인 경우 전체 표시
                setLicenses((licenseData as LicenseItem[]) || []);
            } else {
                // 구매자/일반유저인 경우 본인 정보와 일치하는 라이선스만 필터링
                const matched = ((licenseData as LicenseItem[]) || []).filter(lic => {
                    const licContact = (lic.contact || '').toLowerCase().trim();
                    const licBuyer = (lic.buyer_name || '').toLowerCase().trim();
                    const licContactId = licContact.split('@')[0].trim();

                    return (
                        (emailClean && licContact === emailClean) ||
                        (emailClean && licBuyer === emailClean) ||
                        (emailId && licBuyer === emailId) ||
                        (emailId && licContactId === emailId) ||
                        (nameClean && licBuyer === nameClean) ||
                        (nameClean && licContact === nameClean)
                    );
                });
                setLicenses(matched);
            }

        } catch (err: any) {
            console.error("Error loading profile details:", err);
            setErrorMessage("프로필 정보를 불러오는 중에 문제가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
        const channel = supabase
            .channel('profile-license-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'licenses' }, fetchProfileData)
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [userEmail, role]);

    // [핵심] 제품(product_id) 단위로 그룹핑 & 최신 활성 라이선스를 Main 대표 카드로 배치
    const groupedLicenses = useMemo(() => {
        const groups = new Map<string, LicenseItem[]>();
        licenses.forEach(lic => {
            const prod = lic.product_id || 'UNKNOWN';
            if (!groups.has(prod)) {
                groups.set(prod, []);
            }
            groups.get(prod)!.push(lic);
        });

        const now = new Date().getTime();
        Array.from(groups.values()).forEach(group => {
            // 정렬 기준:
            // 1순위: 활성 상태 (미만료 & active/used)
            // 2순위: 만료일이 가장 미래인 것
            // 3순위: 생성일 최신순
            group.sort((a, b) => {
                const aExp = a.expire_date ? new Date(a.expire_date).getTime() : 0;
                const bExp = b.expire_date ? new Date(b.expire_date).getTime() : 0;
                const aActive = (a.status === 'active' || a.status === 'used') && aExp >= now ? 1 : 0;
                const bActive = (b.status === 'active' || b.status === 'used') && bExp >= now ? 1 : 0;

                if (aActive !== bActive) return bActive - aActive;
                if (aExp !== bExp) return bExp - aExp;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
        });

        return Array.from(groups.entries()).map(([productId, group]) => ({
            productId,
            main: group[0],
            history: group.slice(1)
        }));
    }, [licenses]);

    const handleSaveNickname = async () => {
        if (!userEmail || name.trim() === initialName) return;
        setSavingNickname(true);
        setErrorMessage('');
        setSuccessMessage('');
        try {
            const { error: updateError } = await supabase
                .from('users')
                .upsert({
                    email: userEmail.toLowerCase(),
                    name: name.trim()
                }, { onConflict: 'email' });

            if (updateError) throw updateError;

            setInitialName(name.trim());
            setSuccessMessage("크몽 ID가 성공적으로 변경되었습니다.");
            setTimeout(() => setSuccessMessage(''), 2000);
            fetchProfileData();
        } catch (err: any) {
            console.error("Error saving nickname:", err);
            setErrorMessage("저장 중 에러가 발생했습니다: " + err.message);
        } finally {
            setSavingNickname(false);
        }
    };

    const handleCopySerial = (serial: string) => {
        navigator.clipboard.writeText(serial).then(() => showToast(`시리얼 번호가 복사되었습니다: ${serial}`));
    };

    const getPlanLabel = (_productId: string, licenseType?: string, collectionLimit?: number) => {
        if (collectionLimit && collectionLimit > 0) {
            return {
                name: 'STANDARD',
                detail: `1개월 / ${collectionLimit.toLocaleString()}건 제한`,
                badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200'
            };
        }
        const t = (licenseType || '').toUpperCase();
        if (t === 'PREMIUM' || t === '3M') {
            return {
                name: 'PREMIUM',
                detail: '3개월 / 무제한',
                badgeColor: 'text-purple-700 bg-purple-50 border-purple-200'
            };
        }
        if (t === '6M') {
            return {
                name: '6M',
                detail: '6개월 / 무제한',
                badgeColor: 'text-sky-700 bg-sky-50 border-sky-200'
            };
        }
        if (t === 'LIFETIME') {
            return {
                name: 'LIFETIME',
                detail: '영구 / 무제한',
                badgeColor: 'text-amber-700 bg-amber-50 border-amber-200'
            };
        }
        return {
            name: 'DELUXE',
            detail: '1개월 / 무제한',
            badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200'
        };
    };

    const getStatusBadge = (status: string, expireDateStr?: string) => {
        const expireDate = expireDateStr ? new Date(expireDateStr) : null;
        const now = new Date();

        if (status === 'blocked') {
            return (
                <span className="px-2.5 py-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-full flex items-center gap-1 w-fit">
                    <AlertCircle className="w-3 h-3" /> 차단됨
                </span>
            );
        }
        if (expireDate && expireDate < now) {
            return (
                <span className="px-2.5 py-1 text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-full flex items-center gap-1 w-fit">
                    종료 (만료)
                </span>
            );
        }
        if (expireDate && (status === 'active' || status === 'used')) {
            const daysLeft = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 7) {
                return (
                    <span className="px-2.5 py-1 text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded-full flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3" /> 만료 예정 (D-{daysLeft}일)
                    </span>
                );
            }
        }
        switch (status) {
            case 'active':
            case 'used':
                return (
                    <span className="px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-full flex items-center gap-1 w-fit">
                        <Check className="w-3 h-3" /> 유지 (사용중)
                    </span>
                );
            case 'unused':
                return (
                    <span className="px-2.5 py-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full flex items-center gap-1 w-fit">
                        대기 (미사용)
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-full flex items-center gap-1 w-fit">
                        종료 (만료)
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="w-full min-h-[70vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold text-xs">프로필 및 구매 정보를 불러오고 있습니다...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-transparent py-12 px-6 min-h-screen">
            {/* Toast Notifications */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className="px-4 py-2 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-bold whitespace-nowrap animate-in slide-in-from-top-2 fade-in duration-200">
                        {t.message}
                    </div>
                ))}
            </div>

            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header title */}
                <div className="flex justify-between items-center flex-wrap gap-4 mb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                마이페이지 & 설정 <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                            </h1>
                            <p className="text-xs text-slate-400 font-bold">3Monster 서비스 이용 현황 및 계정 프로필 관리</p>
                        </div>
                    </div>

                    {/* Refresh Button */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchProfileData()}
                            className="h-9 px-3 text-xs font-bold text-slate-600 border-slate-300 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 shadow-sm"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> 새로고침
                        </Button>
                    </div>
                </div>

                {/* Status messages */}
                {successMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 bg-emerald-50 text-emerald-700 border border-emerald-100 p-4 rounded-2xl"
                    >
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <p className="text-xs font-bold">{successMessage}</p>
                    </motion.div>
                )}
                {errorMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 bg-rose-50 text-rose-600 border border-rose-100 p-4 rounded-2xl"
                    >
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                        <p className="text-xs font-bold">{errorMessage}</p>
                    </motion.div>
                )}

                {/* Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Column: Purchase list (7/12) */}
                    <div className="lg:col-span-7 space-y-4">
                        <Card className="p-0 overflow-hidden bg-white border border-slate-200 shadow-[0_15px_45px_rgba(0,0,0,0.07)] rounded-2xl">
                            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5 text-indigo-400" />
                                    <h3 className="text-sm font-black text-white">보유 라이선스 & 구매 리스트 ({groupedLicenses.length}개 제품)</h3>
                                </div>
                            </div>

                            <div className="p-6">
                                {groupedLicenses.length === 0 ? (
                                    <div className="text-center py-16 space-y-3">
                                        <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-200">
                                            <ShoppingBag className="w-5 h-5" />
                                        </div>
                                        <p className="text-xs text-slate-400 font-bold">등록된 구매 내역이 없습니다.</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate('/showroom')}
                                            className="text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50 font-bold rounded-xl"
                                        >
                                            <ShoppingBag className="w-3.5 h-3.5 mr-1" /> 제품 둘러보기
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        {groupedLicenses.map(({ productId, main, history }) => {
                                            const isExpanded = expandedGroups.has(productId);
                                            const plan = getPlanLabel(productId, main.license_type, main.collection_limit);
                                            const statusBadge = getStatusBadge(main.status, main.expire_date);
                                            const createdDateStr = main.created_at ? format(new Date(main.created_at), 'yyyy.MM.dd') : '-';
                                            const expireDateStr = main.expire_date ? format(new Date(main.expire_date), 'yyyy.MM.dd') : '무제한';
                                            
                                            return (
                                                <div 
                                                    key={productId} 
                                                    className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl overflow-hidden shadow-sm transition-all duration-200 text-left"
                                                >
                                                    {/* Main 대표 카드 (현재 활성/최신 플랜) */}
                                                    <div className="p-5 space-y-3.5 bg-slate-50/40">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="text-xs font-black text-slate-900 bg-white border border-slate-300 px-2.5 py-0.5 rounded-lg shadow-xs">
                                                                        {productId}
                                                                    </span>
                                                                    <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-md border", plan.badgeColor)}>
                                                                        {plan.name} ({plan.detail})
                                                                    </span>
                                                                </div>
                                                                
                                                                {/* Serial key with 1-click copy */}
                                                                <div className="flex items-center gap-1.5 pt-1">
                                                                    <span className="text-[11px] font-bold text-slate-500">시리얼:</span>
                                                                    <code className="bg-white px-2 py-0.5 rounded-md text-xs font-mono font-bold text-indigo-950 border border-slate-200">
                                                                        {main.serial_key}
                                                                    </code>
                                                                    <button
                                                                        onClick={() => handleCopySerial(main.serial_key)}
                                                                        className="p-1 hover:bg-slate-200 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                                                                        title="시리얼 복사"
                                                                    >
                                                                        <Copy className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            {statusBadge}
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4 text-[11px] pt-3 border-t border-slate-200/80">
                                                            <div>
                                                                <span className="block text-slate-400 font-bold text-[10px]">구매/발급 일시</span>
                                                                <span className="font-extrabold text-slate-700">{createdDateStr}</span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-slate-400 font-bold text-[10px]">만료 일시</span>
                                                                <span className="font-extrabold text-slate-700">{expireDateStr}</span>
                                                            </div>
                                                        </div>

                                                        {/* Accordion Toggle (이전 이력이 있을 때만 노출) */}
                                                        {history.length > 0 && (
                                                            <div className="pt-2">
                                                                <button
                                                                    onClick={() => toggleGroup(productId)}
                                                                    className={cn(
                                                                        "w-full flex items-center justify-between text-[11px] font-black px-3 py-1.5 rounded-xl border transition-all cursor-pointer",
                                                                        isExpanded 
                                                                            ? "bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700" 
                                                                            : "bg-indigo-50/80 text-indigo-700 border-indigo-200/80 hover:bg-indigo-100"
                                                                    )}
                                                                >
                                                                    <span className="flex items-center gap-1.5">
                                                                        <span>과거 구매 / 연장 히스토리 ({history.length}건)</span>
                                                                    </span>
                                                                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Accordion Sub-Rows: 과거 이력 목록 */}
                                                    {isExpanded && history.length > 0 && (
                                                        <div className="divide-y divide-slate-100 bg-slate-100/60 p-3 space-y-2">
                                                            {history.map((histLic, hIdx) => {
                                                                const histPlan = getPlanLabel(productId, histLic.license_type, histLic.collection_limit);
                                                                const histCreated = histLic.created_at ? format(new Date(histLic.created_at), 'yyyy.MM.dd') : '-';
                                                                const histExpire = histLic.expire_date ? format(new Date(histLic.expire_date), 'yyyy.MM.dd') : '-';
                                                                const histBadge = getStatusBadge(histLic.status, histLic.expire_date);

                                                                return (
                                                                    <div key={histLic.id} className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-2 text-xs">
                                                                        <div className="flex justify-between items-center">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-[10px] font-mono text-slate-400">↳ {hIdx + 1}</span>
                                                                                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">과거 이력</span>
                                                                                <span className="font-extrabold text-slate-700">{histPlan.name} ({histPlan.detail})</span>
                                                                            </div>
                                                                            {histBadge}
                                                                        </div>

                                                                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                                                                            <div className="flex items-center gap-1">
                                                                                <code className="bg-slate-50 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-600 border border-slate-200">
                                                                                    {histLic.serial_key}
                                                                                </code>
                                                                                <button
                                                                                    onClick={() => handleCopySerial(histLic.serial_key)}
                                                                                    className="p-1 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded"
                                                                                    title="시리얼 복사"
                                                                                >
                                                                                    <Copy className="w-3 h-3" />
                                                                                </button>
                                                                            </div>
                                                                            <div className="text-[10px] text-slate-400 font-medium">
                                                                                {histCreated} ~ {histExpire}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Settings / Profile / Logout (5/12) */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="space-y-4">
                            <Card className="p-0 overflow-hidden bg-white border border-slate-200 shadow-[0_15px_45px_rgba(0,0,0,0.07)] rounded-2xl">
                                <div className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white mb-6">
                                    <Shield className="w-5 h-5 text-indigo-400" />
                                    <h3 className="text-sm font-black text-white">계정 설정 & 관리</h3>
                                </div>
                                <div className="p-6 pt-0 space-y-6">
                                    
                                    {/* 1. Account details */}
                                    <div className="space-y-4 text-left">
                                        <div className="flex items-center gap-2 pb-2 border-b border-slate-250">
                                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">계정 프로필 정보</h4>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-250 space-y-2">
                                                <div className="flex items-center gap-2 text-[10px] text-slate-450 font-bold uppercase">
                                                    <Mail className="w-3.5 h-3.5" /> 이메일 주소 / ID
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-800 font-black">{userEmail}</span>
                                                    <span className="text-[10px] text-slate-400 mt-0.5">ID: {userEmail.split('@')[0]}</span>
                                                </div>
                                            </div>

                                            {signupDate && (
                                                <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-250 space-y-1">
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-450 font-bold uppercase">
                                                        <Calendar className="w-3.5 h-3.5" /> 가입 일자
                                                    </div>
                                                    <span className="text-xs text-slate-700 font-bold">{signupDate}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 2. Secondary Auth Info */}
                                    <div className="space-y-3.5 text-left">
                                        <div className="flex items-center gap-2 pb-2 border-b border-slate-250">
                                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">크몽 ID (구매자 인증 정보)</h4>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 pl-0.5">크몽 구매자 ID</label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="text"
                                                    value={name}
                                                    onChange={e => setName(e.target.value)}
                                                    placeholder="크몽 ID를 입력해 주세요"
                                                    className="h-10 bg-slate-50 border border-slate-350 hover:border-slate-400 focus:border-indigo-500 focus-visible:bg-white rounded-lg text-xs flex-1 focus-visible:ring-indigo-100"
                                                />
                                                <Button 
                                                    type="button"
                                                    onClick={handleSaveNickname}
                                                    disabled={name.trim() === initialName || savingNickname}
                                                    className="h-10 px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-450 transition-all shrink-0 border-none"
                                                >
                                                    {savingNickname ? '저장중' : '저장'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Notifications settings */}
                                    <div className="space-y-4 text-left">
                                        <div className="flex items-center gap-2 pb-2 border-b border-slate-250">
                                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">알림 설정</h4>
                                        </div>
                                        <div className="flex items-center justify-between py-1">
                                            <span className="text-xs text-slate-655 font-bold pl-0.5">이메일 알림 및 서비스 소식 수신</span>
                                            <label className="relative inline-flex items-center cursor-pointer select-none">
                                                <input 
                                                    type="checkbox" 
                                                    checked={notify}
                                                    onChange={e => {
                                                        const val = e.target.checked;
                                                        setNotify(val);
                                                        localStorage.setItem('notify_enabled', String(val));
                                                    }}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* 4. Logout (Bottom Right aligned) */}
                                    <div className="pt-4 border-t border-slate-200 flex justify-end">
                                        <Button 
                                            type="button"
                                            variant="outline"
                                            onClick={logout}
                                            className="h-9 px-4 text-[11px] font-bold border border-slate-300 hover:border-rose-300 text-slate-600 hover:text-rose-600 hover:bg-rose-50/30 rounded-lg flex items-center gap-1.5 transition-all shadow-sm bg-white"
                                        >
                                            <LogOut className="w-3.5 h-3.5" /> 로그아웃
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
