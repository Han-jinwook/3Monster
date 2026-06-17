import { useEffect, useState, useMemo, Fragment } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Search, Loader2, Trash2, Power, CheckCircle2, Clock, AlertCircle, Pencil, Copy, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface License {
    id: string;
    serial_key: string;
    product_id: string;
    buyer_name: string;
    status: 'active' | 'used' | 'unused' | 'expired' | 'blocked';
    expire_date: string;
    created_at: string;
    first_run_date?: string;
    bound_value?: string;
    price_sold?: number;
    license_type?: string;
    contact?: string;
    memo?: string;
}

interface Toast {
    id: number;
    message: string;
    type?: 'info' | 'success';
}

export const LicenseList = () => {
    const [licenses, setLicenses] = useState<License[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [memoTooltip, setMemoTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    let toastCounter = 0;

    const showToast = (message: string, type: 'info' | 'success' = 'info') => {
        const id = ++toastCounter;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
    };

    const fetchLicenses = async () => {
        const { data, error } = await supabase
            .from('licenses')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) console.error('Error fetching licenses:', error);
        else setLicenses(data as License[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchLicenses();
        const channel = supabase
            .channel('license-list-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'licenses' }, fetchLicenses)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const filteredLicenses = useMemo(() => {
        return licenses.filter(l =>
            l.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.serial_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (l.contact && l.contact.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [licenses, searchTerm]);

    const groupedLicenses = useMemo(() => {
        const groups = new Map<string, License[]>();
        filteredLicenses.forEach(lic => {
            // 그룹화 기준: 이메일 (채널 무관하게 이메일이 고유 식별자)
            const email = lic.contact?.trim().toLowerCase();
            const key = email || lic.buyer_name.trim().toLowerCase(); // 이메일이 없는 예외 케이스 대비 (이름/ID 대체)
            
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(lic);
        });

        // 각 그룹 내에서 최신 등록순으로 정렬
        Array.from(groups.values()).forEach(group => {
            group.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        });

        return Array.from(groups.entries()).map(([key, group]) => ({
            key,
            main: group[0],
            history: group.slice(1)
        }));
    }, [filteredLicenses]);


    const toggleGroup = (key: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const getStatusInfo = (license: License) => {
        const expireDate = license.expire_date ? new Date(license.expire_date) : null;
        const now = new Date();
        if (license.status === 'blocked') return { label: '정지', color: 'text-rose-700 bg-rose-50 border-rose-200/60', icon: AlertCircle };
        if (expireDate && expireDate < now) return { label: '만료', color: 'text-slate-500 bg-slate-50 border-slate-200', icon: AlertCircle };
        if (expireDate && (license.status === 'active' || license.status === 'used')) {
            const daysLeft = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 7) return { label: '만료 예정', color: 'text-orange-700 bg-orange-50 border-orange-200/60', icon: Clock };
        }
        switch (license.status) {
            case 'active': case 'used': return { label: '사용중', color: 'text-emerald-700 bg-emerald-50 border-emerald-200/60', icon: CheckCircle2 };
            case 'unused': return { label: '대기중', color: 'text-indigo-700 bg-indigo-50 border-indigo-200/60', icon: Clock };
            default: return { label: '사용중', color: 'text-emerald-700 bg-emerald-50 border-emerald-200/60', icon: CheckCircle2 };
        }
    };

    const getProductLabel = (productId: string, licenseType?: string) => {
        const typeMap: Record<string, string> = {
            'TRIAL':    '디럭스 (5일/1,000건)',
            '1M':       'Standard 1개월',
            '3M':       'Premium 3개월',
            '6M':       'Standard 6개월',
            'LIFETIME': 'Premium 영구',
        };
        const typeLabel = licenseType ? (typeMap[licenseType] || licenseType) : '';
        return typeLabel ? `${productId}(${typeLabel})` : productId;
    };

    const handleCopySerial = (serial: string) => {
        navigator.clipboard.writeText(serial).then(() => showToast(`복사: ${serial}`, 'success'));
    };

    const handleDeleteLicense = async (id: string, buyerName: string) => {
        if (!window.confirm(`"${buyerName}" 라이선스를 삭제하시겠습니까?`)) return;
        try {
            const { error } = await supabase.from('licenses').delete().eq('id', id);
            if (error) throw error;
            fetchLicenses();
        } catch (error: any) { alert(`삭제 오류: ${error.message}`); }
    };

    const handleEditExpireDate = async (id: string, currentExpire: string, buyerName: string) => {
        const newDate = window.prompt(`"${buyerName}" 새 만료일자 (YYYY-MM-DD):`, currentExpire ? currentExpire.split('T')[0] : '');
        if (!newDate) return;
        const parsedDate = new Date(newDate);
        if (isNaN(parsedDate.getTime())) { alert('날짜 형식 오류 (YYYY-MM-DD)'); return; }
        try {
            const { error } = await supabase.from('licenses').update({ expire_date: parsedDate.toISOString() }).eq('id', id);
            if (error) throw error;
            fetchLicenses();
            showToast(`만료일 변경: ${newDate}`, 'success');
        } catch (error: any) { alert(`수정 오류: ${error.message}`); }
    };

    const handleToggleStatus = async (id: string, currentStatus: string, buyerName: string) => {
        if (currentStatus === 'blocked') {
            if (!window.confirm(`"${buyerName}" 차단 해제하시겠습니까?`)) return;
            try {
                const { error } = await supabase.from('licenses').update({ status: 'active' }).eq('id', id);
                if (error) throw error;
                fetchLicenses();
            } catch (err: any) { alert(err.message); }
        } else {
            const reason = window.prompt(`"${buyerName}" 차단 사유:`, '');
            if (reason === null) return;
            try {
                const { data: licData } = await supabase.from('licenses').select('memo').eq('id', id).single();
                const newMemo = (licData?.memo || '') + (reason ? `\n[차단사유: ${reason}]` : '\n[차단사유: 미입력]');
                const { error } = await supabase.from('licenses').update({ status: 'blocked', memo: newMemo }).eq('id', id);
                if (error) throw error;
                fetchLicenses();
            } catch (err: any) { alert(err.message); }
        }
    };

    const renderLicenseRow = (lic: License) => {
        const status = getStatusInfo(lic);

        return (
            <Fragment key={lic.id}>
                {/* 메모 - fixed position 툴팁 로직은 td 내부 유지 */}
                <td className="px-3 py-2 text-center">
                    {lic.memo ? (
                        <span
                            className="cursor-default text-base select-none"
                            onMouseEnter={(e) => {
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                setMemoTooltip({
                                    text: lic.memo!,
                                    x: rect.left + rect.width / 2,
                                    y: rect.bottom + 10,
                                });
                            }}
                            onMouseLeave={() => setMemoTooltip(null)}
                        >
                            📝
                        </span>
                    ) : <span className="text-slate-200 text-xs">-</span>}
                </td>

                {/* 제품 */}
                <td className="px-3 py-2 font-bold text-slate-700 truncate max-w-0">
                    <span className="block truncate">{getProductLabel(lic.product_id, lic.license_type)}</span>
                </td>

                {/* 시리얼 */}
                <td className="px-3 py-2 text-center">
                    <button
                        className="inline-flex items-center gap-1 font-bold text-slate-500 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 px-2 py-0.5 rounded border border-slate-200 hover:border-indigo-200 transition-colors"
                        onClick={(e) => { e.stopPropagation(); handleCopySerial(lic.serial_key); }}
                        title={lic.serial_key}
                    >
                        <Copy className="w-2.5 h-2.5" /> 복사
                    </button>
                </td>

                {/* 구매일자 */}
                <td className="px-3 py-2 font-bold text-slate-500">
                    {lic.created_at ? format(new Date(lic.created_at), 'yyyy.MM.dd') : '-'}
                </td>

                {/* 실행일자 */}
                <td className="px-3 py-2 font-bold text-slate-500">
                    {lic.first_run_date ? format(new Date(lic.first_run_date), 'yyyy.MM.dd') : <span className="text-slate-300 text-[10px]">대기</span>}
                </td>

                {/* 만료일자 */}
                <td className="px-3 py-2 font-bold text-slate-500">
                    <div className="flex items-center gap-1">
                        <span>{lic.expire_date ? format(new Date(lic.expire_date), 'yyyy.MM.dd') : '-'}</span>
                        <button
                            className="text-slate-300 hover:text-indigo-500 transition-colors flex-shrink-0"
                            onClick={(e) => { e.stopPropagation(); handleEditExpireDate(lic.id, lic.expire_date, lic.buyer_name); }}
                            title="만료일자 수정"
                        >
                            <Pencil className="w-2.5 h-2.5" />
                        </button>
                    </div>
                </td>

                {/* 상태 */}
                <td className="px-3 py-2">
                    <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-black border text-[10px]", status.color)}>
                        <status.icon className="w-3 h-3" /> {status.label}
                    </div>
                </td>

                {/* 제어 */}
                <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-0.5">
                        <Button variant="ghost" size="icon"
                            className={cn("h-7 w-7 transition-colors",
                                lic.status === 'blocked'
                                    ? "text-emerald-600 hover:bg-emerald-50"
                                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            )}
                            onClick={(e) => { e.stopPropagation(); handleToggleStatus(lic.id, lic.status, lic.buyer_name); }}
                            title={lic.status === 'blocked' ? "정지 해제" : "라이선스 정지"}
                        >
                            <Power className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon"
                            className="h-7 w-7 text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            onClick={(e) => { e.stopPropagation(); handleDeleteLicense(lic.id, lic.buyer_name); }}
                            title="라이선스 삭제"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </td>
            </Fragment>
        );
    };

    return (
        <div className="space-y-5 relative">
            {/* 메모 고정 툴팁 */}
            {memoTooltip && (
                <div
                    className="fixed z-[9999] bg-white text-slate-700 text-[11px] font-medium leading-relaxed rounded-xl shadow-2xl border border-slate-200 px-3 py-2.5 w-64 whitespace-pre-wrap pointer-events-none"
                    style={{ left: memoTooltip.x, top: memoTooltip.y, transform: 'translateX(-50%)' }}
                >
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-slate-200" />
                    {memoTooltip.text}
                </div>
            )}

            {/* 복사 토스트 */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className={cn(
                        "px-4 py-2 rounded-xl shadow-xl text-xs font-bold whitespace-nowrap animate-in slide-in-from-top-2 fade-in duration-200",
                        t.type === 'success' ? "bg-emerald-600 text-white" : "bg-slate-800 text-white"
                    )}>
                        {t.message}
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">구매자 관리</h1>
                <div className="relative w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="ID / 이메일 / 시리얼 검색"
                        className="pl-11 bg-white border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-sm font-bold rounded-xl h-10"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card className="overflow-hidden p-0 border border-slate-200 shadow-[0_15px_45px_rgba(0,0,0,0.07)] rounded-2xl bg-white">
                <table className="w-full">
                    <colgroup>
                        <col style={{ width: '44px' }} />  {/* 펼침 / NO */}
                        <col style={{ width: '10%' }} />   {/* 크몽 ID */}
                        <col style={{ width: '12%' }} />   {/* 이메일 */}
                        <col style={{ width: '44px' }} />  {/* 메모 */}
                        <col style={{ width: '16%' }} />   {/* 제품 */}
                        <col style={{ width: '70px' }} />  {/* 시리얼(복사) */}
                        <col style={{ width: '8%' }}  />   {/* 구매일자 */}
                        <col style={{ width: '8%' }}  />   {/* 실행일자 */}
                        <col style={{ width: '9%' }}  />   {/* 만료일자 */}
                        <col style={{ width: '8%' }}  />   {/* 상태 */}
                        <col style={{ width: '60px' }} />  {/* 제어 */}
                    </colgroup>
                    <thead className="bg-slate-900 text-white">
                        <tr className="text-[11px] font-black uppercase tracking-wide text-left">
                            <th className="px-3 py-2.5 text-slate-400 text-center">NO</th>
                            <th className="px-3 py-2.5 text-slate-200">크몽 ID</th>
                            <th className="px-3 py-2.5 text-slate-200">이메일</th>
                            <th className="px-3 py-2.5 text-slate-200 text-center">메모</th>
                            <th className="px-3 py-2.5 text-slate-200">최근 구매 제품</th>
                            <th className="px-3 py-2.5 text-slate-200 text-center">시리얼</th>
                            <th className="px-3 py-2.5 text-slate-200">구매일자</th>
                            <th className="px-3 py-2.5 text-slate-200">실행일자</th>
                            <th className="px-3 py-2.5 text-slate-200">만료일자</th>
                            <th className="px-3 py-2.5 text-slate-200">상태</th>
                            <th className="px-3 py-2.5 text-right text-slate-200">제어</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                        {loading ? (
                            <tr><td colSpan={11} className="py-14 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-indigo-200" /></td></tr>
                        ) : groupedLicenses.map((group, idx) => {
                            const hasHistory = group.history.length > 0;
                            const isExpanded = expandedGroups.has(group.key);
                            const displayName = group.main.buyer_name.replace(/\s*\(TRIAL\)\s*|\s*\(TEST\)\s*/gi, '').trim();

                            return (
                                <Fragment key={group.key}>
                                    {/* 메인 레코드 (가장 최신) */}
                                    <tr 
                                        className={cn(
                                            "transition-colors align-middle", 
                                            hasHistory ? "cursor-pointer hover:bg-slate-50" : "hover:bg-slate-50/60"
                                        )}
                                        onClick={() => hasHistory && toggleGroup(group.key)}
                                    >
                                        {/* NO & 펼침 아이콘 */}
                                        <td className="px-3 py-2 text-slate-400 font-bold text-center">
                                            {hasHistory ? (
                                                <button className="flex items-center justify-center w-full h-full text-indigo-500 hover:text-indigo-700 transition-transform">
                                                    <ChevronRight className={cn("w-4 h-4 transition-transform duration-200", isExpanded && "rotate-90")} />
                                                </button>
                                            ) : (
                                                idx + 1
                                            )}
                                        </td>

                                        {/* 구매자 ID */}
                                        <td className="px-3 py-2 font-bold text-slate-800 truncate max-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="block truncate">{displayName}</span>
                                                {hasHistory && <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded-full font-black">+{group.history.length}</span>}
                                            </div>
                                        </td>

                                        {/* 이메일 */}
                                        <td className="px-3 py-2 text-slate-500 truncate max-w-0">
                                            <span className="block truncate">{group.main.contact || <span className="text-slate-300">-</span>}</span>
                                        </td>

                                        {/* 공통 렌더링 로직 (메모 ~ 제어) */}
                                        {renderLicenseRow(group.main)}
                                    </tr>

                                    {/* 하위 히스토리 레코드 (펼침) */}
                                    <AnimatePresence>
                                        {isExpanded && hasHistory && (
                                            <tr>
                                                <td colSpan={11} className="p-0 border-none">
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="overflow-hidden bg-slate-50/80 border-b border-slate-200 shadow-inner"
                                                    >
                                                        <div className="py-2.5 px-6 pl-14">
                                                            <div className="flex items-center gap-2 mb-2 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                                                                <Clock className="w-3.5 h-3.5" /> 이전 구매 히스토리
                                                            </div>
                                                            <table className="w-full text-xs">
                                                                <colgroup>
                                                                    <col style={{ width: '44px' }} />  {/* 메모 */}
                                                                    <col style={{ width: '16%' }} />   {/* 제품 */}
                                                                    <col style={{ width: '70px' }} />  {/* 시리얼(복사) */}
                                                                    <col style={{ width: '10%' }}  />  {/* 구매일자 */}
                                                                    <col style={{ width: '10%' }}  />  {/* 실행일자 */}
                                                                    <col style={{ width: '11%' }}  />  {/* 만료일자 */}
                                                                    <col style={{ width: '10%' }}  />  {/* 상태 */}
                                                                    <col style={{ width: '60px' }} />  {/* 제어 */}
                                                                </colgroup>
                                                                <tbody className="divide-y divide-slate-200/50">
                                                                    {group.history.map(histLic => (
                                                                        <tr key={histLic.id} className="hover:bg-slate-100/50 transition-colors">
                                                                            {renderLicenseRow(histLic)}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </motion.div>
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </Fragment>
                            );
                        })}
                        {!loading && groupedLicenses.length === 0 && (
                            <tr><td colSpan={11} className="py-12 text-center text-slate-400 font-medium">검색 결과가 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};
