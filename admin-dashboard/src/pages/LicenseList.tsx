import { useEffect, useState, useMemo, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, supabasePublic } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { 
    Search, 
    Loader2, 
    Trash2, 
    Power, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    Pencil, 
    Copy, 
    PlusCircle, 
    ChevronDown, 
    ChevronUp,
    Receipt,
    X,
    Key
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

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
    collection_limit?: number;
    used_count?: number;
    contact?: string;
    memo?: string;
    channel?: string;
}

export const LicenseList = () => {
    const navigate = useNavigate();
    const [licenses, setLicenses] = useState<License[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: 'success' | 'info' }>>([]);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    // 구매원장 모달 상태
    const [selectedLedgerContact, setSelectedLedgerContact] = useState<string | null>(null);

    const showToast = (message: string, type: 'success' | 'info' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 2500);
    };

    const toggleGroup = (groupKey: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(groupKey)) {
                next.delete(groupKey);
            } else {
                next.add(groupKey);
            }
            return next;
        });
    };

    const fetchLicenses = async () => {
        const { data, error } = await supabasePublic
            .from('licenses')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) console.error('Error fetching licenses:', error);
        else setLicenses(data as License[]);
        setLoading(false);
    };

    // 선택된 고객의 전체 구매원장 목록 및 통계 집계
    const ledgerLicenses = useMemo(() => {
        if (!selectedLedgerContact) return [];
        const target = selectedLedgerContact.toLowerCase().trim();
        return licenses.filter(l => {
            const contact = (l.contact || '').toLowerCase().trim();
            const buyer = (l.buyer_name || '').toLowerCase().trim();
            return contact === target || (!contact && buyer === target);
        }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [licenses, selectedLedgerContact]);

    const ledgerStats = useMemo(() => {
        const totalSpent = ledgerLicenses.reduce((acc, l) => acc + (Number(l.price_sold) || 0), 0);
        const now = new Date().getTime();
        const activeCount = ledgerLicenses.filter(l => {
            const exp = l.expire_date ? new Date(l.expire_date).getTime() : 0;
            return l.status !== 'blocked' && exp >= now;
        }).length;
        const buyerName = (ledgerLicenses.find(l => l.buyer_name)?.buyer_name || '').replace(/\s*\(TRIAL\)\s*|\s*\(TEST\)\s*/gi, '').trim();
        const primaryChannel = ledgerLicenses.find(l => l.channel)?.channel || '자사몰';
        // 구매한 고유 제품(Product ID) 개수
        const productSet = new Set(ledgerLicenses.map(l => l.product_id).filter(Boolean));
        const productCount = productSet.size;

        return {
            totalSpent,
            totalCount: ledgerLicenses.length,
            activeCount,
            buyerName,
            primaryChannel,
            productCount
        };
    }, [ledgerLicenses]);

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

    // [핵심]: (구매자 + 제품ID) 단위로 고유 섹션 그룹핑 & 최신 활성 라이선스를 Main(대표)으로 배치
    const groupedLicenses = useMemo(() => {
        const groups = new Map<string, License[]>();
        filteredLicenses.forEach(lic => {
            const email = lic.contact?.trim().toLowerCase();
            const buyerKey = email || lic.buyer_name.trim().toLowerCase();
            const prodKey = lic.product_id || 'UNKNOWN';
            const groupKey = `${buyerKey}____${prodKey}`;
            
            if (!groups.has(groupKey)) {
                groups.set(groupKey, []);
            }
            groups.get(groupKey)!.push(lic);
        });

        const now = new Date().getTime();
        Array.from(groups.values()).forEach(group => {
            // 정렬 기준:
            // 1) 활성 상태 (미만료 & active/used) 우선
            // 2) 만료일이 가장 미래인 것 우선 (내림차순)
            // 3) 생성일이 최신인 것 우선 (내림차순)
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

        return Array.from(groups.entries()).map(([key, group]) => ({
            key,
            main: group[0],
            history: group.slice(1)
        }));
    }, [filteredLicenses]);

    const getStatusInfo = (license: License) => {
        const expireDate = license.expire_date ? new Date(license.expire_date) : null;
        const now = new Date();
        if (license.status === 'blocked') return { label: '정지', color: 'text-rose-700 bg-rose-50 border-rose-200/60', icon: AlertCircle };
        if (expireDate && expireDate < now) return { label: '만료', color: 'text-slate-500 bg-slate-50 border-slate-200', icon: AlertCircle };
        if (expireDate) {
            const daysLeft = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 7) return { label: '만료 임박', color: 'text-orange-700 bg-orange-50 border-orange-200/60', icon: Clock };
        }
        return { label: '정상', color: 'text-emerald-700 bg-emerald-50 border-emerald-200/60', icon: CheckCircle2 };
    };

    const getProductLabel = (productId: string, licenseType?: string, collectionLimit?: number) => {
        const mapping: Record<string, string> = {
            'START_1M': '스타트 1M (1,000건/무제한발송)',
            'START_1Y': '스타트 1Y (12,000건/무제한발송)',
            'PLUS_1M':  '플러스 1M (3,000건/무제한발송)',
            'PLUS_1Y':  '플러스 1Y (36,000건/무제한발송)',
            'PRO_1M':   '프로 1M (9,000건/무제한발송)',
            'PRO_1Y':   '프로 1Y (108,000건/무제한발송)',
            'DELUXE':   '스타트',
            'TRIAL':    '체험판',
            'TEST':     '테스트',
            '1M':       '플러스',
            '3M':       '프로',
            '6M':       '6개월',
            'LIFETIME': '영구',
            'PREMIUM':  '프로',
            'STANDARD': '스타트'
        };
        const rawType = licenseType ? (mapping[licenseType] || licenseType) : '';
        const cleanType = rawType.replace(/\s*\(레거시\)/g, '').trim();

        if (collectionLimit && collectionLimit > 0 && !cleanType) {
            return `${productId} (${collectionLimit.toLocaleString()}건 한도)`;
        }
        if (!cleanType) return productId;
        if (cleanType.startsWith('(') && cleanType.endsWith(')')) {
            return `${productId} ${cleanType}`;
        }
        return `${productId} (${cleanType})`;
    };

    const handleCopySerial = (serial: string) => {
        navigator.clipboard.writeText(serial).then(() => showToast(`라이선스 키 복사: ${serial}`, 'success'));
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
        const newDate = window.prompt(`"${buyerName}" 만료일자 직접 수정 (YYYY-MM-DD):`, currentExpire ? currentExpire.split('T')[0] : '');
        if (!newDate) return;
        const parsedDate = new Date(newDate);
        if (isNaN(parsedDate.getTime())) { alert('날짜 형식 오류 (YYYY-MM-DD)'); return; }
        try {
            const { error } = await supabase.from('licenses').update({ expire_date: parsedDate.toISOString() }).eq('id', id);
            if (error) throw error;
            fetchLicenses();
            showToast(`만료일 수정: ${newDate}`, 'success');
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

    const handleEditLicenseMemo = async (id: string, currentMemo: string | undefined, buyerName: string, productName: string) => {
        const newMemo = window.prompt(`"${buyerName}" (${productName}) 메모 작성/수정:`, currentMemo || '');
        if (newMemo === null) return;
        try {
            const { error } = await supabase.from('licenses').update({ memo: newMemo }).eq('id', id);
            if (error) throw error;
            fetchLicenses();
            showToast('메모가 저장되었습니다.', 'success');
        } catch (err: any) {
            alert(`메모 저장 오류: ${err.message}`);
        }
    };

    const handleAddLicenseForBuyer = (buyerName: string, contactEmail?: string, productId?: string) => {
        const params = new URLSearchParams();
        if (buyerName) params.set('buyer', buyerName);
        if (contactEmail) params.set('email', contactEmail);
        if (productId) params.set('product', productId);
        navigate(`/admin/generator?${params.toString()}`);
    };

    const renderLicenseRow = (lic: License, isHistorySubRow: boolean = false, historyCount: number = 0, isExpanded: boolean = false, onToggleHistory?: () => void) => {
        const status = getStatusInfo(lic);

        return (
            <Fragment key={lic.id}>
                {/* 구매 제품 & 히스토리 아코디언 토글 - 풀 텍스트 완전 노출 (잘림 방지) */}
                <td className="px-3 py-2 font-bold text-slate-800 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 flex-nowrap">
                        <span className={cn(
                            "font-black text-xs whitespace-nowrap",
                            isHistorySubRow ? "text-slate-500 font-medium" : "text-slate-950 font-black"
                        )}>
                            {getProductLabel(lic.product_id, lic.license_type, lic.collection_limit)}
                        </span>

                        {/* 아코디언 토글 버튼 */}
                        {!isHistorySubRow && historyCount > 0 && onToggleHistory && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onToggleHistory(); }}
                                className={cn(
                                    "inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded transition-all cursor-pointer shadow-2xs ml-1 whitespace-nowrap shrink-0",
                                    isExpanded 
                                        ? "bg-indigo-600 text-white border border-indigo-700 hover:bg-indigo-700"
                                        : "bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100"
                                )}
                                title="과거 플랜 및 결제/연장 히스토리 보기"
                            >
                                {isExpanded ? (
                                    <><ChevronUp className="w-2.5 h-2.5" /> 이력 접기 ({historyCount})</>
                                ) : (
                                    <><ChevronDown className="w-2.5 h-2.5" /> 이력 {historyCount}건</>
                                )}
                            </button>
                        )}
                    </div>
                </td>

                {/* 라이선스 키 (복사) - 가로 1줄 단정하게 배치 */}
                <td className="px-2 py-2 text-center whitespace-nowrap">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center gap-1 font-bold text-slate-600 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 px-2.5 py-1 rounded-md border border-slate-200 hover:border-indigo-200 transition-colors text-xs whitespace-nowrap cursor-pointer shadow-2xs"
                        onClick={(e) => { e.stopPropagation(); handleCopySerial(lic.serial_key); }}
                        title={lic.serial_key}
                    >
                        <Copy className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>복사</span>
                    </button>
                </td>

                {/* 구매일자 (구독 시작일) & 최초 접속 로그 */}
                <td className="px-3 py-2 whitespace-nowrap">
                    <div className="font-bold text-slate-800 text-xs">
                        {lic.created_at ? format(new Date(lic.created_at), 'yyyy.MM.dd') : '-'}
                    </div>
                    {lic.first_run_date ? (
                        <div className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5" title="최초 기기 등록/로그인 일시">
                            <span>접속:</span>
                            <span className="text-slate-600 font-mono font-bold">{format(new Date(lic.first_run_date), 'MM.dd')}</span>
                        </div>
                    ) : (
                        <div className="text-[10px] text-indigo-400 font-bold">
                            미접속
                        </div>
                    )}
                </td>

                {/* 수집 사용량 (사용량 / 한도) */}
                <td className="px-3 py-2 whitespace-nowrap">
                    {lic.collection_limit && lic.collection_limit > 0 ? (
                        <div className="space-y-1 min-w-[110px]">
                            <div className="flex items-center justify-between gap-1 text-[11px] font-bold">
                                <span className="text-indigo-950 font-black">
                                    {(lic.used_count || 0).toLocaleString()}
                                </span>
                                <span className="text-slate-400 text-[10px]">
                                    / {lic.collection_limit.toLocaleString()}건
                                </span>
                            </div>
                            {/* 미니 프로그레스 바 */}
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div 
                                    className={cn(
                                        "h-full rounded-full transition-all duration-300",
                                        ((lic.used_count || 0) / lic.collection_limit) >= 0.9 
                                            ? "bg-rose-500" 
                                            : ((lic.used_count || 0) / lic.collection_limit) >= 0.7 
                                                ? "bg-amber-500" 
                                                : "bg-indigo-600"
                                    )}
                                    style={{ width: `${Math.min(100, Math.round(((lic.used_count || 0) / lic.collection_limit) * 100))}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-800">
                                {(lic.used_count || 0).toLocaleString()}건
                            </span>
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                무제한
                            </span>
                        </div>
                    )}
                </td>

                {/* 만료일자 */}
                <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-800 text-xs">
                            {lic.expire_date ? format(new Date(lic.expire_date), 'yyyy.MM.dd') : '-'}
                        </span>
                        <button
                            type="button"
                            className="text-slate-300 hover:text-indigo-500 transition-colors shrink-0 cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); handleEditExpireDate(lic.id, lic.expire_date, lic.buyer_name); }}
                            title="만료일자 직접 수정"
                        >
                            <Pencil className="w-2.5 h-2.5" />
                        </button>
                    </div>
                    {lic.expire_date && (
                        <div className="text-[10px] font-bold">
                            {(() => {
                                const exp = new Date(lic.expire_date);
                                const diff = Math.ceil((exp.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                if (diff < 0) return <span className="text-rose-500">만료됨</span>;
                                if (diff === 0) return <span className="text-rose-600 font-black">D-Day</span>;
                                if (diff <= 7) return <span className="text-amber-600 font-black">D-{diff} (임박)</span>;
                                return <span className="text-slate-400 font-medium">D-{diff}</span>;
                            })()}
                        </div>
                    )}
                </td>

                {/* 상태 - 가로 타원형 뱃지, 줄바꿈 방지 */}
                <td className="px-2 py-2 text-center whitespace-nowrap">
                    <span className={cn(
                        "inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full font-black border text-[11px] whitespace-nowrap shadow-2xs", 
                        status.color
                    )}>
                        <status.icon className="w-3 h-3 shrink-0" />
                        <span>{status.label}</span>
                    </span>
                </td>

                {/* 제어 */}
                <td className="px-3 py-2 text-right whitespace-nowrap">
                    <div className="flex justify-end items-center gap-1 flex-nowrap">
                        <Button variant="ghost" size="icon"
                            className={cn("h-7 w-7 transition-colors shrink-0",
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
                            className="h-7 w-7 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors shrink-0"
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
        <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
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

            {/* 🧾 고객 구매원장 (Order Ledger) 모달 */}
            {selectedLedgerContact && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-left animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex justify-between items-center shrink-0">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-400/30">
                                        <Receipt className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-black text-white tracking-tight">고객 구매원장 (Order Ledger)</h2>
                                </div>
                                <div className="text-xs text-slate-300 font-medium flex items-center gap-3 pt-0.5 flex-wrap">
                                    <span>고객 이메일: <b className="text-white underline">{selectedLedgerContact}</b></span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedLedgerContact(null)} 
                                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body: Stats + Detailed Ledger Table */}
                        <div className="p-6 space-y-6 overflow-y-auto flex-1">
                            {/* Summary KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col justify-between">
                                    <span className="text-[11px] font-black text-indigo-600 uppercase tracking-wide">총 누적 결제금액</span>
                                    <div className="mt-1">
                                        <span className="text-2xl font-black text-indigo-950">
                                            {ledgerStats.totalSpent.toLocaleString()}
                                        </span>
                                        <span className="text-xs font-black text-indigo-700 ml-1">원</span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide">구매 및 구독 이력</span>
                                        <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                                            총 {ledgerStats.totalCount}건
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 divide-x divide-slate-200 mt-2 py-0.5 text-center items-center">
                                        <div className="pr-1.5">
                                            <span className="block text-[10px] font-extrabold text-slate-500">보유 제품</span>
                                            <div className="mt-0.5">
                                                <span className="text-xl font-black text-slate-900">{ledgerStats.productCount}</span>
                                                <span className="text-[11px] font-bold text-slate-500 ml-0.5">개</span>
                                            </div>
                                        </div>
                                        <div className="pl-1.5">
                                            <span className="block text-[10px] font-extrabold text-indigo-600">누적 주문</span>
                                            <div className="mt-0.5">
                                                <span className="text-xl font-black text-indigo-600">{ledgerStats.totalCount}</span>
                                                <span className="text-[11px] font-bold text-indigo-400 ml-0.5">건</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex flex-col justify-between">
                                    <span className="text-[11px] font-black text-emerald-600 uppercase tracking-wide">활성 라이선스</span>
                                    <div className="mt-1">
                                        <span className="text-2xl font-black text-emerald-900">
                                            {ledgerStats.activeCount}
                                        </span>
                                        <span className="text-xs font-bold text-emerald-600 ml-1">개 제품</span>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Purchase Ledger Table */}
                            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                                <div className="px-4 py-3 bg-slate-100/80 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                                        구매 건별 원장 내역 ({ledgerLicenses.length}건)
                                    </h3>
                                    <span className="text-[10px] text-slate-400 font-bold">
                                        최신 결제일시 순 정렬
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-600">
                                            <tr>
                                                <th className="px-3 py-2.5 text-center w-12">NO</th>
                                                <th className="px-3 py-2.5">구매일시</th>
                                                <th className="px-3 py-2.5">구매 제품 (플랜)</th>
                                                <th className="px-3 py-2.5">수집 사용량</th>
                                                <th className="px-3 py-2.5">구매처</th>
                                                <th className="px-3 py-2.5 text-right">결제 금액</th>
                                                <th className="px-3 py-2.5">비고/메모</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium">
                                            {ledgerLicenses.map((lic, i) => (
                                                <tr key={lic.id} className="hover:bg-indigo-50/30 transition-colors">
                                                    <td className="px-3 py-3 text-center text-slate-400 font-bold font-mono text-[11px]">
                                                        {i + 1}
                                                    </td>
                                                    <td className="px-3 py-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                                                        {lic.created_at ? format(new Date(lic.created_at), 'yyyy.MM.dd HH:mm') : '-'}
                                                    </td>
                                                    <td className="px-3 py-3 font-black text-slate-900 whitespace-nowrap">
                                                        {getProductLabel(lic.product_id, lic.license_type, lic.collection_limit)}
                                                    </td>
                                                    <td className="px-3 py-3 font-mono text-[11px] whitespace-nowrap">
                                                        {lic.collection_limit && lic.collection_limit > 0 ? (
                                                            <span className="font-bold text-indigo-950">
                                                                {(lic.used_count || 0).toLocaleString()} <span className="text-slate-400 font-normal">/ {lic.collection_limit.toLocaleString()}건</span>
                                                            </span>
                                                        ) : (
                                                            <span className="font-bold text-slate-800">
                                                                {(lic.used_count || 0).toLocaleString()}건 <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded font-black border border-emerald-200">무제한</span>
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3 whitespace-nowrap">
                                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                            {lic.channel || '자사몰'}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3 text-right font-black text-indigo-600 whitespace-nowrap">
                                                        {(lic.price_sold || 0).toLocaleString()}원
                                                    </td>
                                                    <td 
                                                        className="px-3 py-3 text-slate-600 text-[11px] max-w-[200px] cursor-pointer hover:bg-indigo-50/50 transition-colors group" 
                                                        title="클릭하여 메모 작성/수정"
                                                        onClick={() => handleEditLicenseMemo(lic.id, lic.memo, lic.buyer_name, lic.product_id)}
                                                    >
                                                        <div className="flex items-center justify-between gap-1.5">
                                                            <span className={cn("truncate font-medium", !lic.memo && "text-slate-300 italic")}>
                                                                {lic.memo || '메모 입력'}
                                                            </span>
                                                            <Pencil className="w-2.5 h-2.5 text-slate-300 group-hover:text-indigo-600 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end items-center shrink-0">
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline"
                                    onClick={() => setSelectedLedgerContact(null)}
                                    className="h-10 px-4 text-xs font-bold"
                                >
                                    닫기
                                </Button>
                                <Button 
                                    onClick={() => {
                                        handleAddLicenseForBuyer('', selectedLedgerContact);
                                        setSelectedLedgerContact(null);
                                    }}
                                    className="h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                                >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                    새 라이선스 발급
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">구매자 관리</h1>
                    <span className="text-xs font-black bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200/80">
                        총 {licenses.length}건
                    </span>
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="relative w-64 sm:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="ID / 이메일 / 라이선스 키 검색"
                            className="pl-11 bg-white border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-xs sm:text-sm font-bold rounded-xl h-10"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => navigate('/admin/generator')}
                        className="h-10 px-3.5 sm:px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 shrink-0 cursor-pointer transition-all"
                        title="외부 주문, B2B 법인 계약, 비상 시 수동으로 라이선스 키 생성"
                    >
                        <Key className="w-3.5 h-3.5" />
                        <span>수동 키 발급</span>
                    </Button>
                </div>
            </div>

            <Card className="overflow-hidden p-0 border border-slate-200 shadow-[0_15px_45px_rgba(0,0,0,0.07)] rounded-2xl bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[960px] text-left border-collapse">
                        <colgroup>
                            <col style={{ width: '44px' }} />  {/* NO */}
                            <col style={{ width: '210px' }} /> {/* 구매자 (이메일) */}
                            <col style={{ width: 'auto' }} />  {/* 구매 제품 (풀 텍스트) */}
                            <col style={{ width: '75px' }} />  {/* 라이선스 키(복사) */}
                            <col style={{ width: '95px' }} />  {/* 구매일자 */}
                            <col style={{ width: '135px' }} /> {/* 수집 사용량 */}
                            <col style={{ width: '105px' }} /> {/* 만료일자 */}
                            <col style={{ width: '85px' }} />  {/* 상태 */}
                            <col style={{ width: '80px' }} />  {/* 제어 */}
                        </colgroup>
                        <thead className="bg-slate-900 text-white">
                            <tr className="text-[11px] font-black uppercase tracking-wide text-left">
                                <th className="px-3 py-2.5 text-slate-400 text-center whitespace-nowrap">NO</th>
                                <th className="px-3 py-2.5 text-slate-200 whitespace-nowrap">구매자 (이메일)</th>
                                <th className="px-3 py-2.5 text-slate-200 whitespace-nowrap">구매 제품</th>
                                <th className="px-3 py-2.5 text-slate-200 text-center whitespace-nowrap">라이선스 키</th>
                                <th className="px-3 py-2.5 text-slate-200 whitespace-nowrap">구매일자</th>
                                <th className="px-3 py-2.5 text-slate-200 whitespace-nowrap">수집 사용량</th>
                                <th className="px-3 py-2.5 text-slate-200 whitespace-nowrap">만료일자</th>
                                <th className="px-3 py-2.5 text-slate-200 text-center whitespace-nowrap">상태</th>
                                <th className="px-3 py-2.5 text-right text-slate-200 whitespace-nowrap">제어</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {loading ? (
                                <tr><td colSpan={9} className="py-14 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-indigo-200" /></td></tr>
                            ) : groupedLicenses.map((group, idx) => {
                                const isExpanded = expandedGroups.has(group.key);
                                const contactEmail = group.main.contact || group.main.buyer_name;

                                return (
                                    <Fragment key={group.key}>
                                        {/* 메인 대표 행 (현재 최신 활성 라이선스) */}
                                        <tr className={cn(
                                            "transition-colors align-middle border-t border-slate-200",
                                            isExpanded ? "bg-indigo-50/30" : "hover:bg-slate-50"
                                        )}>
                                            <td className="px-3 py-2.5 text-slate-500 font-bold text-center whitespace-nowrap">
                                                {idx + 1}
                                            </td>
                                            {/* 이메일 기준 구매자 식별 컬럼 (클릭 시 구매원장 모달 오픈) */}
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <span 
                                                    className="font-black text-xs text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer tracking-tight"
                                                    onClick={() => setSelectedLedgerContact(contactEmail)}
                                                    title="클릭 시 전체 구매원장(Order Ledger) 모달 보기"
                                                >
                                                    {contactEmail}
                                                </span>
                                            </td>
                                            {renderLicenseRow(group.main, false, group.history.length, isExpanded, () => toggleGroup(group.key))}
                                        </tr>

                                        {/* 아코디언 펼침: 이 제품의 과거 구매 및 변경 히스토리 서브 행 */}
                                        {isExpanded && group.history.map((histLic, hIdx) => (
                                            <tr key={histLic.id} className="bg-slate-50/80 hover:bg-slate-100/80 transition-colors align-middle border-t border-dashed border-slate-200/90">
                                                {/* 구분 인덱스 */}
                                                <td className="px-3 py-2 text-slate-300 font-mono text-[10px] text-center whitespace-nowrap">
                                                    ↳ {hIdx + 1}
                                                </td>

                                                {/* 과거 이력 표기 */}
                                                <td className="px-3 py-2 text-slate-400 font-medium text-[11px] whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 text-slate-500 pl-2">
                                                        <span className="text-indigo-400 font-bold text-xs">↳</span>
                                                        <span className="text-[10px] bg-slate-200/70 text-slate-600 font-bold px-1.5 py-0.5 rounded">과거 이력</span>
                                                    </div>
                                                </td>

                                                {/* 과거 제품별 ~ 제어 */}
                                                {renderLicenseRow(histLic, true)}
                                            </tr>
                                        ))}
                                    </Fragment>
                                );
                            })}
                            {!loading && groupedLicenses.length === 0 && (
                                <tr><td colSpan={9} className="py-12 text-center text-slate-400 font-medium">검색 결과가 없습니다.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
