import { useEffect, useState, useMemo, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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
    Sparkles,
    X
} from 'lucide-react';
import { format, addMonths } from 'date-fns';
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
    const [memoTooltip, setMemoTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    // 연장 / 신규 이력 발급 모달 상태
    const [extendModalLic, setExtendModalLic] = useState<License | null>(null);
    const [extendPlan, setExtendPlan] = useState<'DELUXE' | 'PREMIUM' | 'STANDARD'>('DELUXE');
    const [extendMonths, setExtendMonths] = useState<number>(1);
    const [extendPrice, setExtendPrice] = useState<number>(7600);
    const [extendChannel, setExtendChannel] = useState<string>('크몽 재결제');
    const [extendMemo, setExtendMemo] = useState<string>('');
    const [extending, setExtending] = useState(false);

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

    const getProductLabel = (productId: string, licenseType?: string, collectionLimit?: number) => {
        if (collectionLimit && collectionLimit > 0) {
            return `${productId} (STANDARD / ${collectionLimit.toLocaleString()}건)`;
        }
        const mapping: Record<string, string> = {
            'DELUXE':   'DELUXE (무제한)',
            'TRIAL':    '체험판',
            'TEST':     '테스트',
            '1M':       'DELUXE (무제한)',
            '3M':       'PREMIUM (무제한)',
            '6M':       '6개월 (무제한)',
            'LIFETIME': '영구 (무제한)',
            'PREMIUM':  'PREMIUM (무제한)',
            'STANDARD': 'DELUXE (무제한)'
        };
        const typeLabel = licenseType ? (mapping[licenseType] || licenseType) : '';
        return typeLabel ? `${productId} (${typeLabel})` : productId;
    };

    const openExtendModal = (lic: License) => {
        setExtendModalLic(lic);
        setExtendPlan(lic.license_type === 'PREMIUM' || lic.license_type === '3M' ? 'PREMIUM' : 'DELUXE');
        setExtendMonths(lic.license_type === 'PREMIUM' || lic.license_type === '3M' ? 3 : 1);
        setExtendPrice(lic.license_type === 'PREMIUM' || lic.license_type === '3M' ? 17900 : 7600);
        setExtendChannel('크몽 재결제');
        setExtendMemo(`[연장] ${lic.product_id} 재결제 이력 추가`);
    };

    const generateSerialKey = (plan: string) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const segment = (len = 4) => Array(len).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        const prefix = plan === 'PREMIUM' ? 'PM' : (plan === 'STANDARD' ? 'STD' : 'DLX');
        return `${prefix}-${segment()}-${segment()}-${segment()}`;
    };

    const handleExecuteExtension = async () => {
        if (!extendModalLic) return;
        setExtending(true);
        try {
            const currentExpStr = extendModalLic.expire_date;
            const now = new Date();
            let baseDate = now;
            if (currentExpStr) {
                const curExp = new Date(currentExpStr);
                if (curExp > now) {
                    baseDate = curExp;
                }
            }

            const newExpireDate = addMonths(baseDate, extendMonths);
            const newSerialKey = generateSerialKey(extendPlan);
            const newLimit = extendPlan === 'STANDARD' ? 1000 : 0;

            // 1. 새 연장 라이선스 INSERT (신규 이력 레코드 생성)
            const newRow = {
                serial_key: newSerialKey,
                product_id: extendModalLic.product_id,
                buyer_name: extendModalLic.buyer_name,
                contact: extendModalLic.contact,
                channel: extendChannel,
                price_sold: extendPrice,
                license_type: extendPlan,
                collection_limit: newLimit,
                status: 'active',
                expire_date: newExpireDate.toISOString(),
                created_at: now.toISOString(),
                constraint_type: 'HWID',
                bound_value: extendModalLic.bound_value || null,
                first_run_date: extendModalLic.first_run_date || now.toISOString(),
                memo: extendMemo || `[관리자 연장] ${extendPlan} (+${extendMonths}개월)`
            };

            const { error: insertErr } = await supabase.from('licenses').insert([newRow]);
            if (insertErr) throw insertErr;

            // 2. 기존 라이선스는 used / 만료로 상태 보존 (덮어쓰지 않고 이력으로 전환)
            await supabase.from('licenses').update({
                status: 'used'
            }).eq('id', extendModalLic.id);

            setExtendModalLic(null);
            fetchLicenses();
            showToast(`신규 연장 발급 완료! (새 만료일: ${format(newExpireDate, 'yyyy-MM-dd')})`, 'success');
        } catch (err: any) {
            alert(`연장 등록 오류: ${err.message}`);
        } finally {
            setExtending(false);
        }
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

    const handleEditFirstRunDate = async (id: string, currentFirstRun: string | undefined, buyerName: string) => {
        const newDate = window.prompt(`"${buyerName}" 새 실행일자 (YYYY-MM-DD):`, currentFirstRun ? currentFirstRun.split('T')[0] : '');
        if (newDate === null) return;
        
        let firstRunPayload: string | null = null;
        if (newDate) {
            const parsedDate = new Date(newDate);
            if (isNaN(parsedDate.getTime())) { alert('날짜 형식 오류 (YYYY-MM-DD)'); return; }
            firstRunPayload = parsedDate.toISOString();
        }
        
        try {
            const { error } = await supabase.from('licenses').update({ first_run_date: firstRunPayload }).eq('id', id);
            if (error) throw error;
            fetchLicenses();
            showToast(`실행일 변경: ${newDate || '대기 상태로 초기화'}`, 'success');
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
                {/* 메모 아이콘 / 버튼 */}
                <td className="px-3 py-2 text-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleEditLicenseMemo(lic.id, lic.memo, lic.buyer_name, lic.product_id)}>
                    {lic.memo ? (
                        <span
                            className="text-base select-none"
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
                    ) : <span className="text-[10px] text-slate-400 border border-dashed border-slate-300 px-1.5 py-0.5 rounded hover:text-indigo-600 transition-colors">작성</span>}
                </td>

                {/* 구매 제품 & 히스토리 아코디언 토글 */}
                <td className="px-3 py-2 font-bold text-slate-700 truncate max-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={cn("block truncate", isHistorySubRow ? "text-slate-500 font-medium" : "text-slate-900 font-bold")}>
                            {getProductLabel(lic.product_id, lic.license_type, lic.collection_limit)}
                        </span>

                        {/* 아코디언 토글 버튼 */}
                        {!isHistorySubRow && historyCount > 0 && onToggleHistory && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggleHistory(); }}
                                className={cn(
                                    "inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded transition-all cursor-pointer shadow-xs ml-1",
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

                {/* 시리얼 */}
                <td className="px-3 py-2 text-center">
                    <button
                        className="inline-flex items-center gap-1 font-bold text-slate-500 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 px-2 py-0.5 rounded border border-slate-200 hover:border-indigo-200 transition-colors text-[11px]"
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
                    <div className="flex items-center gap-1">
                        <span>{lic.first_run_date ? format(new Date(lic.first_run_date), 'yyyy.MM.dd') : <span className="text-slate-300 text-[10px]">대기</span>}</span>
                        <button
                            className="text-slate-300 hover:text-indigo-500 transition-colors flex-shrink-0"
                            onClick={(e) => { e.stopPropagation(); handleEditFirstRunDate(lic.id, lic.first_run_date, lic.buyer_name); }}
                            title="실행일자 수정"
                        >
                            <Pencil className="w-2.5 h-2.5" />
                        </button>
                    </div>
                </td>

                {/* 만료일자 */}
                <td className="px-3 py-2 font-bold text-slate-500">
                    <div className="flex items-center gap-1">
                        <span>{lic.expire_date ? format(new Date(lic.expire_date), 'yyyy.MM.dd') : '-'}</span>
                        <button
                            className="text-slate-300 hover:text-indigo-500 transition-colors flex-shrink-0"
                            onClick={(e) => { e.stopPropagation(); handleEditExpireDate(lic.id, lic.expire_date, lic.buyer_name); }}
                            title="만료일자 직접 수정"
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
                    <div className="flex justify-end items-center gap-1.5 flex-nowrap">
                        {!isHistorySubRow && (
                            <>
                                {/* 신규 연장 / 업그레이드 발급 버튼 */}
                                <button
                                    className="inline-flex items-center gap-1 font-black text-[10px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-900 px-2 py-1 rounded-md border border-emerald-300 transition-all whitespace-nowrap shadow-xs"
                                    onClick={(e) => { e.stopPropagation(); openExtendModal(lic); }}
                                    title="이 고객의 구독 기간 연장 및 신규 이력 레코드 생성"
                                >
                                    <Sparkles className="w-3 h-3 text-emerald-600" /> 기간 연장
                                </button>
                                
                                {/* 추가 제품 구매 */}
                                <button
                                    className="inline-flex items-center gap-1 font-black text-[10px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-800 px-2 py-1 rounded-md border border-indigo-200/80 transition-colors whitespace-nowrap"
                                    onClick={(e) => { e.stopPropagation(); handleAddLicenseForBuyer(lic.buyer_name, lic.contact, lic.product_id); }}
                                    title="이 구매자 정보로 다른 제품 라이선스 신규 발급"
                                >
                                    <PlusCircle className="w-3 h-3" /> 추가 구매
                                </button>
                            </>
                        )}
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
            {memoTooltip && (
                <div
                    className="fixed z-[9999] bg-white text-slate-700 text-[11px] font-medium leading-relaxed rounded-xl shadow-2xl border border-slate-200 px-3 py-2.5 w-64 whitespace-pre-wrap pointer-events-none"
                    style={{ left: memoTooltip.x, top: memoTooltip.y, transform: 'translateX(-50%)' }}
                >
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-slate-200" />
                    {memoTooltip.text}
                </div>
            )}

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

            {/* 기간 연장 & 신규 이력 발급 모달 */}
            {extendModalLic && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-left space-y-5 p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-base">구독 기간 연장 & 신규 이력 생성</h3>
                                    <p className="text-slate-400 text-xs font-bold">{extendModalLic.buyer_name} ({extendModalLic.product_id})</p>
                                </div>
                            </div>
                            <button onClick={() => setExtendModalLic(null)} className="text-slate-400 hover:text-slate-700 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs font-bold">
                            {/* 1. 플랜 선택 */}
                            <div>
                                <label className="block text-slate-600 mb-1.5 font-extrabold">적용 플랜</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'DELUXE', label: 'DELUXE (무제한)', months: 1, price: 7600 },
                                        { id: 'PREMIUM', label: 'PREMIUM (무제한)', months: 3, price: 17900 },
                                        { id: 'STANDARD', label: 'STANDARD (1,000건)', months: 1, price: 4200 },
                                    ].map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => {
                                                setExtendPlan(p.id as any);
                                                setExtendMonths(p.months);
                                                setExtendPrice(p.price);
                                            }}
                                            className={cn(
                                                "p-3 rounded-xl border text-center transition-all cursor-pointer",
                                                extendPlan === p.id 
                                                    ? "bg-indigo-600 text-white border-indigo-700 shadow-sm" 
                                                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                            )}
                                        >
                                            <span className="block font-black">{p.id}</span>
                                            <span className="text-[10px] opacity-80 block mt-0.5">{p.months}개월 ({p.price.toLocaleString()}원)</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 2. 연장 개월수 & 결제 금액 */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-600 mb-1">연장 개월 수 (+N개월)</label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={extendMonths}
                                        onChange={e => setExtendMonths(parseInt(e.target.value) || 1)}
                                        className="h-10 bg-slate-50 font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-600 mb-1">결제/판매 금액 (원)</label>
                                    <Input
                                        type="number"
                                        value={extendPrice}
                                        onChange={e => setExtendPrice(parseInt(e.target.value) || 0)}
                                        className="h-10 bg-slate-50 font-bold"
                                    />
                                </div>
                            </div>

                            {/* 3. 결제 채널 */}
                            <div>
                                <label className="block text-slate-600 mb-1">결제 채널 / 수단</label>
                                <select
                                    value={extendChannel}
                                    onChange={e => setExtendChannel(e.target.value)}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs focus:ring-2 focus:ring-indigo-200 outline-none"
                                >
                                    <option value="크몽 재결제">크몽 재결제</option>
                                    <option value="무통장/계좌이체">무통장 / 계좌이체</option>
                                    <option value="스마트스토어">스마트스토어</option>
                                    <option value="PG 카드결제">3Monster PG 카드결제</option>
                                    <option value="관리자 무상연장">관리자 무상 지원/연장</option>
                                    <option value="기타">기타</option>
                                </select>
                            </div>

                            {/* 4. 메모 */}
                            <div>
                                <label className="block text-slate-600 mb-1">연장 기록 메모</label>
                                <Input
                                    placeholder="예: 크몽 2차 연장 결제건"
                                    value={extendMemo}
                                    onChange={e => setExtendMemo(e.target.value)}
                                    className="h-10 bg-slate-50 text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                            <Button variant="ghost" onClick={() => setExtendModalLic(null)} className="h-10 px-4 text-xs font-bold">
                                취소
                            </Button>
                            <Button 
                                onClick={handleExecuteExtension} 
                                disabled={extending}
                                className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-600/20"
                            >
                                {extending ? '연장 처리중...' : '신규 연장 발급 및 이력 생성'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

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
                        <col style={{ width: '44px' }} />  {/* NO */}
                        <col style={{ width: '10%' }} />   {/* 크몽 ID */}
                        <col style={{ width: '12%' }} />   {/* 이메일 */}
                        <col style={{ width: '44px' }} />  {/* 메모 */}
                        <col style={{ width: '18%' }} />   {/* 제품 */}
                        <col style={{ width: '70px' }} />  {/* 시리얼(복사) */}
                        <col style={{ width: '8%' }}  />   {/* 구매일자 */}
                        <col style={{ width: '8%' }}  />   {/* 실행일자 */}
                        <col style={{ width: '9%' }}  />   {/* 만료일자 */}
                        <col style={{ width: '8%' }}  />   {/* 상태 */}
                        <col style={{ width: '190px' }} /> {/* 제어 */}
                    </colgroup>
                    <thead className="bg-slate-900 text-white">
                        <tr className="text-[11px] font-black uppercase tracking-wide text-left">
                            <th className="px-3 py-2.5 text-slate-400 text-center">NO</th>
                            <th className="px-3 py-2.5 text-slate-200">크몽 ID</th>
                            <th className="px-3 py-2.5 text-slate-200">이메일</th>
                            <th className="px-3 py-2.5 text-slate-200 text-center">메모</th>
                            <th className="px-3 py-2.5 text-slate-200">구매 제품</th>
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
                            const isExpanded = expandedGroups.has(group.key);
                            const displayName = group.main.buyer_name.replace(/\s*\(TRIAL\)\s*|\s*\(TEST\)\s*/gi, '').trim();

                            return (
                                <Fragment key={group.key}>
                                    {/* 메인 대표 행 (현재 최신 활성 라이선스) */}
                                    <tr className={cn(
                                        "transition-colors align-middle border-t border-slate-200",
                                        isExpanded ? "bg-indigo-50/30" : "hover:bg-slate-50"
                                    )}>
                                        <td className="px-3 py-2.5 text-slate-500 font-bold text-center">
                                            {idx + 1}
                                        </td>
                                        <td className="px-3 py-2.5 font-bold text-slate-800 truncate max-w-0">
                                            <span className="block truncate font-extrabold">{displayName}</span>
                                        </td>
                                        <td className="px-3 py-2.5 text-slate-600 truncate max-w-0 font-medium">
                                            <span className="block truncate">{group.main.contact || <span className="text-slate-300">-</span>}</span>
                                        </td>
                                        {renderLicenseRow(group.main, false, group.history.length, isExpanded, () => toggleGroup(group.key))}
                                    </tr>

                                    {/* 아코디언 펼침: 이 제품의 과거 구매 및 변경 히스토리 서브 행 */}
                                    {isExpanded && group.history.map((histLic, hIdx) => (
                                        <tr key={histLic.id} className="bg-slate-50/80 hover:bg-slate-100/80 transition-colors align-middle border-t border-dashed border-slate-200/90">
                                            {/* 구분 인덱스 */}
                                            <td className="px-3 py-2 text-slate-300 font-mono text-[10px] text-center">
                                                ↳ {hIdx + 1}
                                            </td>

                                            {/* 과거 이력 표기 */}
                                            <td className="px-3 py-2 text-slate-400 font-medium text-[11px]" colSpan={2}>
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <span className="text-indigo-400 font-bold text-xs">↳</span>
                                                    <span className="text-[10px] bg-slate-200/70 text-slate-600 font-bold px-1.5 py-0.5 rounded">과거 이력</span>
                                                    <span className="text-[10px] text-slate-400">({displayName})</span>
                                                </div>
                                            </td>

                                            {/* 과거 제품별 메모 ~ 제어 */}
                                            {renderLicenseRow(histLic, true)}
                                        </tr>
                                    ))}
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
