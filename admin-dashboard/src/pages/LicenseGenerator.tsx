import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Copy, CheckCircle2, ChevronRight, Clock, ArrowLeft, ShoppingBag, X, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const generateSerial = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segment = () => Array(4).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    return `CM-${segment()}-${segment()}-${segment()}`;
};

export const getGitHubDownloadUrl = (productId: string) => {
    const repoMap: Record<string, string> = {
        'NPlace-DB': 'n-place-db',
        'ContentCrawler': 'content-crawler',
        'UserManager': 'user-manager',
        'CafeCrawler': 'CafeScraper',
        'EventStats': 'CafeScraper',
        'AutoComment': 'CafeScraper'
    };
    const repo = repoMap[productId] || productId.toLowerCase();
    return `https://github.com/Han-jinwook/${repo}/releases/latest/download/${productId}-Pro.zip`;
};

export const generateKmongMessage = (productId: string, serialKey: string, buyerName?: string) => {
    const pId = productId || 'NPlace-DB';
    let productNameKr = '[3몬스터] 네이버 플레이스 DB 정밀 추출기';
    let launcherExe = 'NPlace_DB_Launcher.exe';
    let repoName = 'n-place-db';
    let zipName = 'NPlace-DB-Pro.zip';

    if (pId === 'CafeCrawler') {
        productNameKr = '[3몬스터] 네이버 카페 수집기 Pro';
        launcherExe = 'CafeMonster.exe';
        repoName = 'CafeScraper';
        zipName = 'CafeCrawler-Pro.zip';
    } else if (pId === 'EventStats') {
        productNameKr = '[3몬스터] 카페 이벤트 활동 분석기';
        launcherExe = 'EventStats.exe';
        repoName = 'CafeScraper';
        zipName = 'EventStats-Pro.zip';
    } else if (pId === 'AutoComment') {
        productNameKr = '[3몬스터] 네이버 카페 댓글 관리기';
        launcherExe = 'AutoComment.exe';
        repoName = 'CafeScraper';
        zipName = 'AutoComment-Pro.zip';
    } else if (pId === 'ContentCrawler') {
        productNameKr = '[3몬스터] 사이트 콘텐츠 추출기';
        launcherExe = 'ContentCrawler.exe';
        repoName = 'content-crawler';
        zipName = 'ContentCrawler-Pro.zip';
    } else if (pId === 'UserManager') {
        productNameKr = '[3몬스터] 회원관리 확장팩';
        launcherExe = 'UserManager.exe';
        repoName = 'user-manager';
        zipName = 'UserManager-Pro.zip';
    }

    const downloadUrl = `https://github.com/Han-jinwook/${repoName}/releases/latest/download/${zipName}`;
    const displayKey = serialKey || '{발급받은_정품_라이선스_키가_여기에_들어갑니다}';
    const clientName = buyerName ? `${buyerName} 고객님` : '고객님';

    return `안녕하세요, ${clientName}! ${productNameKr}를 구매해 주셔서 진심으로 감사드립니다.

고객님의 정품 라이선스 키와 프로그램 다운로드 안내드립니다.

--------------------------------------------------
[1] 정품 라이선스 키
${displayKey}

[2] 최신 프로그램 다운로드
${downloadUrl}

[3] 고객지원 및 A/S 안내
사용 중 궁금하신 점이나 도움이 필요하시면 언제든 크몽 메시지로 편하게 문의주세요.
--------------------------------------------------

[초간단 사용 방법]
1. 위 다운로드 링크에서 압축 파일(ZIP)을 다운로드하신 후, [바탕화면 등 원하시는 폴더]에 위치시킨 뒤 압축을 완전히 해제합니다.
2. 폴더 내 [${launcherExe}]를 실행합니다.
3. 위 [정품 라이선스 키]를 입력 후 [인증하기]를 클릭하시면 즉시 활성화됩니다.
(첫 인증 시 고객님의 PC에 1:1 자동 등록되어 안전하게 보호됩니다.)

[정품 등록 혜택 안내]
- PC 포맷 또는 라이선스 키 분실 시 1초 즉시 복구 지원
- 포털 지도 로직 변경 시 자동 업데이트 및 중요 패치 알림
- 3몬스터 1:1 고객지원 기술지원 연동

항상 최고의 솔루션으로 보답하겠습니다. 감사합니다!`;
};

const formatPrice = (value: string | number) => {
    if (value === undefined || value === null || value === '') return '';
    const num = String(value).replace(/[^0-9]/g, '');
    if (!num) return '';
    return Number(num).toLocaleString('ko-KR');
};

const parsePrice = (value: string) => {
    return value.replace(/,/g, '');
};

interface PricingItem {
    id: number;
    product: string;
    pkg: string;
    label: string;
    price: number;
    status: '안' | '확정';
}

const defaultPrices: { [key: string]: number } = {
    'TEST': 0,
    'START_1M': 5000,
    'START_1Y': 42000,
    'PLUS_1M': 9000,
    'PLUS_1Y': 75600,
    'PRO_1M': 21000,
    'PRO_1Y': 0,
    'DELUXE': 5000,
    '1M': 9000,
    '3M': 21000,
    '1Y': 75600
};

import { useSearchParams } from 'react-router-dom';

export const LicenseGenerator = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const queryBuyer = searchParams.get('buyer') || '';
    const queryEmail = searchParams.get('email') || '';
    const queryChannel = searchParams.get('channel') || '3Monster 직결제';
    const queryProduct = searchParams.get('product') || 'NPlace-DB';
    const queryTier = searchParams.get('tier') || 'START_1M';

    const [loading, setLoading] = useState(false);
    const [generatedKey, setGeneratedKey] = useState('');
    const [emailAutoFilled, setEmailAutoFilled] = useState(!!(queryEmail || queryBuyer));
    const [existingBuyers, setExistingBuyers] = useState<Array<{ buyer_name: string; contact: string; channel?: string }>>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const buyerDropdownRef = useRef<HTMLDivElement>(null);

    const [isKmongModalOpen, setIsKmongModalOpen] = useState(false);
    const [copiedKmongText, setCopiedKmongText] = useState(false);
    const [copiedDownloadType, setCopiedDownloadType] = useState<string | null>(null);

    const handleCopyDownloadUrl = (productId: string) => {
        const url = getGitHubDownloadUrl(productId);
        navigator.clipboard.writeText(url);
        setCopiedDownloadType(productId);
        setTimeout(() => setCopiedDownloadType(null), 2500);
    };

    const handleCopyKmongTemplate = () => {
        const text = generateKmongMessage(formData.product_id, generatedKey, formData.buyer_name);
        navigator.clipboard.writeText(text);
        setCopiedKmongText(true);
        setTimeout(() => setCopiedKmongText(false), 2500);
    };

    // 바깥 영역 클릭 시 자동완성 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (buyerDropdownRef.current && !buyerDropdownRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [formData, setFormData] = useState({
        product_id: queryProduct,
        license_type: queryTier,
        constraint_type: 'HWID',
        buyer_name: queryBuyer,
        contact: queryEmail,
        channel: queryChannel,
        price_sold: defaultPrices[queryTier] !== undefined ? String(defaultPrices[queryTier]) : '5000',
        memo: ''
    });

    // 기존 구매자 목록 불러오기 (자동완성용)
    useEffect(() => {
        const fetchBuyers = async () => {
            try {
                const { data, error } = await supabase
                    .from('licenses')
                    .select('buyer_name, contact, channel')
                    .not('contact', 'is', null)
                    .order('created_at', { ascending: false });
                if (!error && data) {
                    const uniqueMap = new Map<string, { buyer_name: string; contact: string; channel?: string }>();
                    data.forEach(item => {
                        const key = (item.contact || item.buyer_name || '').toLowerCase().trim();
                        if (key && !uniqueMap.has(key)) {
                            uniqueMap.set(key, { buyer_name: item.buyer_name, contact: item.contact || '', channel: item.channel });
                        }
                    });
                    setExistingBuyers(Array.from(uniqueMap.values()));
                }
            } catch (e) {}
        };
        fetchBuyers();
    }, []);

    // 타이핑된 검색어에 일치하는 구매자 필터링 (글자 입력 시에만 활성화 - 이메일 도메인 매칭 제외)
    const trimmedBuyer = formData.buyer_name ? formData.buyer_name.trim() : '';
    const matchingBuyers = useMemo(() => {
        if (!trimmedBuyer || trimmedBuyer.length < 1) return [];
        const q = trimmedBuyer.toLowerCase();
        return existingBuyers.filter(b => {
            const bName = (b.buyer_name || '').toLowerCase().trim();
            const contact = (b.contact || '').toLowerCase().trim();
            const emailId = contact.split('@')[0];
            
            // If query contains '@', match full contact email
            if (q.includes('@')) {
                return contact.includes(q);
            }
            // Otherwise match only buyer_name or email ID (prefix before @)
            return (bName && bName.includes(q)) || (emailId && emailId.includes(q));
        }).slice(0, 6);
    }, [trimmedBuyer, existingBuyers]);

    // URL 파라미터가 변경될 때 자동 채우기
    useEffect(() => {
        if (queryBuyer || queryEmail || queryChannel || queryProduct || queryTier) {
            setFormData(prev => ({
                ...prev,
                buyer_name: queryBuyer || prev.buyer_name,
                contact: queryEmail || prev.contact,
                channel: queryChannel !== '3Monster 직결제' ? queryChannel : prev.channel,
                product_id: queryProduct !== 'NPlace-DB' ? queryProduct : prev.product_id,
                license_type: queryTier !== 'START_1M' ? queryTier : prev.license_type,
                price_sold: defaultPrices[queryTier] !== undefined ? String(defaultPrices[queryTier]) : prev.price_sold
            }));
            if (queryBuyer || queryEmail) setEmailAutoFilled(true);
        }
    }, [queryBuyer, queryEmail, queryChannel, queryProduct, queryTier]);

    const defaultPricingList: PricingItem[] = [
        // 마케팅몬스터 제품군
        { id: 1, product: 'NPlace-DB', pkg: 'START_1M', label: '[스타트] 1개월 (1,000건 한도 / 발송 무제한)', price: 5000, status: '확정' },
        { id: 2, product: 'NPlace-DB', pkg: 'PLUS_1M', label: '[플러스] 1개월 (무제한 추출 / 발송 무제한)', price: 9000, status: '확정' },
        { id: 3, product: 'NPlace-DB', pkg: 'PRO_1M', label: '[프로] 3개월 (무제한 추출 / 대행사 VIP)', price: 21000, status: '확정' },
        { id: 4, product: 'NPlace-DB', pkg: 'START_1Y', label: '[스타트] 연간 (12,000건 총량 / 30%할인)', price: 42000, status: '확정' },
        { id: 5, product: 'NPlace-DB', pkg: 'PLUS_1Y', label: '[플러스] 연간 (무제한 추출 / 30%할인)', price: 75600, status: '확정' },
        { id: 6, product: 'NPlace-DB', pkg: 'PRO_1Y', label: '[프로] 연간 (연간 미운영)', price: 0, status: '안' },

        { id: 7, product: 'ContentCrawler', pkg: 'START_1M', label: '[스타트] 1개월 (1,000건 추출)', price: 5000, status: '확정' },
        { id: 8, product: 'ContentCrawler', pkg: 'PLUS_1M', label: '[플러스] 1개월 (무제한 추출)', price: 9000, status: '확정' },
        { id: 9, product: 'ContentCrawler', pkg: 'PRO_1M', label: '[프로] 3개월 (무제한 추출)', price: 21000, status: '확정' },
        { id: 10, product: 'ContentCrawler', pkg: 'START_1Y', label: '[스타트] 연간 (12,000건 총량 / 30%할인)', price: 42000, status: '확정' },
        { id: 11, product: 'ContentCrawler', pkg: 'PLUS_1Y', label: '[플러스] 연간 (무제한 추출 / 30%할인)', price: 75600, status: '확정' },
        { id: 12, product: 'ContentCrawler', pkg: 'PRO_1Y', label: '[프로] 연간 (연간 미운영)', price: 0, status: '안' },

        { id: 13, product: 'UserManager', pkg: 'START_1M', label: '[스타트] 1개월 (1,000명 관리)', price: 5000, status: '확정' },
        { id: 14, product: 'UserManager', pkg: 'PLUS_1M', label: '[플러스] 1개월 (무제한 관리)', price: 9000, status: '확정' },
        { id: 15, product: 'UserManager', pkg: 'PRO_1M', label: '[프로] 3개월 (무제한 관리)', price: 21000, status: '확정' },
        { id: 16, product: 'UserManager', pkg: 'START_1Y', label: '[스타트] 연간 (12,000명 / 30%할인)', price: 42000, status: '확정' },
        { id: 17, product: 'UserManager', pkg: 'PLUS_1Y', label: '[플러스] 연간 (무제한 관리 / 30%할인)', price: 75600, status: '확정' },
        { id: 18, product: 'UserManager', pkg: 'PRO_1Y', label: '[프로] 연간 (연간 미운영)', price: 0, status: '안' },

        // 카페몬스터 제품군
        { id: 19, product: 'CafeCrawler', pkg: 'START_1M', label: '[스타트] 1개월 (1,000건 수집)', price: 5000, status: '확정' },
        { id: 20, product: 'CafeCrawler', pkg: 'PLUS_1M', label: '[플러스] 1개월 (3,000건 수집)', price: 9000, status: '확정' },
        { id: 21, product: 'CafeCrawler', pkg: 'PRO_1M', label: '[프로] 3개월 (9,000건 수집)', price: 21000, status: '확정' },
        { id: 22, product: 'CafeCrawler', pkg: 'START_1Y', label: '[스타트] 연간 (12,000건 총량 / 30%할인)', price: 42000, status: '확정' },
        { id: 23, product: 'CafeCrawler', pkg: 'PLUS_1Y', label: '[플러스] 연간 (36,000건 총량 / 30%할인)', price: 75600, status: '확정' },
        { id: 24, product: 'CafeCrawler', pkg: 'PRO_1Y', label: '[프로] 연간 (연간 미운영)', price: 0, status: '안' },

        { id: 25, product: 'EventStats', pkg: 'START_1M', label: '[스타트] 1개월 (1,000건 분석)', price: 5000, status: '확정' },
        { id: 26, product: 'EventStats', pkg: 'PLUS_1M', label: '[플러스] 1개월 (3,000건 분석)', price: 9000, status: '확정' },
        { id: 27, product: 'EventStats', pkg: 'PRO_1M', label: '[프로] 3개월 (9,000건 분석)', price: 21000, status: '확정' },
        { id: 28, product: 'EventStats', pkg: 'START_1Y', label: '[스타트] 연간 (12,000건 총량 / 30%할인)', price: 42000, status: '확정' },
        { id: 29, product: 'EventStats', pkg: 'PLUS_1Y', label: '[플러스] 연간 (36,000건 총량 / 30%할인)', price: 75600, status: '확정' },
        { id: 30, product: 'EventStats', pkg: 'PRO_1Y', label: '[프로] 연간 (연간 미운영)', price: 0, status: '안' },

        { id: 31, product: 'AutoComment', pkg: 'START_1M', label: '[스타트] 1개월 (1,000건 등록)', price: 5000, status: '확정' },
        { id: 32, product: 'AutoComment', pkg: 'PLUS_1M', label: '[플러스] 1개월 (3,000건 등록)', price: 9000, status: '확정' },
        { id: 33, product: 'AutoComment', pkg: 'PRO_1M', label: '[프로] 3개월 (9,000건 등록)', price: 21000, status: '확정' },
        { id: 34, product: 'AutoComment', pkg: 'START_1Y', label: '[스타트] 연간 (12,000건 총량 / 30%할인)', price: 42000, status: '확정' },
        { id: 35, product: 'AutoComment', pkg: 'PLUS_1Y', label: '[플러스] 연간 (36,000건 총량 / 30%할인)', price: 75600, status: '확정' },
        { id: 36, product: 'AutoComment', pkg: 'PRO_1Y', label: '[프로] 연간 (연간 미운영)', price: 0, status: '안' }
    ];

    const [pricing, setPricing] = useState<PricingItem[]>(() => {
        const saved = localStorage.getItem('3monster_pricing_policies_v4');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) {}
        }
        return defaultPricingList;
    });

    // Force update localStorage with current standard pricing
    useEffect(() => {
        localStorage.setItem('3monster_pricing_policies_v4', JSON.stringify(pricing));
    }, [pricing]);

    // 크몽 ID 입력 시 users 테이블에서 이메일 자동완성
    useEffect(() => {
        const name = formData.buyer_name.trim();
        if (!name) { setEmailAutoFilled(false); return; }

        const timer = setTimeout(async () => {
            const { data } = await supabase
                .from('users')
                .select('email')
                .eq('name', name)
                .maybeSingle();
            if (data?.email) {
                setFormData(prev => ({ ...prev, contact: data.email }));
                setEmailAutoFilled(true);
            } else {
                setEmailAutoFilled(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [formData.buyer_name]);

    // Accordion and Tab States
    const [activeTab, setActiveTab] = useState<'marketing' | 'cafe'>('marketing');
    const [expandedProductId, setExpandedProductId] = useState<string>('NPlace-DB');


    const pricingProducts = {
        marketing: [
            { id: 'NPlace-DB', name: '🏢 NPlace-DB', desc: '네이버 플레이스 DB & 대량발송기' },
            { id: 'ContentCrawler', name: '💻 사이트 컨텐츠 추출기', desc: '웹 데이터 분석 엔진' },
            { id: 'UserManager', name: '👥 회원관리프로그램 확장팩', desc: 'AI 검색 및 메시지 전송' },
        ],
        cafe: [
            { id: 'CafeCrawler', name: '☕ 카페 수집기 Pro', desc: '카페 게시글/댓글 수집기' },
            { id: 'EventStats', name: '📊 이벤트 활동 분석기', desc: '회원 활동지수 집계·이벤트 추첨' },
            { id: 'AutoComment', name: '🤖 카페 댓글 관리기', desc: '스탭 맞춤 템플릿 신속 응대' },
        ]
    };

    // Initial price auto-fill on mount
    useEffect(() => {
        const matched = pricing.find(
            p => p.product.toLowerCase() === formData.product_id.toLowerCase() && p.pkg === formData.license_type
        );
        if (matched) {
            setFormData(prev => ({ ...prev, price_sold: String(matched.price) }));
        } else if (defaultPrices[formData.license_type] !== undefined) {
            setFormData(prev => ({ ...prev, price_sold: String(defaultPrices[formData.license_type]) }));
        }
    }, []);

    const handleProductChange = (productId: string) => {
        const matched = pricing.find(
            p => p.product.toLowerCase() === productId.toLowerCase() && p.pkg === formData.license_type
        );
        let price = '';
        if (matched) {
            price = String(matched.price);
        } else if (defaultPrices[formData.license_type] !== undefined) {
            price = String(defaultPrices[formData.license_type]);
        }
        setFormData(prev => ({
            ...prev,
            product_id: productId,
            price_sold: price || prev.price_sold
        }));

        // Automatically switch Right Tabs and Expand Accordion
        const isMarketing = ['NPlace-DB', 'ContentCrawler', 'UserManager'].includes(productId);
        setActiveTab(isMarketing ? 'marketing' : 'cafe');
        setExpandedProductId(productId);
    };

    const getCalculatedPrice = (licType: string) => {
        const matched = pricing.find(
            p => p.product.toLowerCase() === formData.product_id.toLowerCase() && p.pkg === licType
        );
        if (matched) return String(matched.price);
        if (defaultPrices[licType] !== undefined) return String(defaultPrices[licType]);
        return '5000';
    };

    const handleLicenseTypeChange = (licenseType: string) => {
        const price = getCalculatedPrice(licenseType);
        setFormData(prev => ({
            ...prev,
            license_type: licenseType,
            price_sold: price || prev.price_sold
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

        const isTest = formData.license_type === 'TEST';
        const isStart = formData.license_type.startsWith('START') || formData.license_type === 'DELUXE' || formData.license_type === 'STANDARD';
        const isPro = formData.license_type.startsWith('PRO') || formData.license_type === '3M' || formData.license_type === 'PREMIUM';
        const isPlus = formData.license_type.startsWith('PLUS') || formData.license_type === '1M';
        
        let serial = '';
        if (isTest) {
            serial = `TEST-${generateSerial().split('-').slice(1).join('-')}`;
        } else if (isStart) {
            serial = `START-${generateSerial().split('-').slice(1).join('-')}`;
        } else if (isPro) {
            serial = `PRO-${generateSerial().split('-').slice(1).join('-')}`;
        } else if (isPlus) {
            serial = `PLUS-${generateSerial().split('-').slice(1).join('-')}`;
        } else {
            serial = generateSerial();
        }

        setGeneratedKey(serial);

        try {
            const now = new Date();
            const expireDate = new Date();
            let collectionLimit: number | null = null;

            const isMapScraper = formData.product_id.toLowerCase().includes('nplace') || formData.product_id.toLowerCase().includes('map');

            if (formData.license_type === 'START_1M' || formData.license_type === 'DELUXE' || formData.license_type === 'STANDARD') {
                expireDate.setMonth(now.getMonth() + 1);
                collectionLimit = 1000;
            } else if (formData.license_type === 'START_1Y') {
                expireDate.setFullYear(now.getFullYear() + 1);
                collectionLimit = 12000;
            } else if (formData.license_type === 'PLUS_1M' || formData.license_type === '1M') {
                expireDate.setMonth(now.getMonth() + 1);
                collectionLimit = isMapScraper ? null : 3000;
            } else if (formData.license_type === 'PLUS_1Y') {
                expireDate.setFullYear(now.getFullYear() + 1);
                collectionLimit = isMapScraper ? null : 36000;
            } else if (formData.license_type === 'PRO_1M' || formData.license_type === '3M' || formData.license_type === 'PREMIUM') {
                expireDate.setMonth(now.getMonth() + 3); // 프로 3개월 특가
                collectionLimit = isMapScraper ? null : 9000;
            } else if (formData.license_type === 'PRO_1Y') {
                expireDate.setFullYear(now.getFullYear() + 1);
                collectionLimit = isMapScraper ? null : 108000;
            } else if (formData.license_type === 'TEST') {
                expireDate.setFullYear(now.getFullYear() + 100);
                collectionLimit = 50;
            } else if (formData.license_type === '6M') {
                expireDate.setMonth(now.getMonth() + 6);
                collectionLimit = 18000;
            } else if (formData.license_type === '1Y') {
                expireDate.setFullYear(now.getFullYear() + 1);
                collectionLimit = 36000;
            } else if (formData.license_type === 'LIFETIME') {
                expireDate.setFullYear(now.getFullYear() + 99);
            }

            const suffix = isTest ? ' (TEST)' : '';
            const finalBuyerName = `${formData.buyer_name}${suffix}`;

            const { error } = await supabase
                .from('licenses')
                .insert([{
                    ...formData,
                    contact: formData.contact ? formData.contact.trim() : null,
                    buyer_name: finalBuyerName,
                    serial_key: serial,
                    expire_date: expireDate.toISOString(),
                    collection_limit: collectionLimit,
                    status: 'active',
                    bound_value: null,
                    price_sold: Number(parsePrice(formData.price_sold)) || 0
                }]);

            if (error) throw error;
            setIsKmongModalOpen(true);

        } catch (error: any) {
            console.error("Error creating license:", error);
            alert(`발행 중 오류가 발생했습니다: ${error.message}\n(UID: ${user?.id || 'Not Logged In'})\n관리자에게 문의하거나 Supabase 설정을 확인해주세요.`);
            setGeneratedKey('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-6 pt-0 pb-12 px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Link 
                            to="/admin/licenses" 
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors mr-1"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>구매자 관리</span>
                        </Link>
                        <span className="text-slate-300">/</span>
                        <span className="text-xs font-bold text-indigo-600">수동 키 발급</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        라이선스 키 수동/비상 발급
                    </h1>
                    <p className="text-xs text-slate-400 font-bold">
                        크몽 외부 주문, B2B 법인 대량 계약, CS 보상 및 비상 시 수동으로 라이선스를 생성합니다.
                    </p>
                </div>
                <Link
                    to="/admin/licenses"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs transition-colors self-start sm:self-auto"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>목록으로 돌아가기</span>
                </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-12 items-start">
                {/* Left Form Column */}
                <Card className="lg:col-span-7 p-0 overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-[0_15px_45px_rgba(0,0,0,0.07)]">
                    <CardHeader className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
                        <CardTitle className="text-xl font-black text-white tracking-tighter">라이선스 키 정보 입력</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-950 uppercase tracking-wide ml-0.5">대상 제품 선택</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-14 rounded-xl bg-white px-4 text-base font-extrabold border border-slate-400 focus:border-indigo-650 focus:ring-4 focus:ring-indigo-150 outline-none transition-all appearance-none cursor-pointer text-slate-955"
                                            value={formData.product_id}
                                            onChange={(e) => handleProductChange(e.target.value)}
                                        >
                                            <optgroup label="마케팅몬스터 제품군">
                                                <option value="NPlace-DB">🏢 NPlace-DB (포털 지도 DB)</option>
                                                <option value="ContentCrawler">💻 ContentCrawler (사이트 콘텐츠 크롤러)</option>
                                                <option value="UserManager">👥 UserManager (회원관리 확장팩)</option>
                                            </optgroup>
                                            <optgroup label="카페몬스터 제품군">
                                                <option value="CafeCrawler">☕ CafeCrawler (카페 수집기 Pro)</option>
                                                <option value="EventStats">📊 EventStats (이벤트 활동 분석기)</option>
                                                <option value="AutoComment">🤖 AutoComment (카페 댓글 관리기)</option>
                                            </optgroup>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-955 uppercase tracking-wide ml-0.5">이용 기간 선택</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-14 rounded-xl bg-white px-4 text-base font-extrabold border border-slate-400 focus:border-indigo-650 focus:ring-4 focus:ring-indigo-150 outline-none transition-all appearance-none cursor-pointer text-indigo-900"
                                            value={formData.license_type}
                                            onChange={(e) => handleLicenseTypeChange(e.target.value)}
                                        >
                                            <optgroup label="월간 구독 플랜">
                                                <option value="START_1M">스타트 1M (1,000건 한도 / 5,000원)</option>
                                                <option value="PLUS_1M">플러스 1M (무제한 추출 / 9,000원)</option>
                                                <option value="PRO_1M">프로 3M (3개월 무제한 특가 / 21,000원)</option>
                                            </optgroup>
                                            <optgroup label="연간 구독 플랜 (30% 할인)">
                                                <option value="START_1Y">스타트 1Y (12,000건 총량 / 42,000원)</option>
                                                <option value="PLUS_1Y">플러스 1Y (연간 무제한 / 75,600원)</option>
                                            </optgroup>
                                            <optgroup label="테스트 및 특수">
                                                <option value="TEST">테스트 (50건 제한 / 0원)</option>
                                            </optgroup>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-955 uppercase tracking-wide ml-0.5">가입 / 판매 채널</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-14 rounded-xl bg-white px-4 text-base font-extrabold border border-slate-400 focus:border-indigo-650 focus:ring-4 focus:ring-indigo-150 outline-none transition-all appearance-none cursor-pointer text-slate-955"
                                            value={formData.channel}
                                            onChange={e => {
                                                const newChan = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    channel: newChan,
                                                    buyer_name: '',
                                                    contact: ''
                                                }));
                                            }}
                                        >
                                            <option value="3Monster 직결제">3Monster 직결제</option>
                                            <option value="크몽">크몽</option>
                                            <option value="스마트스토어">스마트스토어</option>
                                            <option value="블로그">블로그</option>
                                            <option value="지인">지인</option>
                                            <option value="기타">기타</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-955 uppercase tracking-wide ml-0.5">판매 가격 (KRW)</label>
                                    <Input placeholder="금액 입력" className="h-14 bg-white border border-slate-400 focus:border-indigo-650 focus:ring-4 focus:ring-indigo-150 text-base font-extrabold px-4 text-slate-955 rounded-xl shadow-sm" value={formatPrice(formData.price_sold)} onChange={e => setFormData({ ...formData, price_sold: parsePrice(e.target.value) })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div ref={buyerDropdownRef} className="space-y-2 relative">
                                    <label className="text-sm font-black text-slate-955 uppercase tracking-wide ml-0.5">크몽 별명 (구매자 ID)</label>
                                    <Input
                                        required
                                        placeholder="크몽 별명 또는 구매자 ID를 입력하세요"
                                        className="h-14 bg-white border border-slate-400 focus:border-indigo-650 focus:ring-4 focus:ring-indigo-150 text-base font-extrabold px-4 rounded-xl text-slate-955 placeholder:text-slate-400 shadow-sm"
                                        value={formData.buyer_name}
                                        onFocus={() => {
                                             if (trimmedBuyer.length >= 1) setShowSuggestions(true);
                                        }}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setFormData({ ...formData, buyer_name: val });
                                            if (val.trim().length >= 1) {
                                                setShowSuggestions(true);
                                            } else {
                                                setShowSuggestions(false);
                                            }
                                        }}
                                    />
                                    {/* 글자 입력 시에만 뜨는 슬림한 플로팅 자동완성 드롭다운 */}
                                    {showSuggestions && trimmedBuyer.length >= 1 && matchingBuyers.length > 0 && (
                                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                                            {matchingBuyers.map((b, i) => (
                                                <div
                                                    key={i}
                                                    className="px-4 py-2.5 hover:bg-indigo-50/80 cursor-pointer flex justify-between items-center transition-colors text-left"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            buyer_name: b.buyer_name,
                                                            contact: b.contact,
                                                            channel: b.channel || prev.channel
                                                        }));
                                                        setEmailAutoFilled(true);
                                                        setShowSuggestions(false);
                                                    }}
                                                >
                                                    <div>
                                                        <div className="font-extrabold text-xs text-slate-900">{b.buyer_name}</div>
                                                        <div className="text-[11px] font-medium text-slate-500 font-mono">{b.contact}</div>
                                                    </div>
                                                    {b.channel && (
                                                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                                                            {b.channel}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2 relative">
                                    <label className="text-sm font-black text-slate-955 uppercase tracking-wide ml-0.5">이메일 주소 (선택 사항)</label>
                                    {emailAutoFilled && (
                                        <span className="absolute right-0 top-0 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                            ✓ 기존 회원 자동연동
                                        </span>
                                    )}
                                    <Input
                                        type="email"
                                        placeholder="이메일 주소 (미입력 시 크몽 별명만으로 발급)"
                                        className={`h-14 bg-white text-base font-extrabold px-4 rounded-xl shadow-sm ${
                                            emailAutoFilled
                                                ? 'border-emerald-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100'
                                                : 'border border-slate-400 focus:border-indigo-650 focus:ring-4 focus:ring-indigo-150'
                                        } text-slate-955 placeholder:text-slate-400`}
                                        value={formData.contact}
                                        onChange={e => {
                                            setEmailAutoFilled(false);
                                            setFormData({ ...formData, contact: e.target.value });
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-955 uppercase tracking-wide ml-0.5">메모 (특이사항 / 연락처 등)</label>
                                <Input placeholder="기타 연락처나 특이사항이 있다면 입력하세요" className="h-14 bg-white border border-slate-400 focus:border-indigo-650 focus:ring-4 focus:ring-indigo-150 text-base font-extrabold px-4 text-slate-955 rounded-xl shadow-sm" value={formData.memo} onChange={e => setFormData({ ...formData, memo: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Button type="submit" className="h-16 text-white font-black text-base sm:text-lg shadow-md hover:bg-indigo-750 active:scale-[0.99] transition-all bg-indigo-600 rounded-xl border-b-4 border-indigo-900 border-none animate-none flex items-center justify-center gap-1 cursor-pointer" isLoading={loading}>
                                    <span>라이선스 키 즉시 발급하기</span>
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => setIsKmongModalOpen(true)}
                                    className="h-16 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-base rounded-xl shadow-md border-b-4 border-amber-800 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                                >
                                    <ShoppingBag className="w-5 h-5 text-amber-200" />
                                    <span>📋 크몽 발송문 팝업</span>
                                </button>
                            </div>

                            <div className="pt-4 border-t border-slate-200 mt-4 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-black text-slate-955 uppercase tracking-wide ml-0.5">
                                        GitHub 최신 다운로드 링크 (정품 / 무료체험 단일 공용)
                                    </label>
                                    {copiedDownloadType && (
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-in fade-in">
                                            ✓ {copiedDownloadType} 최신 다운로드 URL 복사완료!
                                        </span>
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow border-none text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer"
                                    onClick={() => handleCopyDownloadUrl(formData.product_id)}
                                >
                                    <Copy className="w-4 h-4 text-indigo-300" />
                                    <span>[최신 배포본] {formData.product_id} 다운로드 URL 복사</span>
                                </Button>
                                <p className="text-[11px] text-slate-500 font-medium pl-0.5 leading-tight">
                                    ※ 정품 구매 고객과 무료 체험 희망자 모두 위 단일 파일(링크 1개)로 전달하시면 됩니다. 프로그램 실행 시 정품 키 유무에 따라 자동 분기됩니다.
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Right Column: Key Output & Accordion Pricing Table */}
                <div className="lg:col-span-5 space-y-6">
                    <AnimatePresence>
                        {generatedKey && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                <Card className={`${generatedKey.startsWith('TEST-') ? 'bg-emerald-600' : 'bg-indigo-600'} text-white p-6 space-y-4 shadow-lg rounded-2xl border-none`}>
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
                                            {generatedKey.startsWith('TEST-') ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                        </div>
                                        <h4 className="font-black text-sm">
                                            {generatedKey.startsWith('TEST-') ? '테스트 라이선스 키 발급 완료' : '정식 라이선스 키 발급 완료'}
                                        </h4>
                                    </div>
                                    <div className="rounded-xl bg-white/10 p-4 text-center">
                                        <p className="font-mono text-base font-black tracking-wider">{generatedKey}</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <Button
                                            onClick={() => { navigator.clipboard.writeText(generatedKey); alert('라이선스 키가 복사되었습니다!'); }}
                                            fullWidth
                                            className="bg-white text-slate-900 hover:bg-slate-50 h-12 font-bold text-xs rounded-xl"
                                        >
                                            <Copy className="mr-1.5 h-4 w-4" /> 키만 복사
                                        </Button>
                                        <Button
                                            onClick={() => setIsKmongModalOpen(true)}
                                            fullWidth
                                            className="bg-amber-400 hover:bg-amber-300 text-amber-950 h-12 font-black text-xs rounded-xl border-none"
                                        >
                                            <ShoppingBag className="mr-1.5 h-4 w-4 text-amber-900" /> 크몽 발송문 열기
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>


                    {/* Interactive Pricing Policy Table with Tabs and Accordions */}
                    <Card className="p-0 overflow-hidden bg-white border border-slate-200 shadow-[0_15px_45px_rgba(0,0,0,0.07)] rounded-2xl">
                        <CardHeader className="px-5 py-2 border-b-2 border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
                            <CardTitle className="text-sm font-black text-white flex items-center gap-1.5">
                                📋 3Monster 제품별 가격표
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            {/* Category Tabs */}
                            <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner">
                                <button
                                    type="button"
                                    onClick={() => { setActiveTab('marketing'); setExpandedProductId('NPlace-DB'); }}
                                    className={cn(
                                        "flex-1 py-2.5 text-xs font-black rounded-lg transition-all cursor-pointer border-none outline-none focus:outline-none",
                                        activeTab === 'marketing'
                                            ? "bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] scale-[1.01]"
                                            : "text-slate-650 hover:text-slate-900 hover:bg-white/50"
                                    )}
                                >
                                    마케팅몬스터
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setActiveTab('cafe'); setExpandedProductId('CafeCrawler'); }}
                                    className={cn(
                                        "flex-1 py-2.5 text-xs font-black rounded-lg transition-all cursor-pointer border-none outline-none focus:outline-none",
                                        activeTab === 'cafe'
                                            ? "bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] scale-[1.01]"
                                            : "text-slate-655 hover:text-slate-900 hover:bg-white/50"
                                    )}
                                >
                                    카페몬스터
                                </button>
                            </div>

                            {/* Product Accordion List */}
                            <div className="space-y-2.5">
                                {pricingProducts[activeTab].map((prod) => {
                                    const isExpanded = expandedProductId === prod.id;
                                    const prodPricing = pricing.filter(p => p.product === prod.id);

                                    return (
                                        <div key={prod.id} className={cn(
                                            "border rounded-xl overflow-hidden bg-white transition-all duration-200",
                                            isExpanded
                                                ? "border-indigo-500 shadow-md ring-2 ring-indigo-500/10"
                                                : "border-slate-300 hover:border-slate-400 shadow-sm"
                                        )}>
                                            {/* Accordion Trigger Header */}
                                            <button
                                                type="button"
                                                onClick={() => setExpandedProductId(isExpanded ? '' : prod.id)}
                                                className={cn(
                                                    "w-full px-4 py-3 text-left font-black text-xs text-slate-800 transition-colors flex items-center justify-between border-none",
                                                    isExpanded ? "bg-indigo-50/50 border-b border-indigo-100" : "bg-slate-50 hover:bg-slate-100/70"
                                                )}
                                            >
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-black text-slate-850 text-xs">{prod.name}</span>
                                                    <span className="text-[9px] text-slate-400 font-bold">{prod.desc}</span>
                                                </div>
                                                <span className={cn(
                                                    "text-[9px] font-black px-2 py-0.5 rounded shrink-0",
                                                    prodPricing.some(p => p.status === '확정')
                                                        ? "bg-emerald-600 text-white shadow-sm"
                                                        : "bg-slate-200 text-slate-700"
                                                )}>
                                                    {prodPricing.some(p => p.status === '확정') ? '출시 확정' : '준비 중'}
                                                </span>
                                            </button>

                                            {/* Accordion Content showing prices */}
                                            {isExpanded && (
                                                <div className="p-4 space-y-3 bg-white divide-y divide-slate-100 animate-in slide-in-from-top-1 duration-150">
                                                    {prodPricing.map((item) => (
                                                        <div key={item.id} className="flex items-center justify-between gap-2 text-xs pt-2.5 first:pt-0 border-none">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-700">{item.label}</span>
                                                                <span className="text-[9px] text-slate-450 font-mono uppercase">{item.pkg}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                <div className="relative flex items-center">
                                                                    <input
                                                                        type="text"
                                                                        className="w-20 h-7 text-right pr-4 pl-1 font-bold border border-slate-300 rounded text-slate-850 focus:border-indigo-500 focus:outline-none text-[11px]"
                                                                        value={formatPrice(item.price)}
                                                                        onChange={(e) => handleUpdatePrice(item.id, Number(parsePrice(e.target.value)) || 0)}
                                                                    />
                                                                    <span className="absolute right-1 text-[9px] text-slate-400 font-bold pointer-events-none">원</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleToggleStatus(item.id)}
                                                                    className={cn(
                                                                        "px-2.5 py-1 rounded text-[10px] font-black transition-all cursor-pointer text-white shadow-sm border-none shrink-0",
                                                                        item.status === '확정'
                                                                            ? "bg-emerald-600 hover:bg-emerald-700 active:scale-95"
                                                                            : "bg-amber-500 hover:bg-amber-600 active:scale-95"
                                                                    )}
                                                                >
                                                                    {item.status}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 제품별 무료체험판 안내 섹션 */}
                    <Card className="border-slate-200 mt-6 bg-blue-50/50">
                        <CardHeader className="pb-3 border-b border-slate-100">
                            <CardTitle className="text-sm text-slate-800 flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-700 p-1.5 rounded-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                </span>
                                제품별 무료체험판 정책
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 pb-4">
                            <ul className="space-y-2 text-sm text-slate-600 font-medium">
                                <li className="flex items-center justify-between p-2 bg-white rounded border border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        <span>NPlace-DB (포털 지도 DB)</span>
                                    </div>
                                    <span className="text-slate-500 bg-slate-50 px-2 py-0.5 rounded text-xs font-bold border border-slate-200">
                                        기한 무제한 / 50건 한도
                                    </span>
                                </li>
                                <li className="flex items-center justify-between p-2 bg-white rounded border border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                        <span>추후 다른 제품들도 추가 예정</span>
                                    </div>
                                    <span className="text-slate-400 text-xs">
                                        -
                                    </span>
                                </li>
                            </ul>
                            <p className="text-xs text-slate-400 mt-3 flex items-start gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                                체험판 모드(TRIAL-MODE) 진입 시 자동으로 적용되는 한도입니다. 디럭스(1개월) 등과 혼동하지 마세요.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* 크몽 작업물 발송 안내 모달 (팝업) */}
            {isKmongModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-700 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="p-2 bg-white/20 rounded-xl shadow-xs">
                                    <ShoppingBag className="w-5 h-5 text-white" />
                                </span>
                                <div>
                                    <h3 className="font-black text-base text-white flex items-center gap-2">
                                        크몽 작업물 발송 메시지 완성기
                                    </h3>
                                    <p className="text-[11px] text-amber-100 font-medium">
                                        크몽 [작업물 발송] 모달의 [의뢰인에게 보내는 메시지]에 그대로 붙여넣기 하세요.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsKmongModalOpen(false)}
                                className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-slate-800">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-3.5 gap-2 text-xs text-amber-900 font-semibold">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-amber-200 text-amber-950 font-black rounded text-[10px]">
                                        구매자 & 플랜
                                    </span>
                                    <span>
                                        <strong>{formData.buyer_name || '구매자(별명)'}</strong> 님 · {formData.product_id} ({formData.license_type})
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-slate-500 font-medium">발급 키:</span>
                                    {generatedKey ? (
                                        <strong className="font-mono text-indigo-700 font-black bg-white px-2 py-0.5 rounded border border-indigo-200 shadow-2xs">
                                            {generatedKey}
                                        </strong>
                                    ) : (
                                        <span className="text-amber-700 font-bold bg-amber-100/80 px-2 py-0.5 rounded">
                                            ⚠️ 키 발급 전 (임시키 표시됨)
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-black text-slate-700">전송 메시지 본문 미리보기</label>
                                    <span className="text-[11px] text-slate-400 font-medium">클릭하거나 아래 버튼으로 원클릭 전체 복사</span>
                                </div>
                                <pre className="bg-slate-900 text-emerald-300 p-4 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed border border-slate-800 max-h-72 overflow-y-auto select-all shadow-inner">
                                    {generateKmongMessage(formData.product_id, generatedKey, formData.buyer_name)}
                                </pre>
                            </div>

                            <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl text-xs text-blue-900 font-medium space-y-1">
                                <div className="font-bold flex items-center gap-1.5 text-blue-950">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                    <span>크몽 발송 실무 안내</span>
                                </div>
                                <p className="text-[11px] text-blue-800 leading-normal pl-5">
                                    크몽 거래창의 <strong>[작업물 발송]</strong> 모달을 열고 <strong>[의뢰인에게 보내는 메시지]</strong> 입력창에 <strong className="text-indigo-900 bg-white px-1 py-0.5 rounded border border-blue-200">Ctrl + V (붙여넣기)</strong> 하신 뒤 발송 완료를 누르시면 됩니다.
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => setIsKmongModalOpen(false)}
                                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
                            >
                                닫기
                            </button>
                            <button
                                type="button"
                                onClick={handleCopyKmongTemplate}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {copiedKmongText ? (
                                    <>
                                        <Check className="w-4 h-4 text-emerald-300" />
                                        <span>✓ 클립보드 복사 완료! (크몽에 Ctrl+V)</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        <span>📋 크몽 발송문 전체 복사하기</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
