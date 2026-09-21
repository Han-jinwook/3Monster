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
    ShieldCheck,
    Sparkles,
    Mail,
    BookOpen
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

export type SubscriptionTierKey = 
    | 'START_1M' | 'START_1Y'
    | 'PLUS_1M' | 'PLUS_1Y'
    | 'PRO_1M' | 'PRO_1Y'
    | 'DELUXE' | '1M' | '3M';

export interface PaymentProduct {
    id: string;
    title: string;
    subtitle: string;
    initialTier?: SubscriptionTierKey;
    billingCycle?: 'monthly' | 'annual';
    isRepurchase?: boolean; // 레거시 호환용 (사용 안함)
}

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: PaymentProduct | null;
}

export interface TierInfo {
    label: string;
    name: string;
    tier: 'START' | 'PLUS' | 'PRO';
    cycle: '1M' | '1Y';
    normalPrice: number;
    discountPrice: number;
    monthlyEquivalent: number;
    limitText: string;
    months: number;
    limit: number | null;
    badge?: string;
    features: string[];
}

export const TIER_PRICES: Record<SubscriptionTierKey, TierInfo> = {
    'START_1M': {
        name: 'Start',
        label: '스타트 30일 이용권 (1,000건)',
        tier: 'START',
        cycle: '1M',
        normalPrice: 5000,
        discountPrice: 5000,
        monthlyEquivalent: 5000,
        limitText: '1,000건 맛보기 추출',
        months: 1,
        limit: 1000,
        features: ['1,000건 추출 한도', '구독 기간 내 이메일 무제한 발송', '구독 기간 내 인스타DM 무제한 발송']
    },
    'START_1Y': {
        name: 'Start',
        label: '스타트 1년 연간이용권 (총 42,000원)',
        tier: 'START',
        cycle: '1Y',
        normalPrice: 42000,
        discountPrice: 42000,
        monthlyEquivalent: 3500,
        limitText: '연 12,000건 (연간 총 42,000원)',
        months: 12,
        limit: 12000,
        badge: '30% 할인',
        features: ['연 12,000건 연간 총량 자유 소진', '구독 기간 내 이메일 무제한 발송', '구독 기간 내 인스타DM 무제한 발송']
    },
    'PLUS_1M': {
        name: 'Plus',
        label: '플러스 30일 이용권 (무제한)',
        tier: 'PLUS',
        cycle: '1M',
        normalPrice: 9000,
        discountPrice: 9000,
        monthlyEquivalent: 9000,
        limitText: '🔥 무제한 추출',
        months: 1,
        limit: null,
        badge: '👑 가성비 1위 추천',
        features: ['건수 제한 없는 무제한 추출', '구독 기간 내 이메일 무제한 발송', '구독 기간 내 인스타DM 무제한 발송', '20대 업종별 실전 콜드문자 템플릿']
    },
    'PLUS_1Y': {
        name: 'Plus',
        label: '플러스 1년 연간이용권 (총 75,600원)',
        tier: 'PLUS',
        cycle: '1Y',
        normalPrice: 75600,
        discountPrice: 75600,
        monthlyEquivalent: 6300,
        limitText: '1년 무제한 (연간 총 75,600원)',
        months: 12,
        limit: null,
        badge: '👑 최고인기 (30% 할인)',
        features: ['1년 내내 무제한 추출', '구독 기간 내 이메일 무제한 발송', '구독 기간 내 인스타DM 무제한 발송', '20대 업종별 실전 콜드문자 템플릿']
    },
    'PRO_1M': {
        name: 'Pro',
        label: '프로 3개월 특가 (무제한)',
        tier: 'PRO',
        cycle: '1M',
        normalPrice: 21000,
        discountPrice: 21000,
        monthlyEquivalent: 7000,
        limitText: '3개월 무제한 (총 21,000원)',
        months: 3,
        limit: null,
        badge: '대행사/영업팀 특가',
        features: ['3개월 내내 무제한 추출', '구독 기간 내 이메일 무제한 발송', '구독 기간 내 인스타DM 무제한 발송', '로직 변경 시 무상 우선 패치']
    },
    'PRO_1Y': {
        name: 'Pro',
        label: '프로 1년 연간이용권 (준비중)',
        tier: 'PRO',
        cycle: '1Y',
        normalPrice: 0,
        discountPrice: 0,
        monthlyEquivalent: 0,
        limitText: '연간 구독 준비중',
        months: 12,
        limit: null,
        badge: '준비중',
        features: ['1년 내내 무제한 추출', '구독 기간 내 이메일 무제한 발송', '구독 기간 내 인스타DM 무제한 발송', 'VIP 기술 지원 & 우선 로직 패치']
    },
    // 기존 호환성 유지 매핑
    'DELUXE': {
        name: 'Start',
        label: '스타트 30일 이용권 (1,000건)',
        tier: 'START',
        cycle: '1M',
        normalPrice: 5000,
        discountPrice: 5000,
        monthlyEquivalent: 5000,
        limitText: '1,000건 맛보기 추출',
        months: 1,
        limit: 1000,
        features: ['1,000건 추출 한도', '구독 기간 내 이메일 무제한 발송', '구독 기간 내 인스타DM 무제한 발송']
    },
    '1M': {
        name: 'Plus',
        label: '플러스 30일 이용권 (무제한)',
        tier: 'PLUS',
        cycle: '1M',
        normalPrice: 9000,
        discountPrice: 9000,
        monthlyEquivalent: 9000,
        limitText: '🔥 무제한 추출',
        months: 1,
        limit: null,
        badge: '👑 가성비 1위 추천',
        features: ['건수 제한 없는 무제한 추출', '구독 기간 내 이메일 무제한 발송', '구독 기간 내 인스타DM 무제한 발송', '20대 업종별 실전 콜드문자 템플릿']
    },
    '3M': {
        name: 'Pro',
        label: '프로 3개월 특가 (무제한)',
        tier: 'PRO',
        cycle: '1M',
        normalPrice: 21000,
        discountPrice: 21000,
        monthlyEquivalent: 7000,
        limitText: '3개월 무제한 (월 7,000원꼴)',
        months: 3,
        limit: null,
        badge: '대행사/영업팀 특가',
        features: ['3개월 내내 무제한 추출', '구독 기간 내 이메일 무제한 발송', '구독 기간 내 인스타DM 무제한 발송', '로직 변경 시 무상 우선 패치']
    }
};

const KCP_SITE_CD = 'ALRJ8'; // (주)썬드림 2호 디지털 PG

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, product }) => {
    const [selectedTier, setSelectedTier] = useState<SubscriptionTierKey>('PLUS_1M');
    const [modalBillingCycle, setModalBillingCycle] = useState<'monthly' | 'annual'>('monthly');
    const [buyerEmail, setBuyerEmail] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 결제 완료 후 발급 결과 상태
    const [successData, setSuccessData] = useState<{
        serialKey: string;
        productName: string;
        tierLabel: string;
        expireDate: string;
        downloadUrl: string;
        docsUrl?: string;
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
            let targetTier = product.initialTier;
            if (targetTier === 'DELUXE') targetTier = 'START_1M';
            else if (targetTier === '1M') targetTier = 'PLUS_1M';
            else if (targetTier === '3M') targetTier = 'PRO_1M';

            setSelectedTier(targetTier);
            if (targetTier.endsWith('_1Y')) {
                setModalBillingCycle('annual');
            } else {
                setModalBillingCycle('monthly');
            }
        } else if (product?.billingCycle) {
            setModalBillingCycle(product.billingCycle);
            setSelectedTier(product.billingCycle === 'annual' ? 'PLUS_1Y' : 'PLUS_1M');
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
    const finalPrice = currentTierInfo.normalPrice;

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

    // 라이선스 키 이메일 자동 발송 (Resend API)
    const sendLicenseEmail = async ({
        email,
        productTitle,
        tierLabel,
        serialKey,
        expireDate,
        downloadUrl,
        docsUrl,
        orderId,
        price
    }: {
        email: string;
        productTitle: string;
        tierLabel: string;
        serialKey: string;
        expireDate: string;
        downloadUrl: string;
        docsUrl: string;
        orderId: string;
        price: number;
    }) => {
        try {
            const apiKey = import.meta.env.VITE_RESEND_API_KEY;
            if (!apiKey) {
                console.warn('VITE_RESEND_API_KEY is not configured');
                return;
            }

            const res = await fetch('/api/resend/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: '3Monster <admin@3monster.net>',
                    to: [email.trim()],
                    subject: `[3Monster] ${productTitle} (${tierLabel}) 정식 라이선스 키 발급 안내`,
                    html: `
                        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 30px; background-color: #f8fafc; color: #1e293b; line-height: 1.6;">
                            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
                                <div style="background: #0f172a; padding: 32px 24px; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.03em;">3Monster</h1>
                                    <p style="color: #94a3b8; font-size: 13px; font-weight: 600; margin: 8px 0 0 0;">소프트웨어 정식 라이선스 발급 완료</p>
                                </div>
                                <div style="padding: 32px 28px;">
                                    <div style="text-align: center; margin-bottom: 24px;">
                                        <div style="display: inline-block; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; padding: 6px 16px; color: #059669; font-size: 12px; font-weight: 800; margin-bottom: 12px;">
                                            ✔ 결제 및 발급 승인 완료
                                        </div>
                                        <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0;">${productTitle}</h2>
                                        <p style="font-size: 13px; color: #64748b; margin: 0;">플랜: <strong>${tierLabel}</strong> · 만료일: <strong>${expireDate}</strong></p>
                                    </div>
                                    <div style="background: #0f172a; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center; border: 1px solid #1e293b;">
                                        <div style="color: #818cf8; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;">정식 라이선스 키 (Serial Key)</div>
                                        <div style="font-family: monospace; font-size: 20px; font-weight: 900; color: #fde047; letter-spacing: 0.08em; background: #1e293b; padding: 12px 16px; border-radius: 10px; word-break: break-all; border: 1px dashed #475569;">
                                            ${serialKey}
                                        </div>
                                    </div>
                                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 24px; font-size: 13px; color: #475569;">
                                        <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 800; color: #0f172a;">⚡ 프로그램 등록 및 실행 안내</h4>
                                        <p style="margin: 4px 0;">1. 아래 [프로그램 다운로드] 버튼을 눌러 압축 파일을 다운로드 후 압축을 해제합니다.</p>
                                        <p style="margin: 4px 0;">2. 프로그램을 실행한 뒤 <strong>[라이선스 키 입력]</strong> 창에 위 시리얼키를 붙여넣기(Ctrl+V) 하세요.</p>
                                        <p style="margin: 4px 0;">3. 입력 즉시 기기(HWID)에 정식 등록되어 모든 기능을 정상 이용하실 수 있습니다.</p>
                                    </div>
                                    <div style="text-align: center; margin: 24px 0 16px 0;">
                                        <a href="${downloadUrl}" style="display: inline-block; background: #059669; color: #ffffff; text-decoration: none; padding: 14px 28px; font-size: 14px; font-weight: 800; border-radius: 12px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); margin: 6px;">
                                            🚀 프로그램 다운로드 바로가기
                                        </a>
                                        <a href="${docsUrl}" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 28px; font-size: 14px; font-weight: 800; border-radius: 12px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); margin: 6px;">
                                            📖 설치 & 사용 가이드 확인하기 →
                                        </a>
                                    </div>
                                    <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 24px; font-size: 11px; color: #94a3b8;">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                            <span>주문번호: ${orderId}</span>
                                            <span>결제금액: ${price.toLocaleString()}원</span>
                                        </div>
                                        <p style="margin: 8px 0 0 0;">※ 본 메일은 발신전용입니다. 문의사항은 3Monster 공식 홈페이지 고객센터(Q&A)를 이용해 주시기 바랍니다.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
                })
            });

            if (!res.ok) {
                console.warn('Resend email response status:', res.status);
            } else {
                console.log('✅ License key email sent successfully to:', email);
            }
        } catch (emailErr) {
            console.error('License key email dispatch failed:', emailErr);
        }
    };

    // 결제 완료 후 라이선스 DB 자동 등록
    const handlePaymentComplete = async (ordr_idxx: string) => {
        try {
            const serial = generateSerial();
            const now = new Date();
            const expireDate = new Date();
            expireDate.setMonth(now.getMonth() + currentTierInfo.months);
            const downloadUrl = getDownloadUrl(product.id);
            const docsUrl = `https://sundreamer.app/docs/${product.id}`;
            const expireDateStr = expireDate.toISOString().slice(0, 10);

            const prodClean = (() => {
                const clean = product.id.toLowerCase().replace(/[-_]/g, '');
                if (clean.includes('cafe')) return 'CafeCrawler';
                if (clean.includes('event')) return 'EventStats';
                if (clean.includes('comment') || clean.includes('stealth')) return 'AutoComment';
                if (clean.includes('nplace') || clean.includes('map')) return 'NPlace-DB';
                return product.id;
            })();

            const buyerClean = buyerEmail.trim().toLowerCase();
            const buyerNick = buyerClean.split('@')[0] || '3Monster 회원';

            // 1. Supabase licenses 테이블에 정식 라이선스 발급
            const { error: licError } = await supabase
                .from('licenses')
                .insert([{
                    product_id: prodClean,
                    license_type: selectedTier,
                    constraint_type: 'HWID',
                    buyer_name: buyerNick,
                    contact: buyerClean,
                    channel: '3Monster (KCP 카드결제)',
                    serial_key: serial,
                    expire_date: expireDate.toISOString(),
                    collection_limit: currentTierInfo.limit,
                    status: 'active',
                    used_count: 0,
                    bound_value: null,
                    price_sold: finalPrice,
                    memo: `[KCP 즉시결제] 주문번호: ${ordr_idxx} | 결제금액: ${finalPrice.toLocaleString()}원`
                }]);

            if (licError) {
                console.error('Supabase license insert error (Check RLS policy):', licError);
                // 비상 백업: support_tickets에 구매 이력 자동 기록 (RLS 허용 테이블)
                try {
                    await supabase.from('support_tickets').insert([{
                        uid: '00000000-0000-0000-0000-000000000000',
                        email: buyerClean,
                        issue_type: 'kcp_payment_backup',
                        status: 'open',
                        title: `[KCP 결제완료 백업] ${product.title} (${currentTierInfo.label})`,
                        content: JSON.stringify({
                            ordr_idxx,
                            serial_key: serial,
                            product_id: prodClean,
                            tier: selectedTier,
                            price: finalPrice,
                            expire_date: expireDate.toISOString(),
                            buyer: buyerClean
                        })
                    }]);
                } catch (ticketErr) {
                    console.error('Order backup ticket creation error:', ticketErr);
                }
            }

            // 2. 구매 회원 role을 'buyer'로 업데이트
            try {
                await supabase
                    .from('users')
                    .upsert({
                        email: buyerClean,
                        role: 'buyer',
                        name: buyerNick,
                        channel: '3Monster'
                    }, { onConflict: 'email' });
            } catch (uErr) {
                console.warn('User buyer role sync warning:', uErr);
            }

            // 3. 구매자 이메일로 라이선스 키 자동 발송
            await sendLicenseEmail({
                email: buyerClean,
                productTitle: product.title,
                tierLabel: currentTierInfo.label,
                serialKey: serial,
                expireDate: expireDateStr,
                downloadUrl,
                docsUrl,
                orderId: ordr_idxx,
                price: finalPrice
            });

            // 4. 화면 발급 완료 상태 반영
            setSuccessData({
                serialKey: serial,
                productName: product.title,
                tierLabel: currentTierInfo.label,
                expireDate: expireDateStr,
                downloadUrl,
                docsUrl
            });
            setProcessing(false);
        } catch (err: any) {
            console.error('License creation error:', err);
            setErrorMsg('결제는 완료되었으나 발급 처리 중 지연이 발생했습니다. 발급 키를 확인하시거나 고객센터로 문의해 주시면 즉시 처리해 드립니다.');
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
            const goodName = `[3Monster] 비즈니스 소프트웨어 - ${currentTierInfo.label}`;

            const kcpPayMethod = '100000000000'; // NHN KCP 신용/체크카드 및 간편결제 (카카오페이, 네이버페이, 토스, 앱카드 등)

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
                    const res_cd = FormOrJson?.elements?.["res_cd"]?.value || FormOrJson?.res_cd;
                    const res_msg = FormOrJson?.elements?.["res_msg"]?.value || FormOrJson?.res_msg || "결제가 취소되었습니다.";

                    if (closeEvent) closeEvent();

                    if (res_cd === "0000") {
                        handlePaymentComplete(orderId);
                    } else {
                        setErrorMsg(`[결제 취소/실패] ${res_msg} (${res_cd || 'CANCEL'})`);
                        setProcessing(false);
                    }
                } catch (err: any) {
                    console.error('[KCP Callback Error]', err);
                    if (closeEvent) closeEvent();
                    setErrorMsg('결제 처리 중 오류가 발생했습니다. 고객센터로 문의해 주세요.');
                    setProcessing(false);
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
                            setErrorMsg('결제창 호출 중 오류가 발생했습니다: ' + (kcpErr?.message || '다시 시도해 주세요.'));
                            setProcessing(false);
                        }
                    } else if (attempts >= 40) {
                        clearInterval(checkKcp);
                        setErrorMsg('KCP 결제 모듈을 불러오지 못했습니다. 페이지를 새로고침하거나 브라우저 광고 차단(AdBlock)을 해제한 후 다시 시도해 주세요.');
                        setProcessing(false);
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

                    <div className="space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <a href={successData.downloadUrl} className="block">
                                <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm">
                                    <Download className="w-4 h-4" /> 프로그램 다운로드
                                </Button>
                            </a>
                            <a href={successData.docsUrl || `/docs/${product.id}`} target="_blank" rel="noreferrer" className="block">
                                <Button 
                                    type="button"
                                    variant="outline"
                                    className="w-full h-12 rounded-xl font-black text-xs sm:text-sm border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <BookOpen className="w-4 h-4" /> 📖 설치 & 사용 가이드
                                </Button>
                            </a>
                        </div>
                        <Button 
                            onClick={onClose} 
                            variant="ghost"
                            className="w-full h-10 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-800"
                        >
                            닫기
                        </Button>
                    </div>
                </div>
            ) : (
                /* 결제 입력 폼 */
                <form onSubmit={handleKcpSubmit} className="space-y-6 text-left">
                    {/* 플랜 선택 */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <label className="text-xs font-black text-slate-900 uppercase tracking-wider">구독 플랜 선택</label>
                            
                            {/* 월간 / 연간 30% 할인 토글 */}
                            <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setModalBillingCycle('monthly');
                                        const currentBase = selectedTier.startsWith('START') ? 'START_1M' : selectedTier.startsWith('PRO') ? 'PRO_1M' : 'PLUS_1M';
                                        setSelectedTier(currentBase as SubscriptionTierKey);
                                    }}
                                    className={cn(
                                        "px-2.5 py-1 rounded-lg text-xs font-black transition-all",
                                        modalBillingCycle === 'monthly'
                                            ? "bg-white text-slate-900 shadow-xs"
                                            : "text-slate-500 hover:text-slate-800"
                                    )}
                                >
                                    월간 구독
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setModalBillingCycle('annual');
                                        const currentBase = selectedTier.startsWith('START') ? 'START_1Y' : selectedTier.startsWith('PRO') ? 'PRO_1Y' : 'PLUS_1Y';
                                        setSelectedTier(currentBase as SubscriptionTierKey);
                                    }}
                                    className={cn(
                                        "px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1",
                                        modalBillingCycle === 'annual'
                                            ? "bg-indigo-600 text-white shadow-xs"
                                            : "text-indigo-600 hover:text-indigo-700 font-bold"
                                    )}
                                >
                                    <span>연간 구독</span>
                                    <span className={cn(
                                        "text-[9px] px-1.5 py-0.2 rounded-full font-black",
                                        modalBillingCycle === 'annual' ? "bg-white text-indigo-700" : "bg-indigo-100 text-indigo-700"
                                    )}>
                                        30% 할인
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* 플랜 3종 카드 */}
                        <div className="grid grid-cols-3 gap-2.5">
                            {((modalBillingCycle === 'annual' 
                                ? ['START_1Y', 'PLUS_1Y', 'PRO_1Y'] 
                                : ['START_1M', 'PLUS_1M', 'PRO_1M']) as SubscriptionTierKey[]).map((tierKey) => {
                                const info = TIER_PRICES[tierKey];
                                const price = info.normalPrice;
                                const isSelected = selectedTier === tierKey;
                                const isPlus = tierKey.startsWith('PLUS');
                                const isDisabled = tierKey === 'PRO_1Y';

                                if (isDisabled) {
                                    return (
                                        <div
                                            key={tierKey}
                                            className="p-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 opacity-50 cursor-not-allowed flex flex-col justify-between relative text-left select-none"
                                        >
                                            <span className="absolute -top-2.5 right-2 bg-slate-400 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                                연간 제외
                                            </span>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pro</p>
                                                <p className="text-xs font-black text-slate-400 leading-tight mt-0.5">프로</p>
                                                <p className="text-[10px] text-slate-400 font-bold mt-1 bg-slate-100 px-1.5 py-0.5 rounded w-fit">
                                                    월간/3개월 전용
                                                </p>
                                            </div>
                                            <div className="mt-2.5 pt-2 border-t border-slate-200">
                                                <p className="text-xs font-black text-slate-400">
                                                    연간 미운영
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={tierKey}
                                        onClick={() => setSelectedTier(tierKey)}
                                        className={cn(
                                            "cursor-pointer p-3 rounded-2xl border-2 transition-all flex flex-col justify-between relative text-left",
                                            isSelected 
                                                ? "border-indigo-600 bg-indigo-50/60 shadow-sm" 
                                                : isPlus
                                                    ? "border-indigo-200 bg-indigo-50/20 hover:border-indigo-300"
                                                    : "border-slate-200 hover:border-slate-300 bg-white"
                                        )}
                                    >
                                        {info.badge && (
                                            <span className={cn(
                                                "absolute -top-2.5 right-2 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs",
                                                isPlus ? "bg-indigo-600" : "bg-slate-800"
                                            )}>
                                                {info.badge}
                                            </span>
                                        )}
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{info.name}</p>
                                            </div>
                                            <p className="text-xs font-black text-slate-900 leading-tight mt-0.5">{info.name === 'Start' ? '스타트' : info.name === 'Plus' ? '플러스' : '프로'}</p>
                                            <p className="text-[10px] text-indigo-700 font-extrabold mt-1 bg-indigo-50/80 px-1.5 py-0.5 rounded w-fit">
                                                {info.limitText}
                                            </p>
                                        </div>
                                        <div className="mt-2.5 pt-2 border-t border-slate-100">
                                            <p className="text-sm font-black text-slate-900">
                                                {price.toLocaleString()}<span className="text-[10px] font-normal text-slate-500 ml-0.5">원</span>
                                            </p>
                                            {info.cycle === '1Y' && (
                                                <p className="text-[9px] text-indigo-600 font-extrabold mt-0.5">
                                                    1년 일시납 (월 {info.monthlyEquivalent.toLocaleString()}원꼴)
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* 무제한 발송 강조 배너 */}
                        <div className="p-2.5 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-200/80 rounded-xl flex items-center justify-between text-[11px] font-bold text-indigo-900">
                            <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span>전 플랜 공통: <strong>구독 기간 내 이메일 & 인스타DM 무제한 발송</strong></span>
                            </span>
                            <span className="text-[10px] text-slate-500">일 권장 300~500건</span>
                        </div>
                    </div>

                    {/* 라이선스 키 수신 이메일 단일 안내 */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2.5">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                    <Mail className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs font-black text-slate-700 whitespace-nowrap">
                                    수신 이메일
                                </span>
                            </div>
                            <span className="text-xs font-black text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs select-all truncate">
                                {buyerEmail}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/70 text-[11px] font-bold text-indigo-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>결제 완료 즉시 위 이메일로 라이선스 키가 자동 발송됩니다.</span>
                        </div>
                    </div>

                    {/* 결제 수단 단일 안내 (신용/체크카드 및 카드사 앱카드) */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black text-slate-900 uppercase tracking-wider">결제 수단</label>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
                                국내 전 카드사 지원
                            </span>
                        </div>
                        <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-white">신용 / 체크카드 (앱카드)</p>
                                    <p className="text-[10px] text-slate-400 font-medium">KB·신한·현대·삼성·롯데·BC·농협·카카오뱅크 등 지원</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 데이터 합법성 및 컴플라이언스 준수 공식 안내 */}
                    <div className="p-3 bg-slate-100/90 border border-slate-200/80 rounded-2xl text-[11px] text-slate-500 space-y-1">
                        <p className="font-black text-slate-700 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            데이터 합법성 및 정보통신망법 준수 안내
                        </p>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                            • 본 소프트웨어는 포털 지도 등에 사업자가 직접 공개한 합법적 사업장 정보만을 상권 분석 및 비즈니스 1:1 소통 목적으로 수집·정리합니다.
                        </p>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                            • 불법 스팸 전송을 엄격히 금지하며, 메시지 발송 시 정보통신망법 제50조에 따른 (광고) 표기 및 수신거부 의무를 철저히 준수합니다.
                        </p>
                    </div>

                    {errorMsg && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* 결제 버튼 */}
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
                                    <span>{finalPrice.toLocaleString()}원 결제 및 라이선스 키 즉시 발급</span>
                                </>
                            )}
                        </Button>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold px-1">
                            <span className="flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> NHN KCP 정식 전자결제 (안심 암호화)
                            </span>
                            <span>전자상거래 소비자보호법 준수</span>
                        </div>
                    </div>
                </form>
            )}
        </Modal>
    );
};
