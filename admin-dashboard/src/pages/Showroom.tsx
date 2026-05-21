import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { 
    Layers, 
    Smartphone, 
    Monitor, 
    MessageSquare, 
    ArrowRight,
    ShieldCheck,
    Zap,
    MapPin,
    MessageCircle,
    BellRing
} from 'lucide-react';

const productCategories = [
    {
        id: 'marketing-monster',
        name: '마케팅 몬스터',
        subtitle: '최고 품질의 타겟 고객 DB를 무제한으로 정밀 추출하는 데이터 수집 라인업',
        products: [
            {
                id: 'nplace-db',
                title: "NPlace-DB Pro",
                subtitle: "네이버 플레이스 정밀 수집기",
                description: "국내 유일의 Apollo State 파싱 엔진 탑재. 이메일, 인스타그램, 블로그 등 마케팅에 필수적인 실시간 플레이스 DB를 광속으로 수집합니다.",
                icon: Layers,
                color: "from-blue-600 to-indigo-700",
                badge: "Best Seller",
                features: ["이메일/인스타 자동 추출", "실시간 중복 필터링", "무제한 Excel/CSV 저장"]
            },
            {
                id: 'place-finder',
                title: "지도 수집기 (Place Finder)",
                subtitle: "지역/업종별 매칭 검색기",
                description: "원하는 지역 and 키워드만 입력하면 네이버 지도의 위치 정보와 업체 정보를 한눈에 분석 가능한 깔끔한 형태로 재가공해 줍니다.",
                icon: MapPin,
                color: "from-blue-400 to-cyan-600",
                badge: "Lightweight",
                features: ["구역별 분할 수집", "영업 시간 및 예약 여부 집계", "초보자용 원버튼 구동"]
            }
        ]
    },
    {
        id: 'cafe-monster',
        name: '카페 몬스터',
        subtitle: '네이버 카페 마케팅 채널 침투 및 소통을 자동화하는 고효율 에이전트',
        products: [
            {
                id: 'cafe-crawler',
                title: "카페 크롤러 Pro",
                subtitle: "전방위 카페 타겟 수집기",
                description: "특정 네이버 카페 내 게시글과 작성자 목록, 실시간 새글 키워드를 추적하여 마케팅 효율을 비약적으로 증가시키는 최강의 파이프라인.",
                icon: Smartphone,
                color: "from-orange-500 to-rose-600",
                badge: "AI Powered",
                features: ["신규 게시글 실시간 알림", "작성자 활동 패턴 통계", "타겟팅 DB 대량 수집"]
            },
            {
                id: 'stealth-comment',
                title: "스텔스 댓글러 (Stealth Commenter)",
                subtitle: "스마트 자동 소통 솔루션",
                description: "봇 탐지 시스템을 우회하는 인간 행동 시뮬레이션 알고리즘을 탑재하여 타겟 글에 자연스러운 상호작용 댓글을 자동 작성합니다.",
                icon: MessageCircle,
                color: "from-pink-500 to-purple-600",
                badge: "Hot",
                features: ["랜덤 휴식 딜레이 시스템", "멀티 계정 순환 구동", "스마트 답변 키워드 룰"]
            }
        ]
    },
    {
        id: 'app-monster',
        name: '앱 몬스터',
        subtitle: '비즈니스의 안정성과 생산성을 향상시키는 고성능 유틸리티 솔루션',
        products: [
            {
                id: 'paper-crawler',
                title: "페이퍼 크롤러 (Paper Crawler)",
                subtitle: "학술 및 전문 데이터 수집기",
                description: "학술지, RISS, DBpia 등 지식 기반 전문 마케팅용 고난도 텍스트 데이터를 정교하게 크롤링하여 요약 파일로 자동 빌드합니다.",
                icon: Monitor,
                color: "from-emerald-500 to-teal-600",
                badge: "Professional",
                features: ["학술 포털 최적화 스크래핑", "핵심 초록 AI 문맥 요약", "구조화된 데이터 추출"]
            },
            {
                id: 'mobile-notifier',
                title: "모바일 알림 몬스터",
                subtitle: "작업 진행 상황 실시간 모니터링",
                description: "구동 중인 모든 수집/발송 엔진의 예외 에러 및 일일 성과 통계를 사용자의 스마트폰 푸시 알림으로 24시간 실시간 전달하는 스마트 앱.",
                icon: BellRing,
                color: "from-amber-500 to-orange-600",
                badge: "New Release",
                features: ["텔레그램/슬랙 알림 동기화", "엔진 원격 중단 신호 감지", "일일 보고서 자동 발송"]
            }
        ]
    }
];

export const Showroom = () => {
    return (
        <div className="max-w-7xl mx-auto space-y-20 py-12 px-6">
            {/* Hero Banner Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-12 lg:p-20 text-white shadow-2xl">
                <div className="relative z-10 max-w-3xl space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-black tracking-widest uppercase">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Reliable Marketing Suite
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-tight">
                        압도적인 마케팅 자동화<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
                            3Monster 솔루션
                        </span>
                    </h1>
                    <p className="text-slate-400 font-bold text-base lg:text-lg leading-relaxed max-w-2xl">
                        타겟 고객 DB 수집부터 채널 활성화, 원격 제어까지 비즈니스 성장을 위한 올인원 솔루션을 만나보세요. 3Monster 패밀리 앱은 최고의 성능과 보안성을 보장합니다.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-6">
                        <Link to="/support">
                            <Button 
                                className="h-16 px-10 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl shadow-indigo-500/20 shadow-2xl transition-all flex items-center gap-3"
                            >
                                <MessageSquare className="w-5 h-5" /> 1:1 고객센터 문의하기
                            </Button>
                        </Link>
                        <Button 
                            variant="outline"
                            onClick={() => {
                                const target = document.getElementById('marketing-monster');
                                if (target) target.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="h-16 px-10 border-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white font-black text-lg rounded-2xl transition-all"
                        >
                            제품 리스트 구경하기
                        </Button>
                    </div>
                </div>
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
                <Zap className="absolute -bottom-16 -right-16 w-80 h-80 text-indigo-500/5 rotate-12" />
            </div>

            {/* Product Category Groups */}
            {productCategories.map((category) => (
                <section 
                    key={category.id} 
                    id={category.id} 
                    className="space-y-8 scroll-mt-24"
                >
                    <div className="border-l-4 border-indigo-600 pl-6 space-y-2">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{category.name}</h2>
                        <p className="text-slate-500 font-bold text-sm">{category.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {category.products.map((product) => (
                            <Card 
                                key={product.id} 
                                className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] bg-white h-full flex flex-col"
                            >
                                <div className={`h-3 p-0 w-full bg-gradient-to-r ${product.color}`} />
                                <div className="p-10 space-y-8 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${product.color}`}>
                                            <product.icon className="w-7 h-7" />
                                        </div>
                                        <span className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                                            {product.badge}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-black text-slate-900">{product.title}</h3>
                                        <p className="text-indigo-600 font-black text-sm">{product.subtitle}</p>
                                        <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                            {product.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 pt-2">
                                        {product.features.map(f => (
                                            <div key={f} className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {f}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-6 mt-auto flex gap-3">
                                        <Link to="/support" className="flex-1">
                                            <Button className="w-full h-12 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                                                이용 및 도입 문의 <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            ))}

            {/* Custom request section */}
            <div className="text-center py-12 border-t border-slate-100">
                <p className="text-slate-400 font-bold mb-4">비즈니스에 맞춤형 기능이 필요하신가요?</p>
                <Link to="/support">
                    <Button variant="ghost" className="text-indigo-600 font-black hover:bg-indigo-50 px-8 py-4 h-auto rounded-2xl">
                        커스텀 제작 의뢰하기 <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
};
