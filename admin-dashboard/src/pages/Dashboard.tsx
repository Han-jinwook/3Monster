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
    Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';

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
            <div className="flex flex-col gap-1.5">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">관리자 대시보드</h1>
                <p className="text-xs text-slate-400 font-bold">서비스 이용 현황 및 통합 매출 통계 보드입니다.</p>
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
                                                        {row.pkg === 'DELUXE' ? 'DELUXE (1개월 / 1,000건)' : 
                                                         row.pkg === 'TRIAL' ? '체험판 (기한없음 / 50건)' : 
                                                         row.pkg === 'TEST' ? '테스트 라이선스 (기한없음 / 50건)' :
                                                         row.pkg === '1M' ? 'STANDARD (1개월)' : 
                                                         row.pkg === '3M' ? 'PREMIUM (3개월)' : 
                                                         row.pkg === '6M' ? 'PRO (6개월)' : 
                                                         row.pkg === '1Y' ? 'BUSINESS (1년)' : row.pkg}
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
