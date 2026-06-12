import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Copy, Key, CheckCircle2, ChevronRight, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const generateSerial = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segment = () => Array(4).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    return `CM-${segment()}-${segment()}-${segment()}`;
};

interface PricingItem {
    id: number;
    product: string;
    pkg: string;
    label: string;
    price: number;
    status: '안' | '확정';
}

export const LicenseGenerator = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [generatedKey, setGeneratedKey] = useState('');
    const [formData, setFormData] = useState({
        product_id: 'NPlace-DB',
        license_type: 'TRIAL',
        constraint_type: 'HWID',
        buyer_name: '',
        contact: '',
        channel: '크몽',
        price_sold: '',
        memo: ''
    });

    const [pricing, setPricing] = useState<PricingItem[]>(() => {
        const saved = localStorage.getItem('3monster_pricing_policies');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {}
        }
        return [
            { id: 1, product: 'NPlace-DB', pkg: 'TRIAL', label: 'DELUXE (5일 체험판)', price: 5000, status: '확정' },
            { id: 2, product: 'NPlace-DB', pkg: '6M', label: 'STANDARD (6개월 이용권)', price: 99000, status: '확정' },
            { id: 3, product: 'NPlace-DB', pkg: 'LIFETIME', label: 'PREMIUM (영구 소장본)', price: 198000, status: '확정' },
            { id: 4, product: 'CafeCrawler', pkg: 'TRIAL', label: 'DELUXE (5일 체험판)', price: 5000, status: '안' },
            { id: 5, product: 'CafeCrawler', pkg: '6M', label: 'STANDARD (6개월 이용권)', price: 99000, status: '안' },
            { id: 6, product: 'CafeCrawler', pkg: 'LIFETIME', label: 'PREMIUM (영구 소장본)', price: 198000, status: '안' },
            { id: 7, product: 'NPlace-DB', pkg: 'TEST', label: '임시 테스트 (1일)', price: 0, status: '확정' },
            { id: 8, product: 'NPlace-DB', pkg: '1M', label: '1개월권', price: 30000, status: '확정' },
            { id: 9, product: 'NPlace-DB', pkg: '3M', label: '3개월권', price: 90000, status: '확정' },
            { id: 10, product: 'NPlace-DB', pkg: '1Y', label: '1년권', price: 270000, status: '확정' },
            { id: 11, product: 'CafeCrawler', pkg: 'TEST', label: '임시 테스트 (1일)', price: 0, status: '안' },
            { id: 12, product: 'CafeCrawler', pkg: '1M', label: '1개월권', price: 30000, status: '안' },
            { id: 13, product: 'CafeCrawler', pkg: '3M', label: '3개월권', price: 90000, status: '안' },
            { id: 14, product: 'CafeCrawler', pkg: '1Y', label: '1년권', price: 270000, status: '안' },
        ];
    });

    useEffect(() => {
        localStorage.setItem('3monster_pricing_policies', JSON.stringify(pricing));
    }, [pricing]);

    // Initial price auto-fill on mount
    useEffect(() => {
        const matched = pricing.find(
            p => p.product.toLowerCase() === formData.product_id.toLowerCase() && p.pkg === formData.license_type
        );
        if (matched && formData.price_sold === '') {
            setFormData(prev => ({ ...prev, price_sold: String(matched.price) }));
        }
    }, []);

    const handleProductChange = (productId: string) => {
        const matched = pricing.find(
            p => p.product.toLowerCase() === productId.toLowerCase() && p.pkg === formData.license_type
        );
        setFormData(prev => ({
            ...prev,
            product_id: productId,
            price_sold: matched ? String(matched.price) : prev.price_sold
        }));
    };

    const handleLicenseTypeChange = (licenseType: string) => {
        const matched = pricing.find(
            p => p.product.toLowerCase() === formData.product_id.toLowerCase() && p.pkg === licenseType
        );
        setFormData(prev => ({
            ...prev,
            license_type: licenseType,
            price_sold: matched ? String(matched.price) : prev.price_sold
        }));
    };

    const handleToggleStatus = (id: number) => {
        setPricing(prev =>
            prev.map(p => (p.id === id ? { ...p, status: p.status === '안' ? '확정' : '안' } : p))
        );
    };

    const handleUpdatePrice = (id: number, price: number) => {
        setPricing(prev =>
            prev.map(p => (p.id === id ? { ...p, price: price } : p))
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const isTrial = formData.license_type === 'TRIAL';
        const isTest = formData.license_type === 'TEST';
        
        let serial = '';
        if (isTest) {
            serial = `TEST-${generateSerial().split('-').slice(1).join('-')}`;
        } else if (isTrial) {
            serial = `TRIAL-${generateSerial().split('-').slice(1).join('-')}`;
        } else {
            serial = generateSerial();
        }

        setGeneratedKey(serial);

        try {
            const now = new Date();
            const expireDate = new Date();
            let collectionLimit = null;

            if (formData.license_type === 'TRIAL') {
                expireDate.setDate(now.getDate() + 5);
                collectionLimit = 500;
            } else if (formData.license_type === 'TEST') {
                expireDate.setDate(now.getDate() + 1);
                collectionLimit = 100;
            } else if (formData.license_type === '1M') {
                expireDate.setMonth(now.getMonth() + 1);
            } else if (formData.license_type === '3M') {
                expireDate.setMonth(now.getMonth() + 3);
            } else if (formData.license_type === '6M') {
                expireDate.setMonth(now.getMonth() + 6);
            } else if (formData.license_type === '1Y') {
                expireDate.setFullYear(now.getFullYear() + 1);
            } else if (formData.license_type === 'LIFETIME') {
                expireDate.setFullYear(now.getFullYear() + 99);
            }

            const suffix = isTest ? ' (TEST)' : isTrial ? ' (TRIAL)' : '';
            const finalBuyerName = `${formData.buyer_name}${suffix}`;

            const { error } = await supabase
                .from('licenses')
                .insert([{
                    ...formData,
                    buyer_name: finalBuyerName,
                    serial_key: serial,
                    expire_date: expireDate.toISOString(),
                    collection_limit: collectionLimit,
                    status: 'unused',
                    bound_value: null,
                    price_sold: Number(formData.price_sold) || 0
                }]);

            if (error) throw error;

        } catch (error: any) {
            console.error("Error creating license:", error);
            alert(`발행 중 오류가 발생했습니다: ${error.message}\n(UID: ${user?.id || 'Not Logged In'})\n관리자에게 문의하거나 Supabase 설정을 확인해주세요.`);
            setGeneratedKey('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            <div className="flex flex-col gap-1.5">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">신규 라이선스 생성</h1>
                <p className="text-xs text-slate-400 font-bold">구매자 정보를 입력하고 제품 인증키를 즉시 발행합니다.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-12 items-start">
                {/* Left Form Column */}
                <Card className="lg:col-span-7 p-0 overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-sm">
                    <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <CardTitle className="text-lg font-black text-slate-900 tracking-tighter">라이선스 정보 입력</CardTitle>
                        <p className="text-xs text-slate-400 font-bold mt-1">각 항목을 정확히 입력해 주세요. 크몽 가격 정책과 연동됩니다.</p>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest ml-0.5">대상 제품 선택</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-12 rounded-xl bg-white px-4 text-sm font-bold border-2 border-slate-350 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all appearance-none cursor-pointer text-slate-900"
                                            value={formData.product_id}
                                            onChange={(e) => handleProductChange(e.target.value)}
                                        >
                                            <option value="NPlace-DB">🏢 NPlace-DB (네이버 플레이스)</option>
                                            <option value="CafeCrawler">☕ CafeCrawler (카페 크롤러)</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest ml-0.5">이용 기간 선택</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-12 rounded-xl bg-white px-4 text-sm font-bold border-2 border-slate-350 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all appearance-none cursor-pointer text-indigo-700"
                                            value={formData.license_type}
                                            onChange={(e) => handleLicenseTypeChange(e.target.value)}
                                        >
                                            <optgroup label="크몽 공식 3대 패키지">
                                                <option value="TRIAL">DELUXE (5일 체험판)</option>
                                                <option value="6M">STANDARD (6개월 이용권)</option>
                                                <option value="LIFETIME">PREMIUM (영구 소장본)</option>
                                            </optgroup>
                                            <optgroup label="어드민 전용 패키지">
                                                <option value="TEST">임시 테스트 (1일)</option>
                                                <option value="1M">1개월권</option>
                                                <option value="3M">3개월권</option>
                                                <option value="1Y">1년권</option>
                                            </optgroup>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ChevronRight className="w-4 h-4 text-indigo-400 rotate-90" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-900 uppercase tracking-widest ml-0.5">구매자 상세 정보 (성함/업체명)</label>
                                <Input
                                    required
                                    placeholder="구매자 정보를 입력하세요 (체험판/테스트 키인 경우 뒤에 접미사가 붙습니다)"
                                    className="h-12 bg-white border-2 border-slate-350 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 text-sm font-bold px-4 rounded-xl text-slate-900 placeholder:text-slate-300"
                                    value={formData.buyer_name}
                                    onChange={e => setFormData({ ...formData, buyer_name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest ml-0.5">연락처 / 채널</label>
                                    <div className="flex gap-2">
                                        <Input placeholder="연락처 (이메일 등)" className="h-12 bg-white border-2 border-slate-350 text-sm font-bold px-4 text-slate-900 rounded-xl flex-1" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} />
                                        <select
                                            className="w-28 h-12 rounded-xl bg-white px-3 text-xs font-bold border-2 border-slate-350 outline-none text-slate-700"
                                            value={formData.channel}
                                            onChange={e => setFormData({ ...formData, channel: e.target.value })}
                                        >
                                            <option value="크몽">크몽</option>
                                            <option value="블로그">블로그</option>
                                            <option value="지인">지인</option>
                                            <option value="기타">기타</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest ml-0.5">판매 가격 (KRW)</label>
                                    <Input placeholder="금액 입력" className="h-12 bg-white border-2 border-slate-350 text-sm font-bold px-4 text-slate-900 rounded-xl" value={formData.price_sold} onChange={e => setFormData({ ...formData, price_sold: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-900 uppercase tracking-widest ml-0.5">메모 (특이사항)</label>
                                <Input placeholder="관리용 메모 입력" className="h-12 bg-white border-2 border-slate-350 text-sm font-bold px-4 text-slate-900 rounded-xl" value={formData.memo} onChange={e => setFormData({ ...formData, memo: e.target.value })} />
                            </div>

                            <Button type="submit" className="w-full h-16 text-white font-black text-lg shadow-md hover:bg-indigo-700 active:scale-[0.99] transition-all bg-indigo-600 rounded-xl border-b-4 border-indigo-900" isLoading={loading}>
                                라이선스 즉시 발행하기 <ChevronRight className="ml-1 w-5 h-5" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Right Column: Key Output & Interactive Pricing Table */}
                <div className="lg:col-span-5 space-y-6">
                    <AnimatePresence>
                        {generatedKey && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                <Card className={`${(generatedKey.startsWith('TEST-') || generatedKey.startsWith('TRIAL-')) ? 'bg-emerald-600' : 'bg-indigo-600'} text-white p-6 space-y-4 shadow-soft rounded-2xl border-none`}>
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
                                            {(generatedKey.startsWith('TEST-') || generatedKey.startsWith('TRIAL-')) ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                        </div>
                                        <h4 className="font-black text-sm">
                                            {(generatedKey.startsWith('TEST-') || generatedKey.startsWith('TRIAL-')) ? '체험판/테스트 키 발급 완료' : '정식 라이선스 발급 완료'}
                                        </h4>
                                    </div>
                                    <div className="rounded-xl bg-white/10 p-4 text-center">
                                        <p className="font-mono text-base font-black tracking-wider">{generatedKey}</p>
                                    </div>
                                    <Button
                                        onClick={() => { navigator.clipboard.writeText(generatedKey); alert('Copy Success!'); }}
                                        fullWidth
                                        className="bg-white text-slate-900 hover:bg-slate-50 h-12 font-bold text-xs rounded-xl"
                                    >
                                        <Copy className="mr-2 h-4 w-4" /> 키 복사하기
                                    </Button>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {!generatedKey && (
                        <Card className="bg-slate-100/50 border-dashed border-2 border-slate-200 shadow-none flex flex-col items-center justify-center p-6 text-center gap-3 min-h-[140px] rounded-2xl">
                            <Key className="w-8 h-8 text-slate-350" />
                            <p className="text-slate-400 font-bold text-xs">정보를 입력하고 이용 기간을 선택하면<br />인증키가 생성됩니다.</p>
                        </Card>
                    )}

                    {/* Interactive Pricing Policy Table */}
                    <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                                📋 3Monster 제품별 가격표 (초안/확정)
                            </h3>
                            <p className="text-[10px] text-slate-400 font-semibold mt-1">
                                크몽 판매 스펙에 따라 표준가격을 수정 및 상태를 관리할 수 있습니다.
                            </p>
                        </div>
                        <div className="space-y-4">
                            {['NPlace-DB', 'CafeCrawler'].map((prod) => {
                                const prodPricing = pricing.filter(p => p.product === prod);
                                return (
                                    <div key={prod} className="space-y-2 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                                        <h4 className="font-black text-xs text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                                            <span>{prod === 'NPlace-DB' ? '🏢 NPLace_DB' : '☕ 카페 크롤러'}</span>
                                            <span className="text-[9px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                                                {prod === 'NPlace-DB' ? '6월 출시 확정' : '7월 출시 예정'}
                                            </span>
                                        </h4>
                                        <div className="space-y-2 px-1">
                                            {prodPricing.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between gap-2 text-xs">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-800">{item.label}</span>
                                                        <span className="text-[9px] text-slate-400 font-mono uppercase">{item.pkg}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <div className="relative flex items-center">
                                                            <input
                                                                type="number"
                                                                className="w-20 h-7 text-right pr-4 pl-1 font-bold border border-slate-250 rounded text-slate-850 focus:border-indigo-500 focus:outline-none text-[11px]"
                                                                value={item.price}
                                                                onChange={(e) => handleUpdatePrice(item.id, Number(e.target.value))}
                                                            />
                                                            <span className="absolute right-1 text-[9px] text-slate-400 font-bold pointer-events-none">원</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleStatus(item.id)}
                                                            className={cn(
                                                                "px-2 py-0.5 rounded text-[10px] font-black border transition-all cursor-pointer",
                                                                item.status === '확정'
                                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-250 hover:bg-emerald-100/50"
                                                                    : "bg-amber-50 text-amber-600 border-amber-250 hover:bg-amber-100/50"
                                                            )}
                                                        >
                                                            {item.status}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] text-slate-500 font-semibold space-y-1">
                            <p className="font-black text-slate-700 flex items-center gap-1">🛡️ 크몽 판매 정책 요약 가이드</p>
                            <p>• <b>스탠다드(TRIAL)</b>: 5일 체험 / 5,000원 결제 유도 (크몽 지수 깡패 전략)</p>
                            <p>• <b>STANDARD</b>: 6개월권 / 99,000원 결제 (월 1.6만 대체 불가능 가성비)</p>
                            <p>• <b>PREMIUM</b>: 영구 패키지 / 198,000원 결제 (마케팅 프로그램 월세 해방)</p>
                            <p>• 모든 스탠다드 이상 상품에는 <b>무상 엔진 업데이트 및 A/S</b>가 포함됩니다.</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
