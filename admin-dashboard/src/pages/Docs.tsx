import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { 
    BookOpen, 
    Download, 
    MousePointerClick, 
    Mail, 
    MessageCircle, 
    AlertCircle, 
    ArrowLeft, 
    Key, 
    ExternalLink, 
    HelpCircle, 
    CheckCircle2, 
    ShieldCheck, 
    Sparkles,
    Smartphone,
    BarChart3,
    Trophy
} from 'lucide-react';

type ProductGroup = 'nplace-db' | 'cafe-monster' | 'app-monster';

export function Docs() {
    const { productId } = useParams<{ productId?: string }>();
    const navigate = useNavigate();

    // Determine initial product group based on URL param
    const getInitialGroup = (id?: string): ProductGroup => {
        if (!id) return 'nplace-db';
        const clean = id.toLowerCase().replace(/[-_]/g, '');
        if (clean.includes('cafe') || clean.includes('comment') || clean.includes('event')) {
            return 'cafe-monster';
        }
        if (clean.includes('sundreamer') || clean.includes('realpick') || clean.includes('app')) {
            return 'app-monster';
        }
        return 'nplace-db';
    };

    const [selectedGroup, setSelectedGroup] = useState<ProductGroup>(() => getInitialGroup(productId));
    const [activeTab, setActiveTab] = useState<string>('install');

    // Sync if URL param changes
    useEffect(() => {
        const group = getInitialGroup(productId);
        setSelectedGroup(group);
        setActiveTab('install');
    }, [productId]);

    // Download URL generator
    const getTrialDownloadUrl = () => {
        const t = Date.now();
        if (selectedGroup === 'cafe-monster') {
            return `https://github.com/Han-jinwook/CafeScraper/releases/latest/download/CafeMonster-Trial.zip?t=${t}`;
        }
        return `https://github.com/Han-jinwook/n-place-db/releases/latest/download/Map_DB-Trial.zip?t=${t}`;
    };

    return (
        <div className="max-w-[1040px] mx-auto space-y-8 pt-2 pb-16 px-4">
            {/* Top Navigation Bar */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                                설치 & 사용 가이드
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 font-bold mt-0.5">
                                3Monster 정식 소프트웨어 및 웹앱의 설치, 정품 활성화, 실무 활용 매뉴얼입니다.
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                            if (window.history.length > 1) {
                                navigate(-1);
                            } else {
                                navigate('/showroom');
                            }
                        }}
                        className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-600 hover:text-slate-900 transition-colors bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        쇼룸으로 돌아가기
                    </button>
                </div>
            </div>

            {/* Product Selector Switcher */}
            <div className="bg-slate-100/90 p-1.5 rounded-2xl grid grid-cols-3 gap-1.5 shadow-inner">
                <button
                    onClick={() => {
                        setSelectedGroup('nplace-db');
                        setActiveTab('install');
                    }}
                    className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-black text-xs sm:text-sm transition-all ${
                        selectedGroup === 'nplace-db'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                    }`}
                >
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 hidden sm:inline-block" />
                    📍 포털 지도 DB 추출기
                </button>

                <button
                    onClick={() => {
                        setSelectedGroup('cafe-monster');
                        setActiveTab('install');
                    }}
                    className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-black text-xs sm:text-sm transition-all ${
                        selectedGroup === 'cafe-monster'
                            ? 'bg-white text-orange-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                    }`}
                >
                    <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 hidden sm:inline-block" />
                    ☕ 카페 몬스터 올인원
                </button>

                <button
                    onClick={() => {
                        setSelectedGroup('app-monster');
                        setActiveTab('install');
                    }}
                    className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-black text-xs sm:text-sm transition-all ${
                        selectedGroup === 'app-monster'
                            ? 'bg-white text-pink-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                    }`}
                >
                    <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0 hidden sm:inline-block" />
                    📱 앱 몬스터 (PWA 웹앱)
                </button>
            </div>

            {/* Quick Banner for Download & Purchase */}
            {selectedGroup !== 'app-monster' ? (
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-slate-200">
                    <div className="space-y-1 text-center sm:text-left">
                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-black tracking-wider text-indigo-300 uppercase">
                                {selectedGroup === 'nplace-db' ? 'NPlace-DB Extraction Engine' : 'CafeMonster Suite'}
                            </span>
                        </div>
                        <p className="text-sm sm:text-base font-bold text-slate-100">
                            지금 바로 무료 체험판을 내려받아 내 PC에서 직접 구동해 보세요!
                        </p>
                    </div>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                        <a
                            href={getTrialDownloadUrl()}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm transition-all shadow-sm"
                        >
                            <Download className="w-4 h-4" />
                            무료체험판 (.zip) 받기
                        </a>
                        <Link
                            to={selectedGroup === 'nplace-db' ? '/showroom#marketing-monster' : '/showroom#cafe-monster'}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all"
                        >
                            정품 요금제 확인 ↗
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-pink-950 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-slate-200">
                    <div className="space-y-1 text-center sm:text-left">
                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                            <Sparkles className="w-4 h-4 text-pink-400" />
                            <span className="text-xs font-black tracking-wider text-pink-300 uppercase">
                                100% Free Web Application
                            </span>
                        </div>
                        <p className="text-sm sm:text-base font-bold text-slate-100">
                            앱 몬스터는 별도 설치 없이 모바일과 PC 웹 브라우저에서 1초 만에 바로 실행됩니다.
                        </p>
                    </div>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                        <a
                            href="https://sundreamer.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm transition-all shadow-sm"
                        >
                            <ExternalLink className="w-4 h-4" />
                            썬드리머 실행
                        </a>
                        <a
                            href="https://real-pick.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-black text-xs sm:text-sm transition-all shadow-sm"
                        >
                            <ExternalLink className="w-4 h-4" />
                            리얼픽 실행
                        </a>
                    </div>
                </div>
            )}

            {/* Sub Tabs based on selected product group */}
            {selectedGroup === 'nplace-db' && (
                <div className="flex bg-slate-100/80 p-1.5 rounded-2xl gap-1 overflow-x-auto">
                    {[
                        { id: 'install', label: '1. 설치 & 정품키 등록', icon: Key },
                        { id: 'collect', label: '2. 지도 DB 실시간 수집', icon: MousePointerClick },
                        { id: 'email', label: '3. 이메일(SMTP) 자동 발송', icon: Mail },
                        { id: 'insta', label: '4. 인스타그램 DM 영업', icon: MessageCircle },
                        { id: 'faq', label: '자주 묻는 질문 (FAQ)', icon: HelpCircle },
                    ].map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                                    isActive 
                                    ? 'bg-white text-indigo-600 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            )}

            {selectedGroup === 'cafe-monster' && (
                <div className="flex bg-slate-100/80 p-1.5 rounded-2xl gap-1 overflow-x-auto">
                    {[
                        { id: 'install', label: '1. 설치 & 정품키 등록', icon: Key },
                        { id: 'crawler', label: '2. 게시글/댓글 크롤러', icon: MousePointerClick },
                        { id: 'stats', label: '3. 댓글 통계 & 여론 분석', icon: BarChart3 },
                        { id: 'event', label: '4. 이벤트/활동 랭킹 집계', icon: Trophy },
                        { id: 'faq', label: '자주 묻는 질문 (FAQ)', icon: HelpCircle },
                    ].map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                                    isActive 
                                    ? 'bg-white text-orange-600 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-orange-600' : 'text-slate-400'}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            )}

            {selectedGroup === 'app-monster' && (
                <div className="flex bg-slate-100/80 p-1.5 rounded-2xl gap-1 overflow-x-auto">
                    {[
                        { id: 'install', label: '1. 홈 화면 바로가기 (PWA 추가)', icon: Smartphone },
                        { id: 'sundreamer', label: '2. 썬드리머 (회원앱) 안내', icon: Sparkles },
                        { id: 'realpick', label: '3. 리얼픽 (시청비서 MVP) 안내', icon: BookOpen },
                        { id: 'faq', label: '자주 묻는 질문 (FAQ)', icon: HelpCircle },
                    ].map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                                    isActive 
                                    ? 'bg-white text-pink-600 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-pink-600' : 'text-slate-400'}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* TAB CONTENTS */}
            <Card className="border-slate-200/80 shadow-sm rounded-3xl overflow-hidden bg-white">
                <CardContent className="p-6 sm:p-10">

                    {/* ============================================================== */}
                    {/* GROUP 1: NPlace-DB Content                                     */}
                    {/* ============================================================== */}
                    {selectedGroup === 'nplace-db' && (
                        <>
                            {/* TAB: INSTALL & LICENSE */}
                            {activeTab === 'install' && (
                                <div className="space-y-8">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-black mb-2">
                                            Step 1 ~ Step 4
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                            N플레이스 DB 추출기 설치 및 라이선스 등록
                                        </h2>
                                        <p className="text-slate-500 text-sm font-bold mt-1">
                                            다운로드부터 라이선스 키 입력까지 1분이면 즉시 사용 준비가 완료됩니다.
                                        </p>
                                    </div>

                                    <div className="space-y-6 text-slate-700 text-sm leading-relaxed font-medium">
                                        {/* Step 1 */}
                                        <div className="border border-slate-200/80 rounded-2xl p-5 space-y-2 bg-slate-50/50">
                                            <div className="flex items-center gap-2 text-indigo-600 font-black">
                                                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">1</span>
                                                <span>프로그램 압축 파일 다운로드</span>
                                            </div>
                                            <p className="pl-8 text-slate-600">
                                                상단의 <strong>[무료체험판 (.zip) 받기]</strong> 버튼을 눌러 최신 배포본(<code className="bg-slate-200/80 px-1.5 py-0.5 rounded text-indigo-700 font-mono text-xs">Map_DB-Trial.zip</code>)을 다운로드합니다.
                                            </p>
                                        </div>

                                        {/* Step 2 */}
                                        <div className="border border-slate-200/80 rounded-2xl p-5 space-y-2 bg-slate-50/50">
                                            <div className="flex items-center gap-2 text-indigo-600 font-black">
                                                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">2</span>
                                                <span>전용 폴더에 압축 풀기</span>
                                            </div>
                                            <p className="pl-8 text-slate-600">
                                                다운로드된 압축 파일을 마우스 우클릭 후 <strong>[압축 풀기]</strong>를 진행합니다.
                                                <br />
                                                <span className="text-xs text-amber-600 font-bold">
                                                    ※ 권장 경로: <code className="bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">C:\3Monster\NPlace-DB</code> 또는 바탕화면 전용 폴더 (한글 특수문자 없는 영문 경로 권장)
                                                </span>
                                            </p>
                                        </div>

                                        {/* Step 3 */}
                                        <div className="border border-slate-200/80 rounded-2xl p-5 space-y-2 bg-slate-50/50">
                                            <div className="flex items-center gap-2 text-indigo-600 font-black">
                                                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">3</span>
                                                <span>프로그램 실행</span>
                                            </div>
                                            <p className="pl-8 text-slate-600">
                                                압축 해제된 폴더 안의 <code className="bg-slate-900 text-emerald-400 px-2 py-0.5 rounded font-mono font-black text-xs">NPlace-DB-실행.bat</code> (또는 실행 파일)을 더블 클릭하여 실행합니다.
                                            </p>
                                        </div>

                                        {/* SmartScreen Warning Alert */}
                                        <div className="bg-amber-50 border-2 border-amber-200/80 rounded-2xl p-5 flex gap-4">
                                            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                                            <div className="space-y-1.5">
                                                <h4 className="font-black text-amber-900 text-base">
                                                    Windows의 PC 보호 (SmartScreen) 화면이 나타나는 경우
                                                </h4>
                                                <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                                                    처음 실행 시 마이크로소프트의 기본 보안 안내창이 뜰 수 있습니다. 이는 신규 설치 파일에 대한 정상적인 윈도우 보호 동작입니다.
                                                    <br />
                                                    화면의 <strong className="underline decoration-amber-500 underline-offset-2">[추가 정보]</strong> 링크를 클릭하신 뒤, 우측 하단에 나타나는 <strong className="bg-amber-200/80 px-1.5 py-0.5 rounded text-amber-900 font-black">[실행]</strong> 버튼을 누르시면 정상 시작됩니다.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Step 4: License Activation */}
                                        <div className="border-2 border-indigo-200 bg-indigo-50/40 rounded-2xl p-5 space-y-3">
                                            <div className="flex items-center gap-2 text-indigo-900 font-black text-base">
                                                <Key className="w-5 h-5 text-indigo-600" />
                                                <span>4. 정품 라이선스 키 (CM-XXXX-XXXX-XXXX) 등록 방법</span>
                                            </div>
                                            <ul className="list-decimal pl-6 space-y-2 text-slate-700 text-xs sm:text-sm">
                                                <li>
                                                    3Monster 쇼룸에서 결제를 완료하면 화면과 <strong>[마이페이지 / 구매내역]</strong>에 16자리 정품 라이선스 키가 즉시 발급됩니다.
                                                </li>
                                                <li>
                                                    프로그램 우측 상단(또는 환경설정 메뉴)의 <strong>[라이선스 키 등록]</strong> 버튼을 클릭합니다.
                                                </li>
                                                <li>
                                                    발급받으신 시리얼 키(<code className="bg-white border border-indigo-200 px-2 py-0.5 rounded text-indigo-600 font-mono font-bold">CM-XXXX-XXXX-XXXX</code>)를 복사하여 붙여넣은 뒤 <strong>[인증 확인]</strong>을 누릅니다.
                                                </li>
                                                <li>
                                                    인증 즉시 무료체험 제한(100건)이 해제되며, 구매하신 기간 동안 무제한 정품 라이선스가 활성화됩니다.
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: COLLECT */}
                            {activeTab === 'collect' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                            포털 지도 데이터 실시간 수집 방법
                                        </h2>
                                        <p className="text-slate-500 text-sm font-bold mt-1">
                                            타겟 지역과 업종 키워드만 지정하면 연락처, 도로명주소, 홈페이지, SNS 정보까지 한 번에 수집됩니다.
                                        </p>
                                    </div>

                                    <div className="space-y-5 text-slate-700 text-sm leading-relaxed font-medium">
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                                            <h3 className="font-black text-slate-900 flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1. 타겟 지역 선택
                                            </h3>
                                            <p className="text-xs sm:text-sm text-slate-600">
                                                좌측 패널에서 영업을 희망하는 <strong>시/도</strong>(예: 서울특별시)와 <strong>구/군</strong>(예: 강남구, 서초구)을 선택합니다. 여러 지역을 체크하여 순차 자동 수집할 수 있습니다.
                                            </p>
                                        </div>

                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                                            <h3 className="font-black text-slate-900 flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 2. 업종 키워드 입력
                                            </h3>
                                            <p className="text-xs sm:text-sm text-slate-600">
                                                검색할 업종 키워드를 콤마(,)로 구분하여 입력합니다.
                                                <br />
                                                <code className="inline-block mt-2 bg-slate-900 text-indigo-300 px-3 py-1.5 rounded-lg text-xs font-mono">
                                                    예: 피부관리샵, 네일아트, 왁싱, 필라테스, 헬스장
                                                </code>
                                            </p>
                                        </div>

                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                                            <h3 className="font-black text-slate-900 flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 3. 안전 수집 및 Excel 내보내기
                                            </h3>
                                            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                                                <li><strong>[수집 시작]</strong> 버튼을 누르면 포털 지도 크롤링 엔진이 실시간으로 가동됩니다.</li>
                                                <li>중간에 언제든 <strong>[수집 일시정지/중지]</strong>를 누를 수 있으며, 그때까지 수집된 DB는 안전하게 보존됩니다.</li>
                                                <li>수집 완료 후 <strong>[Excel 내보내기]</strong>를 누르면 업체명, 전화번호, 도로명주소, 지도URL, 홈페이지, 인스타그램 링크가 정돈된 엑셀 파일로 저장됩니다.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: EMAIL */}
                            {activeTab === 'email' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                            이메일(SMTP) 무료 자동 발송 세팅 가이드
                                        </h2>
                                        <p className="text-slate-500 text-sm font-bold mt-1">
                                            별도 유료 메일 발송비 없이, 본인의 포털(네이버/다음)이나 Gmail 계정으로 고객 제안서를 1:1 발송합니다.
                                        </p>
                                    </div>

                                    <div className="space-y-5 text-slate-700 text-sm leading-relaxed font-medium">
                                        <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-5 space-y-3">
                                            <h3 className="font-black text-indigo-950 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-indigo-600" /> 네이버 메일 SMTP '앱 비밀번호' 발급 (필수)
                                            </h3>
                                            <p className="text-xs sm:text-sm text-indigo-900/80">
                                                포털 로그인 비밀번호 대신 보안 전용 <strong>'앱 비밀번호'</strong>를 생성해야 안전하게 자동 발송됩니다.
                                            </p>
                                            <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-slate-700">
                                                <li>네이버 접속 후 <strong>내정보 &gt; 보안설정</strong>으로 이동합니다.</li>
                                                <li><strong>2단계 인증</strong>이 활성화되어 있는지 확인합니다.</li>
                                                <li>하단의 <strong>애플리케이션 비밀번호 관리</strong>에서 종류를 [기타/직접입력] 선택 후 '3Monster' 입력 후 <strong>[생성]</strong>을 누릅니다.</li>
                                                <li>생성된 12자리 영문 비밀번호를 프로그램의 <strong>[메일 비밀번호]</strong> 란에 붙여넣습니다.</li>
                                            </ol>
                                        </div>

                                        <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-5 space-y-3">
                                            <h3 className="font-black text-rose-950 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-rose-600" /> 구글 Gmail SMTP '앱 비밀번호' 발급
                                            </h3>
                                            <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-slate-700">
                                                <li>Google 계정 관리 &gt; <strong>보안</strong> 탭으로 이동합니다.</li>
                                                <li><strong>2단계 인증</strong>을 활성화합니다.</li>
                                                <li>2단계 인증 페이지 하단 또는 검색창에서 <strong>'앱 비밀번호'</strong>를 선택합니다.</li>
                                                <li>앱 이름에 '3Monster' 입력 후 <strong>[만들기]</strong>를 클릭합니다.</li>
                                                <li>화면에 나타나는 16자리 영문 코드를 프로그램의 비밀번호 칸에 입력합니다.</li>
                                            </ol>
                                        </div>

                                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold text-slate-600 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                                            치환 태그 팁: 메일 본문에 <code className="bg-white px-1.5 py-0.5 rounded border text-indigo-700 font-mono">{"{업체명}"}</code>, <code className="bg-white px-1.5 py-0.5 rounded border text-indigo-700 font-mono">{"{대표자명}"}</code> 태그를 넣으면 수집된 각 상호명으로 자동 맞춤 치환되어 스팸 차단을 막고 수신율을 극대화합니다.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: INSTA */}
                            {activeTab === 'insta' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                            인스타그램 DM 다이렉트 영업 노하우
                                        </h2>
                                        <p className="text-slate-500 text-sm font-bold mt-1">
                                            지도에서 수집된 인스타 프로필 링크를 통해 타겟 원장님/대표님께 직접 DM을 발송합니다.
                                        </p>
                                    </div>

                                    <div className="space-y-4 text-slate-700 text-sm leading-relaxed font-medium">
                                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-2">
                                            <h4 className="font-black text-amber-900 flex items-center gap-2">
                                                <ShieldCheck className="w-5 h-5 text-amber-600" /> 인스타 계정 보호를 위한 4대 안전 수칙
                                            </h4>
                                            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-amber-900/90 pt-1">
                                                <li><strong>발송 딜레이 준수</strong>: 너무 빠른 연속 발송은 인스타 봇 탐지에 걸릴 수 있습니다. 기본 설정된 랜덤 지연시간(60초~120초)을 권장합니다.</li>
                                                <li><strong>영업용 부계정 활용</strong>: 개인 본계정 대신 영업 제안 전용 서브 계정을 2~3개 생성하여 분산 발송하세요.</li>
                                                <li><strong>본문 문구 변형</strong>: 동일한 문구 반복 대신 <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-bold">{"{업체명}"}</code> 치환 태그와 문장 어미를 다양하게 구성하세요.</li>
                                                <li><strong>노션/웹 링크 안내</strong>: 긴 장문 대신 2~3줄의 정중한 인사말 + 핵심 제안 노션 페이지 링크를 첨부하는 것이 열람률이 압도적으로 높습니다.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: FAQ */}
                            {activeTab === 'faq' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                            포털 지도 DB 추출기 자주 묻는 질문 (FAQ)
                                        </h2>
                                        <p className="text-slate-500 text-sm font-bold mt-1">
                                            궁금하신 점이나 작동 오류 시 아래 해결법을 먼저 확인해 주세요.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            {
                                                q: "무료 체험판과 정품의 차이는 무엇인가요?",
                                                a: "무료 체험판은 결제 없이 누구나 최대 100건의 실시간 DB 수집 기능을 직접 테스트해 보실 수 있습니다. 정품(월간/3개월권)을 구매하시면 수집 건수 및 엑셀 다운로드 제한이 완전히 해제됩니다."
                                            },
                                            {
                                                q: "Windows Defender나 백신 프로그램에서 경고가 떠요.",
                                                a: "파이썬 기반 자동화 도구의 특성상 서명되지 않은 신규 파일에 대해 일부 백신이 오탐지(False Positive)할 수 있습니다. 3Monster의 모든 배포 파일은 악성코드가 없는 안전한 파일이므로 백신 예외 폴더로 등록하시거나 [추가 정보] > [실행]을 눌러주시면 됩니다."
                                            },
                                            {
                                                q: "발급받은 라이선스 키는 어디서 다시 확인하나요?",
                                                a: "3Monster 홈페이지 상단 [마이페이지] > [내 구매 내역]에서 언제든 구매하신 라이선스 키와 남은 유효기간을 확인하실 수 있습니다."
                                            },
                                            {
                                                q: "다른 PC로 라이선스를 옮겨서 사용할 수 있나요?",
                                                a: "기본 1라이선스당 1대의 PC에서 인증이 유지됩니다. PC 교체가 필요하신 경우 고객센터 1:1 문의를 남겨주시면 기존 기기 인증을 초기화하여 새 PC에서 재인증하실 수 있도록 지원해 드립니다."
                                            }
                                        ].map((faq, i) => (
                                            <div key={i} className="border border-slate-200 rounded-2xl p-5 space-y-2 bg-white">
                                                <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                                                    <span className="text-indigo-600">Q.</span> {faq.q}
                                                </h4>
                                                <p className="text-xs sm:text-sm text-slate-600 pl-5 leading-relaxed font-medium">
                                                    {faq.a}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ============================================================== */}
                    {/* GROUP 2: Cafe Monster Content                                  */}
                    {/* ============================================================== */}
                    {selectedGroup === 'cafe-monster' && (
                        <>
                            {/* TAB: INSTALL & LICENSE */}
                            {activeTab === 'install' && (
                                <div className="space-y-8">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-black mb-2">
                                            Step 1 ~ Step 4
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                            카페 몬스터 올인원 설치 및 라이선스 등록
                                        </h2>
                                        <p className="text-slate-500 text-sm font-bold mt-1">
                                            게시글/댓글 크롤러, 댓글 통계 분석, 이벤트 랭킹 집계 도구를 하나의 프로그램에서 모두 사용합니다.
                                        </p>
                                    </div>

                                    <div className="space-y-6 text-slate-700 text-sm leading-relaxed font-medium">
                                        <div className="border border-slate-200/80 rounded-2xl p-5 space-y-2 bg-slate-50/50">
                                            <div className="flex items-center gap-2 text-orange-600 font-black">
                                                <span className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center">1</span>
                                                <span>프로그램 압축 파일 다운로드</span>
                                            </div>
                                            <p className="pl-8 text-slate-600">
                                                상단의 <strong>[무료체험판 (.zip) 받기]</strong> 버튼을 클릭하여 <code className="bg-slate-200/80 px-1.5 py-0.5 rounded text-orange-700 font-mono text-xs">CafeMonster-Trial.zip</code>을 다운로드합니다.
                                            </p>
                                        </div>

                                        <div className="border border-slate-200/80 rounded-2xl p-5 space-y-2 bg-slate-50/50">
                                            <div className="flex items-center gap-2 text-orange-600 font-black">
                                                <span className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center">2</span>
                                                <span>압축 풀기 및 실행</span>
                                            </div>
                                            <p className="pl-8 text-slate-600">
                                                다운로드된 압축 파일을 해제한 후 폴더 안의 <code className="bg-slate-900 text-orange-400 px-2 py-0.5 rounded font-mono font-black text-xs">CafeMonster-실행.bat</code> (또는 CafeMonster.exe)을 더블 클릭합니다.
                                            </p>
                                        </div>

                                        <div className="bg-amber-50 border-2 border-amber-200/80 rounded-2xl p-5 flex gap-4">
                                            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                                            <div className="space-y-1.5">
                                                <h4 className="font-black text-amber-900 text-base">
                                                    Windows의 PC 보호 창이 뜰 때
                                                </h4>
                                                <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                                                    윈도우 SmartScreen 팝업 창이 나타나면 <strong>[추가 정보]</strong>를 누르신 후 나타나는 <strong>[실행]</strong> 버튼을 누르시면 정상적으로 가동됩니다.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="border-2 border-orange-200 bg-orange-50/40 rounded-2xl p-5 space-y-3">
                                            <div className="flex items-center gap-2 text-orange-950 font-black text-base">
                                                <Key className="w-5 h-5 text-orange-600" />
                                                <span>정품 라이선스 키 (CM-XXXX-XXXX-XXXX) 활성화</span>
                                            </div>
                                            <ul className="list-decimal pl-6 space-y-2 text-slate-700 text-xs sm:text-sm">
                                                <li>쇼룸에서 카페 몬스터 상품 결제 시 발급되는 16자리 키를 복사합니다.</li>
                                                <li>프로그램 메인 화면 우측 상단 <strong>[라이선스 키 등록]</strong>을 클릭합니다.</li>
                                                <li>발급받으신 <code className="bg-white border border-orange-200 px-2 py-0.5 rounded text-orange-600 font-mono font-bold">CM-XXXX-XXXX-XXXX</code> 키를 입력하고 [인증]을 누르면 모든 기능의 제한이 즉시 해제됩니다.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: CRAWLER */}
                            {activeTab === 'crawler' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                            카페 게시글 & 댓글 크롤러 사용법
                                        </h2>
                                        <p className="text-slate-500 text-sm font-bold mt-1">
                                            타겟 카페의 전체 게시글, 실시간 새글, 작성자 댓글 활동 내역까지 완벽 파싱하여 엑셀 데이터셋으로 저장합니다.
                                        </p>
                                    </div>

                                    <div className="space-y-4 text-slate-700 text-sm leading-relaxed font-medium">
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                                            <h4 className="font-black text-slate-900">1. 대상 카페 URL 및 게시판 지정</h4>
                                            <p className="text-xs sm:text-sm text-slate-600">
                                                수집하고자 하는 네이버 카페 주소(예: <code className="text-indigo-600">cafe.naver.com/samplecafe</code>)와 특정 게시판(메뉴) 번호를 지정합니다. 비공개 카페의 경우 로그인 세션 쿠키를 등록하여 가입된 등급의 게시글까지 수집할 수 있습니다.
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                                            <h4 className="font-black text-slate-900">2. 수집 기간 및 필터 조건 설정</h4>
                                            <p className="text-xs sm:text-sm text-slate-600">
                                                특정 날짜 범위(예: 최근 3개월, 특정 이벤트 기간)나 제목/본문 키워드를 필터링하여 불필요한 데이터를 제외하고 핵심 타겟 데이터만 정밀하게 수집합니다.
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                                            <h4 className="font-black text-slate-900">3. 댓글 및 대댓글 실시간 파싱</h4>
                                            <p className="text-xs sm:text-sm text-slate-600">
                                                단순 게시글뿐만 아니라 글 밑에 달린 회원들의 댓글, 답글(대댓글), 작성자 닉네임, 작성일시를 완벽 구조화하여 엑셀(XLSX) 및 CSV로 저장합니다.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: STATS */}
                            {activeTab === 'stats' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                            카페 댓글 수집 통계 & 여론 키워드 분석
                                        </h2>
                                        <p className="text-slate-500 text-sm font-bold mt-1">
                                            회원들의 실시간 반응, 자주 언급되는 핵심 키워드, 긍/부정 여론 지수를 시각화 대시보드로 확인합니다.
                                        </p>
                                    </div>

                                    <div className="space-y-4 text-slate-700 text-sm leading-relaxed font-medium">
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                                            <h4 className="font-black text-slate-900">📈 실시간 반응 및 키워드 트렌드</h4>
                                            <p className="text-xs sm:text-sm text-slate-600">
                                                수집된 댓글 텍스트로부터 형태소 분석을 통해 가장 자주 등장하는 명사/키워드 상위 50개를 빈도순으로 자동 추출하고 워드클라우드 및 차트로 시각화합니다.
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                                            <h4 className="font-black text-slate-900">💡 긍정 / 부정 감정선 지수 분석</h4>
                                            <p className="text-xs sm:text-sm text-slate-600">
                                                회원들이 특정 주제, 상품, 공지사항에 대해 호의적인지(만족, 칭찬, 기대) 아니면 불만/개선 요구인지 감정 분포를 백분율로 산출하여 마케팅 전략 수립에 도움을 줍니다.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: EVENT */}
                            {activeTab === 'event' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                            이벤트 활동 통계 집계 및 회원 랭킹
                                        </h2>
                                        <p className="text-slate-500 text-sm font-bold mt-1">
                                            카페 활성화를 위한 출석, 게시글, 댓글 활동 지수를 종합 산출하고 이벤트 당첨자를 투명하게 선정합니다.
                                        </p>
                                    </div>

                                    <div className="space-y-4 text-slate-700 text-sm leading-relaxed font-medium">
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                                            <h4 className="font-black text-slate-900">🏆 회원별 기여도 랭킹 산출</h4>
                                            <p className="text-xs sm:text-sm text-slate-600">
                                                이벤트 기간 동안 등록된 글 수, 댓글 수, 방문 일수를 종합 가중치로 계산하여 1위부터 100위까지의 우수 활동자 랭킹을 자동 정렬합니다.
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                                            <h4 className="font-black text-slate-900">🎲 공정한 랜덤 추첨 기능</h4>
                                            <p className="text-xs sm:text-sm text-slate-600">
                                                이벤트 댓글을 작성한 유효 회원 목록 중에서 중복을 자동 제거하고, 지정한 인원수만큼 공정하게 랜덤 당첨자를 추첨하여 결과 로그를 생성합니다.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: FAQ */}
                            {activeTab === 'faq' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                            카페 몬스터 자주 묻는 질문 (FAQ)
                                        </h2>
                                        <p className="text-slate-500 text-sm font-bold mt-1">
                                            원활한 카페 분석을 위한 핵심 팁을 확인하세요.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            {
                                                q: "네이버 아이디 로그인이 필요한가요?",
                                                a: "공개 카페의 일반 게시판은 로그인 없이도 고속 수집이 가능합니다. 단, 회원 전용 비공개 게시판이나 등급 제한 게시판의 글을 수집할 때는 프로그램 내 브라우저 로그인 세션을 한 번만 유지해 주시면 됩니다."
                                            },
                                            {
                                                q: "대용량 크롤링 시 카페 차단 위험은 없나요?",
                                                a: "카페 몬스터는 실제 사용자의 웹 서핑 패턴을 모사하는 지능형 랜덤 딜레이(Human Behavior Simulation) 엔진을 탑재하고 있어 안전합니다. 시스템의 기본 지연 설정을 유지하시는 것을 권장합니다."
                                            },
                                            {
                                                q: "수집된 엑셀 파일에서 글자가 깨져 보여요.",
                                                a: "추출된 파일은 전 세계 표준인 UTF-8 BOM 인코딩으로 저장되어 Excel, 한셀, Google 스프레드시트에서 글자 깨짐 없이 바로 열립니다."
                                            }
                                        ].map((faq, i) => (
                                            <div key={i} className="border border-slate-200 rounded-2xl p-5 space-y-2 bg-white">
                                                <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                                                    <span className="text-orange-600">Q.</span> {faq.q}
                                                </h4>
                                                <p className="text-xs sm:text-sm text-slate-600 pl-5 leading-relaxed font-medium">
                                                    {faq.a}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ============================================================== */}
                    {/* GROUP 3: App Monster Content (PWA)                             */}
                    {/* ============================================================== */}
                    {selectedGroup === 'app-monster' && (
                        <>
                            {/* TAB: INSTALL / PWA */}
                            {activeTab === 'install' && (
                                <div className="space-y-8">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-pink-50 text-pink-700 text-xs font-black mb-2">
                                            Mobile & PC PWA Guide
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                            앱 몬스터 '홈 화면 바로가기(PWA)' 추가 방법
                                        </h2>
                                        <p className="text-slate-500 text-sm font-bold mt-1">
                                            앱스토어 설치 없이, 스마트폰 홈 화면에 아이콘 하나만 추가하면 네이티브 앱처럼 1초 만에 실행됩니다.
                                        </p>
                                    </div>

                                    <div className="space-y-6 text-slate-700 text-sm leading-relaxed font-medium">
                                        <div className="border border-indigo-100 bg-indigo-50/40 rounded-2xl p-5 space-y-3">
                                            <h3 className="font-black text-indigo-950 flex items-center gap-2">
                                                🍎 아이폰 (iOS Safari) 홈 화면 추가
                                            </h3>
                                            <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-slate-700">
                                                <li>사파리(Safari) 브라우저에서 해당 웹앱 주소(<a href="https://sundreamer.app" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline">sundreamer.app</a> 또는 <a href="https://real-pick.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline">real-pick.com</a>)로 접속합니다.</li>
                                                <li>화면 하단 중앙의 <strong>[공유]</strong> 버튼(네모 위로 화살표 모양)을 탭합니다.</li>
                                                <li>메뉴를 아래로 스크롤하여 <strong>[홈 화면에 추가]</strong>를 누릅니다.</li>
                                                <li>우측 상단 <strong>[추가]</strong>를 누르면 스마트폰 바탕화면에 전용 아이콘이 생성됩니다.</li>
                                            </ol>
                                        </div>

                                        <div className="border border-emerald-100 bg-emerald-50/40 rounded-2xl p-5 space-y-3">
                                            <h3 className="font-black text-emerald-950 flex items-center gap-2">
                                                🤖 갤럭시 / 안드로이드 (Chrome) 앱 설치
                                            </h3>
                                            <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-slate-700">
                                                <li>크롬(Chrome) 브라우저에서 웹앱 주소로 접속합니다.</li>
                                                <li>화면 하단에 뜨는 <strong>[홈 화면에 추가]</strong> 또는 <strong>[앱 설치]</strong> 배너를 클릭합니다.</li>
                                                <li>(배너가 안 뜰 경우) 우측 상단 메뉴(점 3개) 클릭 &gt; <strong>[앱 설치]</strong> 또는 <strong>[홈 화면에 추가]</strong>를 누릅니다.</li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: SUNDREAMER */}
                            {activeTab === 'sundreamer' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                            썬드리머 (썬드림 회원앱) 주요 기능 안내
                                        </h2>
                                        <p className="text-slate-500 text-sm font-bold mt-1">
                                            11년간 5천 명 이상의 실구매 고객과 함께해 온 자외선조사기 케어 멤버십 전용 웹앱입니다.
                                        </p>
                                    </div>

                                    <div className="space-y-4 text-slate-700 text-sm leading-relaxed font-medium">
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                                            <h4 className="font-black text-slate-900">⏱️ 1,600시간 램프 수명 자동 카운팅</h4>
                                            <p className="text-xs sm:text-sm text-slate-600">
                                                자외선 조사기 램프의 권장 수명(1,600시간)을 기준으로, 일일 조사 시간을 기록하면 남은 유효 수명과 교체 권장 시기를 자동으로 계산하여 시각화합니다.
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                                            <h4 className="font-black text-slate-900">📅 매일의 치유 타임라인 기록</h4>
                                            <p className="text-xs sm:text-sm text-slate-600">
                                                부위별 조사 시간, 일광 강도, 피부 상태 변화를 캘린더 타임라인으로 기록하여 꾸준한 건강 습관을 유지할 수 있도록 지원합니다.
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                                            <h4 className="font-black text-slate-900">📖 11년 전문 카페 엄선 치유 후기 30선</h4>
                                            <p className="text-xs sm:text-sm text-slate-600">
                                                오랜 기간 카페 회원들이 증명한 생생한 질환 극복 및 치유 실사용 후기 30편을 엄선하여 언제든 앱에서 바로 열람하실 수 있습니다.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: REALPICK */}
                            {activeTab === 'realpick' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                            리얼픽 (리얼연애방송 시청비서 MVP) 안내
                                        </h2>
                                        <p className="text-slate-500 text-sm font-bold mt-1">
                                            복잡한 출연진 정보와 회차별 러브라인 화살표를 한눈에 파악하는 심플 시청비서입니다.
                                        </p>
                                    </div>

                                    <div className="space-y-4 text-slate-700 text-sm leading-relaxed font-medium">
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                                            <h4 className="font-black text-slate-900">👥 출연진 프로필 요약</h4>
                                            <p className="text-xs sm:text-sm text-slate-600">
                                                '나는 솔로', '나솔사계' 등 기수별 출연진들의 나이, 직업, 인스타그램 계정 정보를 클릭 한 번에 정리하여 제공합니다.
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                                            <h4 className="font-black text-slate-900">💘 회차별 화살표 선택 흐름도 (러브라인)</h4>
                                            <p className="text-xs sm:text-sm text-slate-600">
                                                매주 방영되는 첫인상 선택, 데이트 매칭, 중간 선택의 화살표 방향을 직관적인 다이어그램으로 시각화하여 방송 시청의 몰입도를 극대화합니다.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: FAQ */}
                            {activeTab === 'faq' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                            앱 몬스터 자주 묻는 질문 (FAQ)
                                        </h2>
                                        <p className="text-slate-500 text-sm font-bold mt-1">
                                            웹앱 이용 관련 주요 사항입니다.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            {
                                                q: "앱 몬스터 서비스는 무료인가요?",
                                                a: "네! 썬드리머(썬드림 회원앱)와 리얼픽(시청비서 MVP)은 모든 회원이 별도의 유료 결제 없이 100% 무료로 자유롭게 이용하실 수 있습니다."
                                            },
                                            {
                                                q: "모바일뿐만 아니라 PC에서도 사용할 수 있나요?",
                                                a: "네, Chrome, Safari, Edge, Whale 등 모든 데스크톱 웹 브라우저에서 동일한 URL로 접속하여 즉시 이용 가능합니다."
                                            }
                                        ].map((faq, i) => (
                                            <div key={i} className="border border-slate-200 rounded-2xl p-5 space-y-2 bg-white">
                                                <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                                                    <span className="text-pink-600">Q.</span> {faq.q}
                                                </h4>
                                                <p className="text-xs sm:text-sm text-slate-600 pl-5 leading-relaxed font-medium">
                                                    {faq.a}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}
