import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { 
    Key, 
    Users as UsersIcon,
    XCircle,
    Award,
    Calendar,
    BarChart3,
    Loader2,
    ShoppingBag,
    ExternalLink,
    ShieldCheck,
    Sparkles,
    Copy,
    Check,
    Send,
    ChevronDown,
    ChevronUp,
    ArrowRight,
    HelpCircle,
    FileText,
    CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface License {
    id: string;
    serial_key: string;
    product_id: string;
    buyer_name: string;
    status: 'active' | 'used' | 'unused' | 'expired' | 'blocked';
    expire_date: string;
    created_at: string;
    contact?: string;
    license_type?: string;
    price_sold?: number;
}

interface AppUser {
    id: string;
    uid?: string;
    email: string;
    name?: string;
    role?: string;
    channel?: string;
    created_at?: string;
}

export const Dashboard = () => {
    const [allLicenses, setAllLicenses] = useState<License[]>([]);
    const [allUsers, setAllUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);

    const [statPeriod, setStatPeriod] = useState<'daily' | 'monthly'>('daily');
    const [copiedTemplate, setCopiedTemplate] = useState(false);
    const [showGuideDetails, setShowGuideDetails] = useState(true);

    const kmongMessageTemplate = `안녕하세요, 고객님! [3Monster] 네이버 플레이스 DB 정밀 추출기를 구매해 주셔서 진심으로 감사드립니다.

고객님의 정품 라이선스 키와 프로그램 다운로드 안내드립니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 [정품 라이선스 키]
{발급받은_라이선스_키를_여기에_붙여넣으세요}

📥 [프로그램 다운로드]
https://github.com/Han-jinwook/n-place-db/releases/latest/download/NPlace-DB-Pro.zip
(공식 웹사이트: https://sundreamer.app)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 [초간단 3초 사용 가이드]
1. 다운로드 받은 ZIP 파일의 압축을 완전히 해제합니다.
2. 폴더 내 [NPlace_DB_Launcher.exe]를 실행합니다.
3. 위 정품 라이선스 키를 입력 후 [인증하기]를 클릭하시면 즉시 활성화됩니다.
(첫 인증 시 고객님의 PC에 1:1 자동 등록되어 안전하게 보호됩니다.)

궁금하신 점이나 사용 중 도움이 필요하시면 크몽 메시지 또는 프로그램 내 [1:1 기술지원]으로 언제든 편하게 문의주세요.
감사합니다!`;

    const handleCopyTemplate = () => {
        navigator.clipboard.writeText(kmongMessageTemplate);
        setCopiedTemplate(true);
        setTimeout(() => setCopiedTemplate(false), 2500);
    };

    const fetchDashboardData = async () => {
        try {
            // Fetch Users
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });
            if (usersError) throw usersError;
            setAllUsers(usersData || []);

            // Fetch Licenses
            const { data: licensesData, error: licensesError } = await supabase
                .from('licenses')
                .select('*')
                .order('created_at', { ascending: false });
            if (licensesError) throw licensesError;
            setAllLicenses(licensesData || []);

        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        // Realtime Subscriptions
        const channel = supabase
            .channel('dashboard-realtime-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'licenses' }, () => fetchDashboardData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => fetchDashboardData())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // 1. Calculate general stats
    const totalUsers = allUsers.length;
    const totalLicenses = allLicenses.length;

    // Upgraded/Loyal users (contacts with 2 or more licenses)
    const uniqueContacts = Array.from(new Set(allLicenses.map(l => l.contact?.toLowerCase()).filter(Boolean)));
    const upgradeCount = uniqueContacts.filter(email => {
        const userLicenses = allLicenses.filter(l => l.contact?.toLowerCase() === email);
        return userLicenses.length >= 2;
    }).length;

    // Stopped users (contacts who purchased in past but none is currently active/valid)
    const now = new Date();
    const stoppedCount = uniqueContacts.filter(email => {
        const userLicenses = allLicenses.filter(l => l.contact?.toLowerCase() === email);
        const hasActive = userLicenses.some(l => {
            const expireDate = l.expire_date ? new Date(l.expire_date) : null;
            const isExpired = expireDate && expireDate < now;
            return (l.status === 'active' || l.status === 'used') && !isExpired;
        });
        return !hasActive;
    }).length;

    // Product Normalizer for aggregation
    const normalizeProduct = (productId: string) => {
        if (!productId) return '기타 도구';
        const lower = productId.toLowerCase();
        if (lower === 'placedb' || lower === 'nplace-db' || lower === 'nplace_db') {
            return 'NPlace-DB';
        }
        if (lower === 'cafecrawler' || lower === 'cafe-crawler' || lower === 'cafe_crawler') {
            return '카페 크롤러';
        }
        if (lower === 'contentcrawler' || lower === 'content-crawler' || lower === 'content_crawler') {
            return '사이트 콘텐츠 크롤러';
        }
        if (lower === 'usermanager' || lower === 'user-manager' || lower === 'user_manager') {
            return '회원관리 확장팩';
        }
        if (lower === 'commentstats' || lower === 'comment-stats' || lower === 'comment_stats') {
            return '댓글 수집 통계';
        }
        if (lower === 'eventstats' || lower === 'event-stats' || lower === 'event_stats') {
            return '이벤트 활동 통계';
        }
        return productId;
    };

    // 2. Aggregate counts & sales by product and package (license_type)
    const getProductPackageStats = () => {
        const stats: { [product: string]: { [pkg: string]: { count: number; sales: number } } } = {};
        
        allLicenses.forEach(lic => {
            const prod = normalizeProduct(lic.product_id);
            const pkg = lic.license_type || '기타';
            
            if (!stats[prod]) {
                stats[prod] = {};
            }
            if (!stats[prod][pkg]) {
                stats[prod][pkg] = { count: 0, sales: 0 };
            }
            
            stats[prod][pkg].count += 1;
            stats[prod][pkg].sales += lic.price_sold || 0;
        });

        const rows: { product: string; pkg: string; count: number; sales: number }[] = [];
        Object.keys(stats).forEach(prod => {
            Object.keys(stats[prod]).forEach(pkg => {
                rows.push({
                    product: prod,
                    pkg,
                    count: stats[prod][pkg].count,
                    sales: stats[prod][pkg].sales
                });
            });
        });

        // Sort: NPLace_DB first, then by package length/descending
        return rows.sort((a, b) => a.product.localeCompare(b.product) || b.pkg.localeCompare(a.pkg));
    };

    // 3. Period-based statistics (Daily/Monthly)
    const getDailyStats = () => {
        const daily: { [dateStr: string]: { count: number; sales: number } } = {};
        
        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
            daily[dateStr] = { count: 0, sales: 0 };
        }

        allLicenses.forEach(lic => {
            if (!lic.created_at) return;
            const licDate = new Date(lic.created_at);
            const dateStr = licDate.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
            if (daily[dateStr] !== undefined) {
                daily[dateStr].count += 1;
                daily[dateStr].sales += lic.price_sold || 0;
            }
        });

        return Object.entries(daily).map(([date, data]) => ({ label: date, ...data }));
    };

    const getMonthlyStats = () => {
        const monthly: { [monthStr: string]: { count: number; sales: number } } = {};
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthStr = d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit' });
            monthly[monthStr] = { count: 0, sales: 0 };
        }

        allLicenses.forEach(lic => {
            if (!lic.created_at) return;
            const licDate = new Date(lic.created_at);
            const monthStr = licDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit' });
            if (monthly[monthStr] !== undefined) {
                monthly[monthStr].count += 1;
                monthly[monthStr].sales += lic.price_sold || 0;
            }
        });

        return Object.entries(monthly).map(([month, data]) => ({ label: month, ...data }));
    };

    const periodData = statPeriod === 'daily' ? getDailyStats() : getMonthlyStats();
    const maxPeriodSales = Math.max(...periodData.map(d => d.sales || 1));

    // 4. Calculate Stats

    const productPackageRows = getProductPackageStats();

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">관리자 대시보드</h1>
                    <p className="text-xs text-slate-400 font-bold">서비스 이용 현황 및 통합 매출 통계 보드입니다.</p>
                </div>
            </div>

            {/* 크몽(Kmong) 주문 대응 & 라이선스 발급 통합 실무 가이드 */}
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-indigo-500/5 border-2 border-amber-300/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                {/* 상단 헤더 & 액션 버튼군 */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-amber-200/80 pb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="p-2 bg-gradient-to-tr from-amber-600 to-amber-500 text-white rounded-xl shadow-xs">
                                <ShoppingBag className="w-5 h-5" />
                            </span>
                            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 flex-wrap">
                                크몽(Kmong) 공식 승인 상품 운영 & 라이선스 발급 가이드
                                <span className="text-[11px] px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold rounded-full border border-emerald-300">
                                    ● 서비스 승인 노출중
                                </span>
                            </h2>
                        </div>
                        <p className="text-xs font-semibold text-slate-600 pl-1">
                            대상 상품: <strong className="text-indigo-900">네이버 플레이스 지도 DB 수집기 Pro (#804764)</strong> · 주문 인입 시 즉시 아래 순서대로 처리하세요.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <Link 
                            to="/admin/generator?channel=크몽&product=NPlace-DB"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Key className="w-3.5 h-3.5" />
                            <span>크몽 주문 수동키 발급하기</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <a 
                            href="https://kmong.com/gig/804764" 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-xs transition-colors"
                        >
                            <span>크몽 상품페이지</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                        <button
                            type="button"
                            onClick={() => setShowGuideDetails(!showGuideDetails)}
                            className="inline-flex items-center gap-1 px-2.5 py-2 bg-white/70 hover:bg-white text-slate-600 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
                        >
                            {showGuideDetails ? (
                                <><span>가이드 접기</span><ChevronUp className="w-3.5 h-3.5" /></>
                            ) : (
                                <><span>상세 펼치기</span><ChevronDown className="w-3.5 h-3.5" /></>
                            )}
                        </button>
                    </div>
                </div>

                {showGuideDetails && (
                    <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                        {/* 4단계 실무 처리 워크플로우 그리드 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                            {/* STEP 1 */}
                            <div className="bg-white border border-slate-200/90 p-4 rounded-xl space-y-2 shadow-xs flex flex-col justify-between">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-indigo-600 font-black text-xs">
                                        <ShieldCheck className="w-4 h-4" />
                                        <span>STEP 1. 고객 이메일 수령</span>
                                    </div>
                                    <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                                        크몽 채팅으로 고객에게 <strong className="text-indigo-900 bg-indigo-50 px-1 py-0.5 rounded">실제 이메일 주소</strong>를 요청해 받습니다.
                                    </p>
                                </div>
                                <div className="p-2 bg-indigo-50/70 border border-indigo-100 rounded-lg text-[10px] text-indigo-800 font-semibold leading-tight mt-2">
                                    💡 이메일 등록 시 추후 자사몰(sundreamer.app) 로그인 때 라이선스가 자동 연동되어 재구독(LTV) 유치에 결정적입니다.
                                </div>
                            </div>

                            {/* STEP 2 */}
                            <div className="bg-white border border-slate-200/90 p-4 rounded-xl space-y-2 shadow-xs flex flex-col justify-between">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-amber-600 font-black text-xs">
                                        <Sparkles className="w-4 h-4" />
                                        <span>STEP 2. 옵션별 플랜 매핑</span>
                                    </div>
                                    <div className="space-y-1 text-[11px] text-slate-700 font-medium">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                                            <span className="font-bold text-slate-800">🥉 STANDARD (5천원)</span>
                                            <span className="font-mono text-indigo-600 font-black">START_1M</span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 pl-1">↳ 1,000건 추출 맛보기 (30일)</div>
                                        
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-1 pt-1">
                                            <span className="font-bold text-amber-700">🥈 DELUXE (9천원)</span>
                                            <span className="font-mono text-amber-600 font-black">PLUS_1M</span>
                                        </div>
                                        <div className="text-[10px] text-amber-600 font-bold pl-1">↳ 🔥 무제한 추출 (30일 / 추천)</div>

                                        <div className="flex items-center justify-between pt-1">
                                            <span className="font-bold text-purple-700">🥇 PREMIUM (2.1만원)</span>
                                            <span className="font-mono text-purple-600 font-black">PRO_1M</span>
                                        </div>
                                        <div className="text-[10px] text-purple-600 font-bold pl-1">↳ 👑 3개월 무제한 특가 (90일)</div>
                                    </div>
                                </div>
                            </div>

                            {/* STEP 3 */}
                            <div className="bg-white border border-slate-200/90 p-4 rounded-xl space-y-2 shadow-xs flex flex-col justify-between">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-emerald-600 font-black text-xs">
                                        <Key className="w-4 h-4" />
                                        <span>STEP 3. 수동키 즉시 발급</span>
                                    </div>
                                    <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                                        <strong>[수동 키 발급]</strong> 메뉴에서 발급:
                                    </p>
                                    <ul className="text-[10px] text-slate-600 space-y-1 list-disc pl-3.5 font-medium">
                                        <li>가입/판매 채널: <strong>크몽</strong> 선택</li>
                                        <li>구매자 ID: 고객 크몽 닉네임</li>
                                        <li>이메일: 고객 실제 이메일</li>
                                        <li>단가(5천/9천/2.1만) 자동 설정 확인</li>
                                    </ul>
                                </div>
                                <Link
                                    to="/admin/generator?channel=크몽&product=NPlace-DB"
                                    className="w-full mt-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-center font-bold text-[11px] transition-colors inline-block"
                                >
                                    수동 발급창 바로가기 →
                                </Link>
                            </div>

                            {/* STEP 4 */}
                            <div className="bg-white border border-slate-200/90 p-4 rounded-xl space-y-2 shadow-xs flex flex-col justify-between">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-blue-600 font-black text-xs">
                                        <Send className="w-4 h-4" />
                                        <span>STEP 4. 크몽 작업물 발송</span>
                                    </div>
                                    <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                                        발급된 시리얼 키를 복사하여 아래 <strong>[작업물 발송 템플릿]</strong>의 키 자리에 넣고, 크몽 거래창에 붙여넣어 전송합니다.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCopyTemplate}
                                    className="w-full mt-2 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-center font-bold text-[11px] transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                                >
                                    {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copiedTemplate ? '템플릿 복사 완료!' : '발송 템플릿 복사'}</span>
                                </button>
                            </div>
                        </div>

                        {/* 크몽 작업물 발송 메시지 템플릿 카드 */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-1.5">
                                    <FileText className="w-4 h-4 text-indigo-600" />
                                    <span className="text-xs font-black text-slate-800">크몽 구매자 전달용 표준 메시지 템플릿 (원클릭 복사)</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCopyTemplate}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-indigo-600 text-white text-[11px] font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
                                >
                                    {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copiedTemplate ? '클립보드에 복사됨!' : '메시지 템플릿 전체 복사'}</span>
                                </button>
                            </div>
                            <pre className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] font-mono text-slate-700 whitespace-pre-wrap leading-relaxed select-all">
                                {kmongMessageTemplate}
                            </pre>
                        </div>

                        {/* 실무 꿀팁 & FAQ 바 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 flex items-start gap-2.5">
                                <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                                <div className="text-[11px] text-amber-900 leading-snug">
                                    <strong className="block text-amber-950 font-bold mb-0.5">고객이 PC를 변경/포맷했다고 재인증을 요청할 때</strong>
                                    [구매자 관리] 목록에서 해당 구매자를 검색한 후 <strong>[기기 바인딩 초기화(HWID Reset)]</strong> 버튼을 클릭해주시면 새 PC에서 즉시 다시 인증됩니다.
                                </div>
                            </div>
                            <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-3 flex items-start gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                                <div className="text-[11px] text-blue-900 leading-snug">
                                    <strong className="block text-blue-950 font-bold mb-0.5">키 체계 및 라이선스 작동 안내</strong>
                                    자사몰 직결제든 크몽 수동 발급이든 프로그램 동작 방식은 100% 동일합니다. 고객이 프로그램을 켜고 키를 입력하면 서버가 자동으로 권한을 검증합니다.
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* General Stats KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card className="p-4 flex items-center gap-4 bg-white border border-slate-200 shadow-[0_15px_45px_rgba(0,0,0,0.07)] hover:shadow-lg transition-shadow">
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
                        <UsersIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">앱 가입 고객</p>
                        <h3 className="text-xl font-black text-slate-800 mt-0.5">{totalUsers}명</h3>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 bg-white border border-slate-200 shadow-[0_15px_45px_rgba(0,0,0,0.07)] hover:shadow-lg transition-shadow">
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600 shrink-0">
                        <Key className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">발행 라이선스 수</p>
                        <h3 className="text-xl font-black text-slate-800 mt-0.5">{totalLicenses}개</h3>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 bg-white border border-slate-200 shadow-[0_15px_45px_rgba(0,0,0,0.07)] hover:shadow-lg transition-shadow">
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 shrink-0">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">업그레이드/재구매</p>
                        <h3 className="text-xl font-black text-slate-800 mt-0.5">{upgradeCount}명</h3>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 bg-white border border-slate-200 shadow-[0_15px_45px_rgba(0,0,0,0.07)] hover:shadow-lg transition-shadow">
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-rose-50 text-rose-600 shrink-0">
                        <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">이용 중단 고객</p>
                        <h3 className="text-xl font-black text-slate-800 mt-0.5">{stoppedCount}명</h3>
                    </div>
                </Card>
            </div>

            {/* Split Content Columns */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
                
                {/* Left Column (8 Units) */}
                <div className="xl:col-span-8 space-y-6">
                    
                    {/* Product & Package Sales Summary Card */}
                    <Card className="p-5 bg-white border border-slate-300 shadow-[0_15px_45px_rgba(0,0,0,0.08)] rounded-2xl space-y-4">
                        <div className="flex items-center gap-2.5">
                            <BarChart3 className="w-4.5 h-4.5 text-indigo-650" />
                            <h3 className="text-base font-black text-slate-800">제품 및 패키지별 발행/판매 현황</h3>
                        </div>
                        <div className="overflow-x-auto border border-slate-400 rounded-xl shadow-sm">
                            <table className="w-full text-left border-collapse min-w-[500px]">
                                <thead className="bg-slate-900 text-white">
                                    <tr className="text-sm font-black uppercase tracking-wider text-left whitespace-nowrap">
                                        <th className="px-4 py-3 text-slate-200">제품군</th>
                                        <th className="px-4 py-3 text-slate-200">패키지</th>
                                        <th className="px-4 py-3 text-slate-200">발행 건수</th>
                                        <th className="px-4 py-3 text-right text-slate-200">총 판매액</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-300 text-xs font-semibold whitespace-nowrap">
                                    {productPackageRows.length > 0 ? (
                                        productPackageRows.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                                <td className="px-4 py-1 font-black text-slate-700">{row.product}</td>
                                                <td className="px-4 py-1 text-slate-500">
                                                    <span className="px-2 py-0.5 text-[9px] font-black rounded bg-indigo-50 text-indigo-700 border border-indigo-100/50">
                                                        {row.pkg === 'START_1M' ? '스타트 1M (1,000건)' :
                                                         row.pkg === 'START_1Y' ? '스타트 1Y (12,000건)' :
                                                         row.pkg === 'PLUS_1M' ? '플러스 1M (무제한)' :
                                                         row.pkg === 'PLUS_1Y' ? '플러스 1Y (무제한)' :
                                                         row.pkg === 'PRO_1M' ? '프로 3M (3개월 무제한)' :
                                                         row.pkg === 'PRO_1Y' ? '프로 1Y (무제한)' :
                                                         row.pkg === 'DELUXE' ? '스타트 (1개월 / 1,000건)' : 
                                                         row.pkg === 'TRIAL' ? '체험판 (기한없음 / 100건)' : 
                                                         row.pkg === 'TEST' ? '테스트 (기한없음 / 50건)' :
                                                         row.pkg === '1M' ? '플러스 (1개월 / 무제한)' : 
                                                         row.pkg === '3M' ? '프로 (3개월 특가 / 무제한)' : 
                                                         row.pkg === '6M' ? '6개월' : 
                                                         row.pkg === '1Y' ? '연간 (1년)' : row.pkg}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-600 font-bold">{row.count}건</td>
                                                <td className="px-4 py-2.5 text-right text-indigo-600 font-black">{row.sales.toLocaleString()}원</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-bold">집계 데이터가 존재하지 않습니다.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>


                </div>

                {/* Right Column (4 Units) */}
                <div className="xl:col-span-4 space-y-6">
                    
                    {/* Period Sales Statistics Card */}
                    <Card className="p-5 bg-white border border-slate-200 shadow-[0_15px_45px_rgba(0,0,0,0.07)] rounded-2xl space-y-4">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2.5">
                                <Calendar className="w-4.5 h-4.5 text-indigo-650" />
                                <h3 className="text-base font-black text-slate-800">기간별 발행/판매 통계</h3>
                            </div>
                            
                            {/* Toggle switcher */}
                            <div className="flex bg-slate-200/80 p-0.5 rounded-lg w-fit border border-slate-300">
                                <button
                                    onClick={() => setStatPeriod('daily')}
                                    className={cn(
                                        "px-3 py-1.5 text-[11px] font-black rounded-md transition-all border-none cursor-pointer",
                                        statPeriod === 'daily' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                                    )}
                                >
                                    일별 (최근 7일)
                                </button>
                                <button
                                    onClick={() => setStatPeriod('monthly')}
                                    className={cn(
                                        "px-3 py-1.5 text-[11px] font-black rounded-md transition-all border-none cursor-pointer",
                                        statPeriod === 'monthly' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                                    )}
                                >
                                    월별 (최근 6개월)
                                </button>
                            </div>
                        </div>

                        {/* Period List with beautiful progress bar visual */}
                        <div className="space-y-3">
                            {periodData.map((item: any, idx: number) => {
                                const percentage = maxPeriodSales > 0 ? (item.sales / maxPeriodSales) * 100 : 0;
                                return (
                                    <div key={idx} className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-600">
                                            <span>{item.label}</span>
                                            <span className="text-indigo-650 font-black">
                                                {item.sales.toLocaleString()}원 <span className="text-[9px] text-slate-400 font-bold">({item.count}건)</span>
                                            </span>
                                        </div>
                                        {/* Progress Bar Container */}
                                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-gradient-to-r from-indigo-500 to-indigo-700 h-full rounded-full transition-all duration-500" 
                                                style={{ width: `${Math.max(3, percentage)}%` }} 
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </div>


        </div>
    );
};
