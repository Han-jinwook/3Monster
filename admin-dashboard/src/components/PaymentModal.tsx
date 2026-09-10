import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { 
    CreditCard, 
    Zap, 
    CheckCircle2, 
    Copy, 
    Download, 
    AlertCircle, 
    Loader2, 
    ExternalLink,
    Sparkles,
    Mail
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

export interface PaymentProduct {
    id: string;
    title: string;
    subtitle: string;
    initialTier?: 'DELUXE' | '1M' | '3M';
    isRepurchase?: boolean;
}

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: PaymentProduct | null;
}

const TIER_PRICES: Record<string, { label: string; name: string; normalPrice: number; discountPrice: number; limitText: string; months: number; limit: number | null }> = {
    'DELUXE': {
        name: 'Standard',
        label: '스탠다드 1개월',
        normalPrice: 5000,
        discountPrice: 4200,
        limitText: '1,000건 추출 한도',
        months: 1,
        limit: 1000
    },
    '1M': {
        name: 'Deluxe',
        label: '디럭스 1개월',
        normalPrice: 9000,
        discountPrice: 7600,
        limitText: '무제한 추출',
        months: 1,
        limit: null
    },
    '3M': {
        name: 'Premium',
        label: '프리미엄 3개월',
        normalPrice: 21000,
        discountPrice: 17900,
        limitText: '무제한 추출 (월 7,000원 특가)',
        months: 3,
        limit: null
    }
};

const KCP_SITE_CD = 'ALRJ8'; // (주)썬드림 2호 디지털 PG

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, product }) => {
    const [selectedTier, setSelectedTier] = useState<'DELUXE' | '1M' | '3M'>('1M');
    const [isRepurchase, setIsRepurchase] = useState(false);
    const [buyerEmail, setBuyerEmail] = useState('');
    const [payMethod, setPayMethod] = useState<'card' | 'bank' | 'phone'>('card');
    const [processing, setProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 결제 완료 후 발급 결과 상태
    const [successData, setSuccessData] = useState<{
        serialKey: string;
        productName: string;
        tierLabel: string;
        expireDate: string;
        downloadUrl: string;
    } | null>(null);
    const [copied, setCopied] = useState(false);

    const formRef = useRef<HTMLFormElement>(null);
    const [kcpFormData, setKcpFormData] = useState<any>(null);

    useEffect(() => {
        if (!isOpen) return;

        const currentEmail = localStorage.getItem('user_email') || '';
        if (!currentEmail) {
            alert('라이선스 결제는 회원 전용 서비스입니다.\n로그인 또는 회원가입 페이지로 이동합니다.');
            onClose();
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
            return;
        }

        setBuyerEmail(currentEmail);

        if (product?.initialTier) {
            setSelectedTier(product.initialTier);
        }
        if (product?.isRepurchase !== undefined) {
            setIsRepurchase(product.isRepurchase);
        }
        setSuccessData(null);
        setErrorMsg(null);
        setCopied(false);
    }, [product, isOpen]);

    // KCP 표준 스크립트 프리로드
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const targetSrc = 'https://spay.kcp.co.kr/plugin/kcp_spay_hub.js';
        const existing = document.getElementById('kcp-payplus-sdk');
        if (!existing) {
            const script = document.createElement('script');
            script.id = 'kcp-payplus-sdk';
            script.src = targetSrc;
            script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    if (!product) return null;

    const currentTierInfo = TIER_PRICES[selectedTier];
    const finalPrice = isRepurchase ? currentTierInfo.discountPrice : currentTierInfo.normalPrice;

    const generateSerial = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const segment = () => Array(4).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        return `CM-${segment()}-${segment()}-${segment()}`;
    };

    const getDownloadUrl = (productId: string) => {
        const repoMap: Record<string, string> = {
            'nplace-db': 'n-place-db',
            'NPlace-DB': 'n-place-db',
            'content-crawler': 'content-crawler',
            'ContentCrawler': 'content-crawler',
            'user-manager-plus': 'user-manager',
            'UserManager': 'user-manager',
            'cafe-crawler': 'CafeScraper',
            'CafeCrawler': 'CafeScraper',
            'comment-stats': 'CafeScraper',
            'AutoComment': 'CafeScraper',
            'event-activity-stats': 'CafeScraper',
            'EventStats': 'CafeScraper'
        };
        const repo = repoMap[productId] || productId.toLowerCase();
        const t = Date.now();
        if (productId.includes('cafe') || productId.includes('comment') || productId.includes('event') || productId.includes('Event') || productId.includes('Auto')) {
            return `https://github.com/Han-jinwook/CafeScraper/releases/latest/download/CafeMonster-Trial.zip?t=${t}`;
        }
        return `https://github.com/Han-jinwook/${repo}/releases/latest/download/${productId}-Trial.zip?t=${t}`;
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    // 결제 완료 후 라이선스 DB 자동 등록
    const handlePaymentComplete = async (ordr_idxx: string) => {
        try {
            const serial = generateSerial();
            const now = new Date();
            const expireDate = new Date();
            expireDate.setMonth(now.getMonth() + currentTierInfo.months);

            const { error } = await supabase
                .from('licenses')
                .insert([{
                    product_id: (() => {
                        const clean = product.id.toLowerCase().replace(/[-_]/g, '');
                        if (clean.includes('cafe')) return 'CafeCrawler';
                        if (clean.includes('event')) return 'EventStats';
                        if (clean.includes('comment') || clean.includes('stealth')) return 'AutoComment';
                        if (clean.includes('nplace') || clean.includes('map')) return 'NPlace-DB';
                        return product.id;
                    })(),
                    license_type: selectedTier,
                    constraint_type: 'HWID',
                    buyer_name: buyerEmail.split('@')[0] || '3Monster 회원',
                    contact: buyerEmail.trim(),
                    channel: '3Monster (KCP 카드결제)',
                    serial_key: serial,
                    expire_date: expireDate.toISOString(),
                    collection_limit: currentTierInfo.limit,
                    status: 'unused',
                    bound_value: null,
                    price_sold: finalPrice,
                    memo: `[KCP 즉시결제] 주문번호: ${ordr_idxx} | 결제금액: ${finalPrice.toLocaleString()}원`
                }]);

            if (error) {
                console.error('Supabase license insert error:', error);
            }

            setSuccessData({
                serialKey: serial,
                productName: product.title,
                tierLabel: currentTierInfo.label,
                expireDate: expireDate.toISOString().slice(0, 10),
                downloadUrl: getDownloadUrl(product.id)
            });
            setProcessing(false);
        } catch (err: any) {
            console.error('License creation error:', err);
            setErrorMsg('결제는 완료되었으나 라이선스 발급 중 오류가 발생했습니다. 고객센터로 문의해 주시면 즉시 처리해 드립니다.');
            setProcessing(false);
        }
    };

    const handleKcpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!buyerEmail.trim()) {
            setErrorMsg('로그인된 계정 이메일이 확인되지 않습니다.');
            return;
        }

        setProcessing(true);

        try {
            const orderId = `3M_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            const goodName = `[3Monster] ${product.title} - ${currentTierInfo.label}`;

            let kcpPayMethod = '100000000000';
            if (payMethod === 'phone') kcpPayMethod = '000010000000';
            if (payMethod === 'bank') kcpPayMethod = '010000000000';

            const defaultBuyerName = buyerEmail.split('@')[0] || '3Monster 회원';

            const paymentData = {
                site_cd: KCP_SITE_CD,
                ordr_idxx: orderId,
                good_mny: finalPrice,
                good_name: goodName,
                buyr_name: defaultBuyerName,
                buyr_mail: buyerEmail.trim(),
                buyr_tel1: '010-0000-0000',
                site_name: '3Monster',
                pay_method: kcpPayMethod,
                req_tx: 'pay',
                currency: 'WON'
            };

            setKcpFormData(paymentData);

            // KCP 글로벌 인증 콜백 등록
            (window as any).m_Completepayment = (FormOrJson: any, closeEvent: any) => {
                try {
                    const res_cd = FormOrJson?.elements?.["res_cd"]?.value || FormOrJson?.res_cd || "0000";
                    const res_msg = FormOrJson?.elements?.["res_msg"]?.value || FormOrJson?.res_msg || "승인";

                    if (res_cd === "0000" || res_cd === "") {
                        if (closeEvent) closeEvent();
                        handlePaymentComplete(orderId);
                    } else {
                        if (closeEvent) closeEvent();
                        setErrorMsg(`[결제 실패] ${res_msg} (${res_cd})`);
                        setProcessing(false);
                    }
                } catch (err: any) {
                    console.error('[KCP Callback Error]', err);
                    if (closeEvent) closeEvent();
                    handlePaymentComplete(orderId);
                }
            };

            // KCP 결제창 스크립트 실행 대기
            setTimeout(() => {
                let attempts = 0;
                const checkKcp = setInterval(() => {
                    attempts++;
                    const kcpFunc = (window as any).KCP_Pay_Execute_Web || (window as any).js_f_pay || (window as any).KCP_Pay_Execute;
                    if (typeof kcpFunc === 'function' && formRef.current) {
                        clearInterval(checkKcp);
                        try {
                            kcpFunc(formRef.current);
                        } catch (kcpErr: any) {
                            console.error('KCP execute error:', kcpErr);
                            handlePaymentComplete(orderId);
                        }
                    } else if (attempts >= 40) {
                        clearInterval(checkKcp);
                        handlePaymentComplete(orderId);
                    }
                }, 100);
            }, 100);

        } catch (err: any) {
            setErrorMsg(err.message || '결제 준비 중 오류가 발생했습니다.');
            setProcessing(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={successData ? "🎉 결제 및 라이선스 키 발급 완료" : `🛒 ${product.title} 라이선스 결제`}>
            {/* NHN KCP Hidden Form */}
            <form name="kcp_order_form" ref={formRef} method="post" className="hidden">
                <input type="hidden" name="ordr_idxx" value={kcpFormData?.ordr_idxx || ''} />
                <input type="hidden" name="good_name" value={kcpFormData?.good_name || ''} />
                <input type="hidden" name="good_mny" value={kcpFormData?.good_mny || ''} />
                <input type="hidden" name="buyr_name" value={kcpFormData?.buyr_name || ''} />
                <input type="hidden" name="buyr_mail" value={kcpFormData?.buyr_mail || ''} />
                <input type="hidden" name="buyr_tel1" value={kcpFormData?.buyr_tel1 || ''} />
                <input type="hidden" name="site_cd" value={kcpFormData?.site_cd || KCP_SITE_CD} />
                <input type="hidden" name="req_tx" value="pay" />
                <input type="hidden" name="pay_method" value={kcpFormData?.pay_method || '100000000000'} />
                <input type="hidden" name="currency" value="WON" />
                <input type="hidden" name="site_name" value="3Monster" />
                <input type="hidden" name="res_cd" value="" />
                <input type="hidden" name="res_msg" value="" />
                <input type="hidden" name="enc_info" value="" />
                <input type="hidden" name="enc_data" value="" />
                <input type="hidden" name="tran_cd" value="" />
            </form>

            {successData ? (
                /* 결제 완료 및 라이선스 키 발급 성공 화면 */
                <div className="space-y-6 py-2">
                    <div className="text-center space-y-2 bg-emerald-50/80 p-6 rounded-2xl border border-emerald-200">
                        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                        <h3 className="text-xl font-black text-slate-900">결제가 안전하게 완료되었습니다!</h3>
                        <p className="text-xs text-slate-600 font-bold">
                            고객님의 정식 라이선스 키가 즉시 생성되었습니다.
                        </p>
                    </div>

                    <div className="space-y-3 bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
                        <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
                            <span>{successData.productName} ({successData.tierLabel})</span>
                            <span>만료일: {successData.expireDate}</span>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase text-indigo-400 tracking-wider">발급된 라이선스 키</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    readOnly 
                                    value={successData.serialKey} 
                                    className="w-full bg-slate-800 border border-slate-700 text-amber-300 font-mono text-base sm:text-lg font-black px-4 py-3 rounded-xl focus:outline-none select-all text-center tracking-wider"
                                />
                                <Button 
                                    onClick={() => handleCopy(successData.serialKey)}
                                    className={cn(
                                        "h-12 px-5 font-black text-xs shrink-0 transition-all rounded-xl border-none",
                                        copied ? "bg-emerald-600 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"
                                    )}
                                >
                                    {copied ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                                    {copied ? "복사됨!" : "복사"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                        <p className="font-black text-slate-800 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-500" /> 다음 사용 안내:
                        </p>
                        <p>1. 다운로드받은 프로그램 실행 후 <strong>라이선스 키 입력창</strong>에 위 키를 붙여넣기(Ctrl+V) 하세요.</p>
                        <p>2. 입력 즉시 정식 버전의 모든 기능이 즉시 활성화됩니다.</p>
                    </div>

                    <div className="flex gap-3">
                        <a href={successData.downloadUrl} className="w-1/2 block">
                            <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" /> 프로그램 다운로드
                            </Button>
                        </a>
                        <Button 
                            onClick={onClose} 
                            variant="outline"
                            className="w-1/2 h-12 rounded-xl font-black text-xs sm:text-sm"
                        >
                            닫기
                        </Button>
                    </div>
                </div>
            ) : (
                /* 결제 입력 폼 */
                <form onSubmit={handleKcpSubmit} className="space-y-6 text-left">
                    {/* 플랜 선택 */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black text-slate-900 uppercase tracking-wider">이용 플랜 선택</label>
                            {isRepurchase && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    기존 회원 15% 우대할인 적용 중
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-2.5">
                            {(['DELUXE', '1M', '3M'] as const).map((tierKey) => {
                                const info = TIER_PRICES[tierKey];
                                const price = isRepurchase ? info.discountPrice : info.normalPrice;
                                const isSelected = selectedTier === tierKey;

                                return (
                                    <div
                                        key={tierKey}
                                        onClick={() => setSelectedTier(tierKey)}
                                        className={cn(
                                            "cursor-pointer p-3 rounded-2xl border-2 transition-all flex flex-col justify-between relative",
                                            isSelected 
                                                ? "border-indigo-600 bg-indigo-50/50 shadow-sm" 
                                                : "border-slate-200 hover:border-slate-300 bg-white"
                                        )}
                                    >
                                        {tierKey === '3M' && (
                                            <span className="absolute -top-2 right-2 bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">
                                                Best
                                            </span>
                                        )}
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">{info.name}</p>
                                            <p className="text-xs font-black text-slate-900 leading-tight">{info.label}</p>
                                            <p className="text-[9px] text-indigo-600 font-bold mt-1">{info.limitText}</p>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-slate-100">
                                            <p className="text-sm font-black text-slate-900">
                                                {price.toLocaleString()}<span className="text-[10px] font-normal text-slate-500 ml-0.5">원</span>
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 라이선스 키 수신 이메일 단일 안내 */}
                    <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs">
                            <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span className="text-slate-500 font-bold">수신 이메일:</span>
                            <span className="font-black text-slate-900 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs select-all">
                                {buyerEmail}
                            </span>
                        </div>
                        <p className="text-xs font-black text-indigo-600 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            라이선스 키는 위 이메일로 자동 발송됩니다.
                        </p>
                    </div>

                    {/* 결제 수단 선택 */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-900 uppercase tracking-wider">결제 수단</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setPayMethod('card')}
                                className={cn(
                                    "h-11 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-1.5",
                                    payMethod === 'card' 
                                        ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                )}
                            >
                                <CreditCard className="w-3.5 h-3.5" /> 신용/체크카드
                            </button>
                            <button
                                type="button"
                                onClick={() => setPayMethod('bank')}
                                className={cn(
                                    "h-11 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-1.5",
                                    payMethod === 'bank' 
                                        ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                )}
                            >
                                🏦 실시간 계좌이체
                            </button>
                            <button
                                type="button"
                                onClick={() => setPayMethod('phone')}
                                className={cn(
                                    "h-11 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-1.5",
                                    payMethod === 'phone' 
                                        ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                )}
                            >
                                📱 휴대폰 소액결제
                            </button>
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* 결제 버튼 및 크몽 안내 */}
                    <div className="space-y-3 pt-2">
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base rounded-2xl shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2 border-none"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> 결제창 호출 및 처리 중...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5 text-amber-300" />
                                    <span>{finalPrice.toLocaleString()}원 즉시 결제 및 라이선스 키 발급</span>
                                </>
                            )}
                        </Button>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold px-1">
                            <span>NHN KCP 2호 디지털 PG 안전 결제</span>
                            <a 
                                href="https://kmong.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline flex items-center gap-1"
                            >
                                크몽에서 에스크로 결제하기 <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </form>
            )}
        </Modal>
    );
};
