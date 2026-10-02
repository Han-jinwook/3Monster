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
    Sparkles,
    Mail,
    BookOpen,
    Check
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

const KCP_SITE_CD = 'AM1FA'; // (주)썬드림 3호 3Monster 회원제 PG (기간제 라이선스)

export const BANK_INFO = {
    bankName: '기업은행',
    accountNumber: '114-155484-01-011',
    accountHolder: '썬드림 주식회사'
};

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, product }) => {
    const [selectedTier, setSelectedTier] = useState<SubscriptionTierKey>('PLUS_1M');
    const [modalBillingCycle, setModalBillingCycle] = useState<'monthly' | 'annual'>('monthly');
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');
    const [buyerEmail, setBuyerEmail] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 결제 완료 후 발급 결과 상태 (카드 결제)
    const [successData, setSuccessData] = useState<{
        serialKey: string;
        productName: string;
        tierLabel: string;
        expireDate: string;
        downloadUrl: string;
        docsUrl?: string;
    } | null>(null);
    const [copied, setCopied] = useState(false);

    // 무통장 입금 상태 (연간 플랜 30% 할인 전용)
    const [depositorName, setDepositorName] = useState('');
    const [receiptType, setReceiptType] = useState<'tax_invoice' | 'cash_receipt' | 'none'>('tax_invoice');
    const [receiptNumber, setReceiptNumber] = useState('');
    const [accountCopied, setAccountCopied] = useState(false);
    const [bankTransferSuccess, setBankTransferSuccess] = useState<{
        orderId: string;
        productTitle: string;
        tierLabel: string;
        price: number;
        depositorName: string;
        receiptType: string;
        receiptNumber: string;
        buyerEmail: string;
    } | null>(null);

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
                setPaymentMethod('bank');
            } else {
                setModalBillingCycle('monthly');
                setPaymentMethod('card');
            }
        } else if (product?.billingCycle) {
            setModalBillingCycle(product.billingCycle);
            setSelectedTier(product.billingCycle === 'annual' ? 'PLUS_1Y' : 'PLUS_1M');
            setPaymentMethod(product.billingCycle === 'annual' ? 'bank' : 'card');
        }

        setSuccessData(null);
        setBankTransferSuccess(null);
        setErrorMsg(null);
        setCopied(false);
        setDepositorName('');

        // 이전에 저장된 무통장 입금자명 및 증빙 정보 불러오기
        if (currentEmail) {
            const cleanEmail = currentEmail.trim().toLowerCase();

            // 1. 로컬 캐시 즉시 복원 (화면 딜레이 없는 빠른 렌더링)
            try {
                const localCached = localStorage.getItem(`3m_pay_info_${cleanEmail}`);
                if (localCached) {
                    const parsed = JSON.parse(localCached);
                    if (parsed.depositorName) setDepositorName(parsed.depositorName);
                    if (parsed.receiptType) setReceiptType(parsed.receiptType);
                    if (parsed.receiptNumber) setReceiptNumber(parsed.receiptNumber);
                }
            } catch (_) {}

            // 2. Supabase DB(public.users)에서 최신 정보 동기화
            const fetchDbPaymentInfo = async () => {
                try {
                    const { data, error } = await supabase
                        .from('users')
                        .select('depositor_name, receipt_type, receipt_number')
                        .eq('email', cleanEmail)
                        .maybeSingle();

                    if (data && !error) {
                        if (data.depositor_name) setDepositorName(data.depositor_name);
                        if (data.receipt_type) setReceiptType(data.receipt_type as any);
                        if (data.receipt_number) setReceiptNumber(data.receipt_number);

                        localStorage.setItem(`3m_pay_info_${cleanEmail}`, JSON.stringify({
                            depositorName: data.depositor_name || '',
                            receiptType: data.receipt_type || 'tax_invoice',
                            receiptNumber: data.receipt_number || ''
                        }));
                    }
                } catch (err: any) {
                    console.warn('Load saved payment info error:', err);
                }
            };
            fetchDbPaymentInfo();
        }
    }, [product, isOpen]);

    // 탭 전환 또는 플랜 변경 시 이전 취소/에러 메시지 즉시 리셋
    useEffect(() => {
        setErrorMsg(null);
        if (modalBillingCycle === 'annual') {
            setPaymentMethod('bank');
        }
    }, [modalBillingCycle, selectedTier]);

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
        const clean = productId.toLowerCase().replace(/[-_]/g, '');
        if (clean.includes('cafe') || clean.includes('comment') || clean.includes('event') || clean.includes('autocomment')) {
            return `https://github.com/Han-jinwook/CafeScraper/releases/latest/download/AutoComment-Pro.zip`;
        }
        if (clean.includes('content')) {
            return `https://github.com/Han-jinwook/content-crawler/releases/latest/download/ContentCrawler-Pro.zip`;
        }
        if (clean.includes('user')) {
            return `https://github.com/Han-jinwook/user-manager/releases/latest/download/UserManager-Pro.zip`;
        }
        return `https://github.com/Han-jinwook/n-place-db/releases/latest/download/NPlace-DB-Pro.zip`;
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
                                        <div style="color: #818cf8; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;">정식 라이선스 키 (License Key)</div>
                                        <div style="font-family: monospace; font-size: 20px; font-weight: 900; color: #fde047; letter-spacing: 0.08em; background: #1e293b; padding: 12px 16px; border-radius: 10px; word-break: break-all; border: 1px dashed #475569;">
                                            ${serialKey}
                                        </div>
                                    </div>
                                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 24px; font-size: 13px; color: #475569;">
                                        <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 800; color: #0f172a;">⚡ 프로그램 설치 및 실행 안내</h4>
                                        <p style="margin: 6px 0;">1. 아래 [프로그램 다운로드 바로가기] 버튼을 눌러 압축 파일(.zip)을 다운로드합니다.</p>
                                        <p style="margin: 6px 0;">2. 다운로드된 압축파일(.zip)을 원하는 폴더로 이동 후 <strong>[압축 풀기]</strong>를 완료합니다.</p>
                                        <p style="margin: 6px 0;">3. 압축 해제된 폴더 내 실행 파일(또는 NPlace-DB-실행.bat)을 열고 <strong>[라이선스 키 입력]</strong> 창에 위 라이선스 키를 붙여넣기(Ctrl+V) 하세요.</p>
                                        <p style="margin: 6px 0;">4. <strong>[1 라이선스 1 PC]</strong> 최초 등록된 PC 기기(HWID)에 귀속되어 정식 활성화됩니다. (PC 교체 또는 포맷 시 고객센터에서 재인증 지원)</p>
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
            const siteBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://3monster.net';
            const docsUrl = `${siteBaseUrl}/docs/${product.id}`;
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
            const cleanProd = (product.title || '').split('(')[0].trim();
            const periodText = currentTierInfo.months === 3 ? '90일(3개월)' : '30일';
            const goodName = `[3Monster] ${cleanProd} ${periodText} 이용권`;

            const kcpPayMethod = '100000000000'; // NHN KCP 신용/체크카드 및 간편결제 (카카오페이, 네이버페이, 토스, 앱카드 등)

            const defaultBuyerName = buyerEmail.split('@')[0] || '3Monster 회원';

            const paymentData = {
                site_cd: KCP_SITE_CD,
                ordr_idxx: orderId,
                good_mny: finalPrice,
                good_name: goodName,
                good_expr: '1',
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
                    } else if (res_cd === "3001" || res_msg?.includes("사용자 결제 취소") || res_msg?.includes("취소")) {
                        setErrorMsg("카드 결제창이 닫히거나 결제가 취소되었습니다.");
                        setTimeout(() => setErrorMsg(null), 3000);
                        setProcessing(false);
                    } else {
                        setErrorMsg(`[결제 오류] ${res_msg} (${res_cd || 'CANCEL'})`);
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

    // 연간 플랜 법인계좌 무통장 입금 신청 처리
    const handleBankTransferSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!buyerEmail.trim()) {
            setErrorMsg('로그인된 계정 이메일이 확인되지 않습니다.');
            return;
        }

        const cleanDepositor = depositorName.trim() || buyerEmail.split('@')[0];
        if (!cleanDepositor) {
            setErrorMsg('입금자명을 입력해 주세요.');
            return;
        }

        if (receiptType !== 'none' && !receiptNumber.trim()) {
            setErrorMsg(receiptType === 'tax_invoice' ? '세금계산서 발행을 위한 사업자등록번호를 입력해 주세요.' : '현금영수증 발행을 위한 휴대폰번호를 입력해 주세요.');
            return;
        }

        setProcessing(true);

        try {
            const cyclePrefix = modalBillingCycle === 'annual' ? 'ANNUAL' : 'MONTH';
            const orderId = `3M_${cyclePrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            const buyerClean = buyerEmail.trim().toLowerCase();
            const receiptLabel = receiptType === 'tax_invoice' ? '세금계산서' : receiptType === 'cash_receipt' ? '현금영수증' : '미발행 (개인)';

            // 1. support_tickets 에 무통장 입금 신청 접수 기록 (관리자가 대시보드에서 즉시 확인 가능)
            try {
                await supabase.from('support_tickets').insert([{
                    uid: '00000000-0000-0000-0000-000000000000',
                    email: buyerClean,
                    issue_type: 'bank_transfer_order',
                    status: 'open',
                    title: `[${modalBillingCycle === 'annual' ? '연간' : '월간'} 입금신청] ${product.title} (${currentTierInfo.label}) - ${cleanDepositor} (${finalPrice.toLocaleString()}원)`,
                    description: `[${modalBillingCycle === 'annual' ? '연간' : '월간'} 라이선스 무통장 입금 접수]\n- 제품: ${product.title}\n- 플랜: ${currentTierInfo.label}\n- 입금액: ${finalPrice.toLocaleString()}원\n- 입금계좌: 기업은행 114-155484-01-011 썬드림 주식회사\n- 입금자명: ${cleanDepositor}\n- 증빙신청: ${receiptLabel} (${receiptNumber.trim() || '없음'})\n- 신청계정: ${buyerClean}\n- 주문번호: ${orderId}`,
                }]);
            } catch (ticketErr) {
                console.warn('Support ticket insert warning:', ticketErr);
            }

            // 2. 완료 화면 세팅
            setBankTransferSuccess({
                orderId,
                productTitle: product.title,
                tierLabel: currentTierInfo.label,
                price: finalPrice,
                depositorName: cleanDepositor,
                receiptType: receiptLabel,
                receiptNumber: receiptNumber.trim(),
                buyerEmail: buyerClean
            });

            // 3. 차후 결제 시 재사용할 수 있도록 DB 및 로컬 캐시에 입금자명/증빙정보 보관
            try {
                // 로컬 캐시 즉시 저장
                localStorage.setItem(`3m_pay_info_${buyerClean}`, JSON.stringify({
                    depositorName: cleanDepositor,
                    receiptType,
                    receiptNumber: receiptNumber.trim()
                }));

                // Supabase users 테이블 업데이트 시도
                await supabase
                    .from('users')
                    .update({
                        depositor_name: cleanDepositor,
                        receipt_type: receiptType,
                        receipt_number: receiptNumber.trim()
                    })
                    .eq('email', buyerClean);
            } catch (saveErr) {
                console.warn('Payment info auto-save warning:', saveErr);
            }

            setProcessing(false);
        } catch (err: any) {
            console.error('Bank transfer submit error:', err);
            setErrorMsg('입금 신청 중 오류가 발생했습니다. 고객센터로 문의해 주세요.');
            setProcessing(false);
        }
    };

    const isBank = paymentMethod === 'bank';
    const shortTitle = (product.title || '').split('(')[0].trim();
    const modalTitle = bankTransferSuccess 
        ? "🎉 입금 신청 접수 완료" 
        : successData 
            ? "🎉 라이선스 발급 완료" 
            : `🛒 ${shortTitle || product.title} ${isBank ? '입금 신청' : '결제'}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
            {/* NHN KCP Hidden Form */}
            <form name="kcp_order_form" ref={formRef} method="post" className="hidden">
                <input type="hidden" name="ordr_idxx" value={kcpFormData?.ordr_idxx || ''} />
                <input type="hidden" name="good_name" value={kcpFormData?.good_name || ''} />
                <input type="hidden" name="good_mny" value={kcpFormData?.good_mny || ''} />
                <input type="hidden" name="good_expr" value={kcpFormData?.good_expr || '1'} />
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

            {bankTransferSuccess ? (
                /* 무통장 입금 신청 완료 화면 */
                <div className="space-y-3 py-1 text-left">
                    <div className="text-center space-y-1 bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                        <h3 className="text-base sm:text-lg font-black text-slate-900">{modalBillingCycle === 'annual' ? '연간 구독' : '라이선스'} 입금 신청이 접수되었습니다!</h3>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                            아래 법인 전용 계좌로 입금해 주시면, 입금 확인 즉시(영업시간 내 평균 10분)<br />
                            <strong>{bankTransferSuccess.buyerEmail}</strong>(으)로 정품 라이선스 키가 자동 발송됩니다.
                        </p>
                    </div>

                    {/* 입금 계좌 상세 카드 */}
                    <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2 shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                            <span className="text-[11px] font-bold text-slate-400">입금 계좌 안내</span>
                            <span className="text-[11px] font-black text-amber-300">기업은행 (썬드림 주식회사)</span>
                        </div>

                        <div className="flex items-center justify-between bg-slate-800/80 px-3 py-2 rounded-lg">
                            <div>
                                <p className="text-[9.5px] text-slate-400">계좌번호</p>
                                <p className="text-base sm:text-lg font-black text-white font-mono tracking-wider leading-tight">
                                    114-155484-01-011
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText('114-155484-01-011');
                                    setAccountCopied(true);
                                    setTimeout(() => setAccountCopied(false), 2000);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                            >
                                {accountCopied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                                <span>{accountCopied ? '복사됨!' : '계좌 복사'}</span>
                            </button>
                        </div>

                        <div className="space-y-1 text-xs text-slate-300 pt-0.5">
                            <div className="flex justify-between">
                                <span className="text-slate-400 text-[11px]">입금 금액:</span>
                                <strong className="text-amber-300 text-xs sm:text-sm font-black">{bankTransferSuccess.price.toLocaleString()}원</strong>
                            </div>
                            <div className="flex justify-between text-[11px]">
                                <span className="text-slate-400">입금자명:</span>
                                <strong className="text-white">{bankTransferSuccess.depositorName}</strong>
                            </div>
                            <div className="flex justify-between text-[11px]">
                                <span className="text-slate-400">증빙 신청:</span>
                                <strong className="text-emerald-400">{bankTransferSuccess.receiptType} {bankTransferSuccess.receiptNumber ? `(${bankTransferSuccess.receiptNumber})` : ''}</strong>
                            </div>
                            <div className="flex justify-between text-[11px]">
                                <span className="text-slate-400">주문번호:</span>
                                <span className="font-mono text-slate-400 text-[10px]">{bankTransferSuccess.orderId}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-1">
                        <p className="font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-blue-600" />
                            빠른 발급 및 세금계산서 안내
                        </p>
                        <p className="text-[10px] text-blue-800 leading-relaxed">
                            • 송금 확인 즉시 등록 계정(<strong>{bankTransferSuccess.buyerEmail}</strong>)으로 라이선스 키가 전송됩니다.<br />
                            • 세금계산서/현금영수증은 홈택스로 당일 전자 발행됩니다.
                        </p>
                    </div>

                    <div className="pt-1">
                        <Button 
                            onClick={onClose}
                            className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl"
                        >
                            확인 및 창 닫기
                        </Button>
                    </div>
                </div>
            ) : successData ? (
                /* 결제 완료 및 라이선스 키 발급 성공 화면 */
                <div className="space-y-3 py-1">
                    <div className="text-center space-y-1 bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto animate-bounce" />
                        <h3 className="text-base sm:text-lg font-black text-slate-900">결제가 안전하게 완료되었습니다!</h3>
                        <p className="text-[11px] text-slate-600 font-bold">
                            고객님의 정식 라이선스 키가 즉시 생성되었습니다.
                        </p>
                    </div>

                    <div className="space-y-2 bg-slate-900 text-white p-3.5 rounded-xl shadow-xl">
                        <div className="flex justify-between items-center text-[11px] text-slate-400 font-bold">
                            <span>{successData.productName} ({successData.tierLabel})</span>
                            <span>만료일: {successData.expireDate}</span>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">발급된 라이선스 키</label>
                            <div className="flex items-center gap-1.5">
                                <input 
                                    readOnly 
                                    value={successData.serialKey} 
                                    className="w-full bg-slate-800 border border-slate-700 text-amber-300 font-mono text-sm sm:text-base font-black px-3 py-2 rounded-lg focus:outline-none select-all text-center tracking-wider"
                                />
                                <Button 
                                    onClick={() => handleCopy(successData.serialKey)}
                                    className={cn(
                                        "h-9 px-3.5 font-black text-xs shrink-0 transition-all rounded-lg border-none",
                                        copied ? "bg-emerald-600 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"
                                    )}
                                >
                                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                                    {copied ? "복사됨!" : "복사"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200/80 text-[11px] text-slate-700 space-y-1.5">
                        <div className="flex items-center justify-between">
                            <p className="font-black text-indigo-950 flex items-center gap-1.5 text-xs">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" /> 프로그램 실행 & 정품 등록 안내:
                            </p>
                            <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full">1 라이선스 1 PC</span>
                        </div>
                        <div className="space-y-1 pl-1 text-[11px] text-slate-700 font-medium leading-relaxed">
                            <p className="flex items-start gap-1.5">
                                <span className="font-black text-indigo-600 shrink-0">1.</span>
                                <span>다운로드된 <strong>압축파일(.zip)</strong>을 원하는 폴더로 이동 후 <strong>[압축 풀기]</strong>를 완료하세요.</span>
                            </p>
                            <p className="flex items-start gap-1.5">
                                <span className="font-black text-indigo-600 shrink-0">2.</span>
                                <span>압축 해제된 폴더 안의 <strong>실행 파일(NPlace-DB)</strong>을 더블 클릭하여 실행합니다.</span>
                            </p>
                            <p className="flex items-start gap-1.5">
                                <span className="font-black text-indigo-600 shrink-0">3.</span>
                                <span>프로그램 상단 <strong>[라이선스 키 입력]</strong> 창에 위 라이선스 키를 붙여넣기(Ctrl+V)하시면 해당 PC에 귀속되어 즉시 정품 활성화됩니다. (PC 포맷/교체 시 재인증 지원)</span>
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <a href={successData.downloadUrl} className="block">
                                <Button className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm">
                                    <Download className="w-3.5 h-3.5" /> 프로그램 다운로드
                                </Button>
                            </a>
                            <a href={successData.docsUrl || `/docs/${product.id}`} target="_blank" rel="noreferrer" className="block">
                                <Button 
                                    type="button"
                                    variant="outline"
                                    className="w-full h-10 rounded-xl font-black text-xs border border-indigo-200 text-indigo-700 hover:bg-indigo-50 flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                    <BookOpen className="w-3.5 h-3.5" /> 📖 설치 가이드
                                </Button>
                            </a>
                        </div>
                        <Button 
                            onClick={onClose} 
                            variant="ghost"
                            className="w-full h-8 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-800"
                        >
                            닫기
                        </Button>
                    </div>
                </div>
            ) : (
                /* 결제 입력 폼 */
                <form onSubmit={paymentMethod === 'bank' ? handleBankTransferSubmit : handleKcpSubmit} className="space-y-3 sm:space-y-3.5 text-left">
                    {/* 플랜 선택 */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-1.5">
                            <label className="text-[11px] font-black text-slate-900 uppercase tracking-wider">구독 플랜 선택</label>
                            
                            {/* 외부 쇼룸과 100% 동일한 월간 / 연간 30% 할인 토글 */}
                            <div className="shrink-0 inline-flex items-center bg-white p-0.5 rounded-xl border-2 border-indigo-600 shadow-sm shadow-indigo-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setModalBillingCycle('monthly');
                                        const currentBase = selectedTier.startsWith('START') ? 'START_1M' : selectedTier.startsWith('PRO') ? 'PRO_1M' : 'PLUS_1M';
                                        setSelectedTier(currentBase as SubscriptionTierKey);
                                    }}
                                    className={cn(
                                        "px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer",
                                        modalBillingCycle === 'monthly'
                                            ? "bg-slate-900 text-white shadow-xs"
                                            : "text-slate-600 hover:text-slate-900"
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
                                        "px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer",
                                        modalBillingCycle === 'annual'
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-300"
                                            : "text-indigo-600 hover:text-indigo-700 font-extrabold"
                                    )}
                                >
                                    <span>연간 구독</span>
                                    <span className={cn(
                                        "text-[9px] px-1.5 py-0.2 rounded-full font-black transition-transform",
                                        modalBillingCycle === 'annual' 
                                            ? "bg-amber-300 text-slate-950 shadow-xs" 
                                            : "bg-indigo-100 text-indigo-700"
                                    )}>
                                        30% 할인 🎁
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* 플랜 3종 카드 */}
                        <div className="grid grid-cols-3 gap-2">
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
                                            className="p-2 sm:p-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 opacity-50 cursor-not-allowed flex flex-col justify-between relative text-left select-none"
                                        >
                                            <span className="absolute -top-2 right-1.5 bg-slate-400 text-white text-[7.5px] font-black px-1 py-0.2 rounded uppercase tracking-wider">
                                                연간 제외
                                            </span>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Pro</p>
                                                <p className="text-xs font-black text-slate-400 leading-tight mt-0.5">프로</p>
                                                <p className="text-[9px] text-slate-400 font-bold mt-1 bg-slate-100 px-1 py-0.5 rounded w-fit">
                                                    월간 전용
                                                </p>
                                            </div>
                                            <div className="mt-2 pt-1 border-t border-slate-200">
                                                <p className="text-[11px] font-black text-slate-400">
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
                                            "cursor-pointer p-2 sm:p-2.5 rounded-xl border-2 transition-all flex flex-col justify-between relative text-left",
                                            isSelected 
                                                ? "border-indigo-600 bg-indigo-50/60 shadow-xs" 
                                                : isPlus
                                                    ? "border-indigo-200 bg-indigo-50/20 hover:border-indigo-300"
                                                    : "border-slate-200 hover:border-slate-300 bg-white"
                                        )}
                                    >
                                        {info.badge && (
                                            <span className={cn(
                                                "absolute -top-2 right-1.5 text-white text-[7.5px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs",
                                                isPlus ? "bg-indigo-600" : "bg-slate-800"
                                            )}>
                                                {info.badge}
                                            </span>
                                        )}
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{info.name}</p>
                                            </div>
                                            <p className="text-xs font-black text-slate-900 leading-tight mt-0.5">{info.name === 'Start' ? '스타트' : info.name === 'Plus' ? '플러스' : '프로'}</p>
                                            <p className="text-[9.5px] text-indigo-700 font-extrabold mt-1 bg-indigo-50/80 px-1 py-0.5 rounded w-fit leading-none">
                                                {info.limitText}
                                            </p>
                                        </div>
                                        <div className="mt-2 pt-1.5 border-t border-slate-100">
                                            <p className="text-xs sm:text-sm font-black text-slate-900">
                                                {price.toLocaleString()}<span className="text-[9px] font-normal text-slate-500 ml-0.5">원</span>
                                            </p>
                                            {info.cycle === '1Y' && (
                                                <p className="text-[8px] text-indigo-600 font-extrabold mt-0.5">
                                                    월 {info.monthlyEquivalent.toLocaleString()}원꼴
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 라이선스 키 수신 이메일 컴팩트 안내 */}
                    <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700 font-bold shrink-0">
                            <Mail className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="text-[11px] font-black">수신 이메일</span>
                        </div>
                        <span className="text-xs font-black text-slate-900 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 select-all truncate max-w-[210px]">
                            {buyerEmail}
                        </span>
                    </div>

                    {/* 결제 수단 선택 (신용카드 & 무통장 입금 항상 나란히 배치) */}
                    <div className="space-y-2">
                        <div>
                            <label className="text-[11px] font-black text-slate-900 uppercase tracking-wider">결제 수단 선택</label>
                        </div>

                        {/* 2개 선택 탭 버튼 (Image 2/3 스타일 완벽 일치) */}
                        <div className="grid grid-cols-2 gap-2">
                            {/* 무통장 입금 */}
                            <button
                                type="button"
                                onClick={() => {
                                    setPaymentMethod('bank');
                                    setErrorMsg(null);
                                }}
                                className={cn(
                                    "p-2.5 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer text-center relative",
                                    paymentMethod === 'bank'
                                        ? "border-slate-900 bg-amber-50/40 text-slate-900 font-black shadow-xs ring-1 ring-slate-900"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 font-bold"
                                )}
                            >
                                <span className="text-xs sm:text-[13px] font-black">무통장 입금</span>
                                <span className={cn(
                                    "text-[9px] px-1.5 py-0.2 rounded-full font-black",
                                    paymentMethod === 'bank' ? "bg-amber-400 text-slate-950 font-black" : "bg-amber-100 text-amber-800"
                                )}>
                                    {modalBillingCycle === 'annual' ? '30% 할인적용' : '세금계산서 100%'}
                                </span>
                            </button>

                            {/* 신용카드 (KCP) */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (modalBillingCycle === 'annual') {
                                        setErrorMsg('연간 30% 할인가 플랜은 법인 세금계산서 발행 및 PG 규정에 따라 [무통장 입금] 전용으로 운영됩니다.');
                                        return;
                                    }
                                    setPaymentMethod('card');
                                    setErrorMsg(null);
                                }}
                                className={cn(
                                    "p-2.5 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer text-center relative",
                                    paymentMethod === 'card'
                                        ? "border-slate-900 bg-amber-50/40 text-slate-900 font-black shadow-xs ring-1 ring-slate-900"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 font-bold"
                                )}
                            >
                                <span className="text-xs sm:text-[13px] font-black">신용카드 (KCP)</span>
                                <span className="text-[9px] text-slate-500 font-medium">
                                    {modalBillingCycle === 'annual' ? '연간 입금전용' : '국내 전 카드사 앱카드'}
                                </span>
                            </button>
                        </div>

                        {/* 선택된 결제 수단에 따른 상세 안내 & 입력 폼 */}
                        {paymentMethod === 'card' ? (
                            /* 신용카드 선택 시 안내 (Image 2 스타일) */
                            <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between shadow-xs border border-slate-800">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-white">신용 / 체크카드 (앱카드 즉시결제)</p>
                                        <p className="text-[10px] text-slate-400 font-medium">KB·신한·현대·삼성·롯데·BC·농협·카뱅 등 지원</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* 무통장 입금 선택 시 안내 & 폼 (Image 3 스타일 완벽 일치) */
                            <div className="space-y-2">
                                {/* 기업은행 법인 입금 계좌 카드 (심플 1~2줄 압축) */}
                                <div className="p-2.5 bg-amber-50/70 border border-amber-200/90 rounded-xl text-slate-900">
                                    <div className="flex items-center justify-between gap-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs sm:text-sm font-black text-slate-900 font-mono tracking-tight whitespace-nowrap">
                                                기업은행 114-155484-01-011
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    navigator.clipboard.writeText('114-155484-01-011');
                                                    setAccountCopied(true);
                                                    setTimeout(() => setAccountCopied(false), 2000);
                                                }}
                                                className="px-2 py-0.5 rounded-md bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 text-[11px] font-black flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                                            >
                                                {accountCopied ? <Check className="w-3 h-3 text-slate-950" /> : <Copy className="w-3 h-3 text-slate-950" />}
                                                <span>{accountCopied ? '복사됨' : '복사'}</span>
                                            </button>
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap shrink-0">
                                            예금주: 썬드림 주식회사
                                        </span>
                                    </div>
                                </div>

                                {/* 입금자명 및 증빙 신청 입력폼 (한 줄 정렬 및 슬림화) */}
                                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs font-bold text-slate-700 shrink-0 w-14">
                                            입금자명
                                        </label>
                                        <input
                                            type="text"
                                            value={depositorName}
                                            onChange={(e) => setDepositorName(e.target.value)}
                                            placeholder="입금자명 (미입력 시 회원 계정명)"
                                            className="flex-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white placeholder:text-slate-400 placeholder:font-normal"
                                        />
                                    </div>

                                    <div className="space-y-1.5 pt-1.5 border-t border-slate-200/80">
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs font-bold text-slate-700 shrink-0 w-14">
                                                증빙신청
                                            </label>
                                            <div className="grid grid-cols-3 gap-1 flex-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setReceiptType('tax_invoice')}
                                                    className={cn(
                                                        "py-1 px-1.5 rounded-lg text-[11px] font-bold border transition-all text-center cursor-pointer",
                                                        receiptType === 'tax_invoice'
                                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs font-black"
                                                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                                                    )}
                                                >
                                                    세금계산서
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setReceiptType('cash_receipt')}
                                                    className={cn(
                                                        "py-1 px-1.5 rounded-lg text-[11px] font-bold border transition-all text-center cursor-pointer",
                                                        receiptType === 'cash_receipt'
                                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs font-black"
                                                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                                                    )}
                                                >
                                                    현금영수증
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setReceiptType('none')}
                                                    className={cn(
                                                        "py-1 px-1.5 rounded-lg text-[11px] font-bold border transition-all text-center cursor-pointer",
                                                        receiptType === 'none'
                                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs font-black"
                                                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                                                    )}
                                                >
                                                    미발행
                                                </button>
                                            </div>
                                        </div>

                                        {receiptType !== 'none' && (
                                            <div className="flex items-center gap-2">
                                                <span className="w-14 shrink-0" />
                                                <input
                                                    type="text"
                                                    value={receiptNumber}
                                                    onChange={(e) => setReceiptNumber(e.target.value)}
                                                    placeholder={receiptType === 'tax_invoice' ? "사업자등록번호 10자리 (- 제외)" : "휴대폰번호 (- 제외)"}
                                                    className="flex-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white placeholder:text-slate-400 placeholder:font-normal"
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {errorMsg && (
                        <div className={cn(
                            "p-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all",
                            errorMsg.includes('취소')
                                ? "bg-slate-100 border border-slate-200 text-slate-700"
                                : "bg-rose-50 border border-rose-200 text-rose-600"
                        )}>
                            <AlertCircle className={cn(
                                "w-3.5 h-3.5 shrink-0",
                                errorMsg.includes('취소') ? "text-slate-500" : "text-rose-500"
                            )} />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* 결제 / 입금 신청 버튼 */}
                    <div className="pt-1">
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className={cn(
                                "w-full h-11 sm:h-12 font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 border-none",
                                paymentMethod === 'bank'
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 cursor-pointer"
                                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 cursor-pointer"
                            )}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> {paymentMethod === 'bank' ? '신청 접수 중...' : '결제창 호출 중...'}
                                </>
                            ) : paymentMethod === 'bank' ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                                    <span>{finalPrice.toLocaleString()}원 입금 신청 및 주문 완료</span>
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4 text-amber-300" />
                                    <span>{finalPrice.toLocaleString()}원 카드 결제 및 라이선스 발급</span>
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};
