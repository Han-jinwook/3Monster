import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
    Video, Play, Pause, Sparkles, Volume2, 
    CheckCircle2, Clock, RefreshCw, 
    Download, Eye
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ScenarioItem {
    id: number;
    title: string;
    product: string;
    targetAudience: string;
    duration: string;
    voiceActor: string;
    hookCopy: string;
    fullScript: string;
    status: 'ready' | 'rendering' | 'completed';
    videoUrl?: string;
    youtubeStatus: 'published' | 'pending' | 'draft';
    youtubeUrl?: string;
    reelsStatus: 'published' | 'pending' | 'draft';
    tiktokStatus: 'published' | 'pending' | 'draft';
    views?: number;
}

const initialScenarios: ScenarioItem[] = [
    {
        id: 1,
        title: '아직도 네이버 지도에서 일일이 복붙하세요? (10초 컷 비결)',
        product: 'NPlace-DB',
        targetAudience: 'B2B 마케터, 영업사원, 자영업자',
        duration: '18초',
        voiceActor: '필재 (타입캐스트 20대 남성/자신감 톤)',
        hookCopy: '설마 아직도 네이버 지도 켜놓고 매장 번호 하나씩 복사해서 엑셀에 붙여넣고 계세요?',
        fullScript: '설마 아직도 네이버 지도 켜놓고 매장 번호 하나씩 복사해서 엑셀에 붙여넣고 계세요? 100개 복붙하는데 2시간? 이제 10초 만에 끝내세요. 원하는 지역과 키워드만 치면 상호명, 대표번호, 도로명 주소까지 엑셀로 한 방에 싹 정리됩니다. 지금 3Monster 허브에서 100건 무료로 직접 뽑아보세요!',
        status: 'ready',
        videoUrl: '/showroom/nplace/nplace-demo.mp4',
        youtubeStatus: 'draft',
        reelsStatus: 'draft',
        tiktokStatus: 'draft'
    },
    {
        id: 2,
        title: '자영업자 10명 중 9명이 모르는 동네 상권 분석법',
        product: 'NPlace-DB',
        targetAudience: '외식업/카페 창업자, 프랜차이즈 가맹영업',
        duration: '20초',
        voiceActor: '필재 (타입캐스트 20대 남성/정보전달 톤)',
        hookCopy: '우리 동네 경쟁 매장들은 리뷰가 몇 개나 쌓여있을까?',
        fullScript: '우리 동네 경쟁 매장들은 리뷰가 몇 개나 쌓여있을까? 일일이 검색하지 마세요. 반경 내 모든 매장의 방문자 리뷰수, 블로그 리뷰수를 엑셀 한 페이지로 뽑아 비교할 수 있습니다. 상권 분석과 B2B 제안서 작성, 이제 데이터로 승부하세요. 100건 무료 체험판 배포 중!',
        status: 'ready',
        videoUrl: '/showroom/nplace/nplace-demo.mp4',
        youtubeStatus: 'draft',
        reelsStatus: 'draft',
        tiktokStatus: 'draft'
    },
    {
        id: 3,
        title: 'B2B 영업맨 필수 치트키: 전국 헬스장 1,000곳 연락처 1분 컷',
        product: 'NPlace-DB',
        targetAudience: '운동기구/보충제 B2B 납품업체, 스포츠 마케터',
        duration: '19초',
        voiceActor: '필재 (타입캐스트 20대 남성/에너지 톤)',
        hookCopy: '필라테스, 헬스장 대상 영업 제안서 보내야 하는데 DB가 없다고요?',
        fullScript: '필라테스, 헬스장 대상 영업 제안서 보내야 하는데 DB가 없다고요? 전국 주요 도시 헬스장 최신 대표 연락처, 클릭 한 번으로 1분 만에 엑셀 추출 완료! 합법적으로 공개된 포털 지도 데이터를 가장 깔끔하게 정리하는 법. 지금 바로 무료로 써보세요.',
        status: 'ready',
        youtubeStatus: 'draft',
        reelsStatus: 'draft',
        tiktokStatus: 'draft'
    },
    {
        id: 4,
        title: '인테리어/간판 업체 대표님들, 신규 매장 어떻게 찾으세요?',
        product: 'NPlace-DB',
        targetAudience: '인테리어, 간판, POS 솔루션 영업사',
        duration: '21초',
        voiceActor: '필재 (타입캐스트 20대 남성/신뢰 톤)',
        hookCopy: '인테리어, 간판, 포스기 영업하시는 대표님들! 신규 오픈 매장 리스트 어떻게 정리하세요?',
        fullScript: '인테리어, 간판, 포스기 영업하시는 대표님들! 신규 오픈 매장이나 지역별 매장 리스트 정리하느라 밤새지 마세요. 원하는 동네, 원하는 업종만 지정하면 엑셀 파일이 즉시 완성됩니다. 복잡한 가입 없이 100건 무료 다운로드 가능합니다!',
        status: 'ready',
        youtubeStatus: 'draft',
        reelsStatus: 'draft',
        tiktokStatus: 'draft'
    },
    {
        id: 5,
        title: '월 5,000원으로 알바생 1명 고용한 충격 효과',
        product: 'NPlace-DB',
        targetAudience: '소상공인 1인 기업, 프리랜서 마케터',
        duration: '18초',
        voiceActor: '필재 (타입캐스트 20대 남성/자신감 톤)',
        hookCopy: '단돈 5,000원으로 엑셀 정리 알바생 1명 고용한 효과가 난다면?',
        fullScript: '단돈 5,000원으로 엑셀 정리 알바생 1명 고용한 효과가 난다면? 밤새 검색하고 타이핑하던 매장 연락처, 3초 만에 1,000개 완벽 정리! 크몽에서 핫한 바로 그 데이터 추출기. 지금 100건 무료로 시작해보세요!',
        status: 'ready',
        youtubeStatus: 'draft',
        reelsStatus: 'draft',
        tiktokStatus: 'draft'
    },
    {
        id: 6,
        title: '학원/교습소 원장님들, 주변 학부모 상권 분석 이렇게 합니다',
        product: 'NPlace-DB',
        targetAudience: '학원 원장, 과외/교습소 운영자',
        duration: '19초',
        voiceActor: '필재 (타입캐스트 20대 남성/정보전달 톤)',
        hookCopy: '주변 학원들이 블로그 리뷰를 어떻게 모으는지 궁금하셨죠?',
        fullScript: '주변 학원들이 블로그 리뷰를 어떻게 모으는지 궁금하셨죠? 우리 동네 모든 학원의 포털 지도 데이터와 리뷰 분포를 한눈에 엑셀로 비교 분석하세요. 학생 모집과 설명회 기획이 훨씬 쉬워집니다. 100건 무료 체험판 제공 중!',
        status: 'ready',
        youtubeStatus: 'draft',
        reelsStatus: 'draft',
        tiktokStatus: 'draft'
    },
    {
        id: 7,
        title: '엑셀 초보도 3초 만에 다루는 매장 DB 정리 프로그램',
        product: 'NPlace-DB',
        targetAudience: '컴맹 자영업자, 시니어 사업자',
        duration: '17초',
        voiceActor: '필재 (타입캐스트 20대 남성/친근 톤)',
        hookCopy: '복잡한 코딩이나 엑셀 수식? 1도 몰라도 됩니다.',
        fullScript: '복잡한 코딩이나 엑셀 수식? 1도 몰라도 됩니다. 키워드 넣고 [시작] 버튼 누르면 끝! 깔끔하게 호환되는 엑셀 파일이 컴퓨터에 바로 저장됩니다. 지금 다운받아 직접 확인해보세요.',
        status: 'ready',
        youtubeStatus: 'draft',
        reelsStatus: 'draft',
        tiktokStatus: 'draft'
    },
    {
        id: 8,
        title: '크몽에서 5만원 주고 사던 매장 DB, 직접 0원으로 뽑으세요',
        product: 'NPlace-DB',
        targetAudience: '스타트업 영업팀, 마케팅 대행사',
        duration: '19초',
        voiceActor: '필재 (타입캐스트 20대 남성/사이다 톤)',
        hookCopy: '언제 적 DB인지도 모르는 오래된 엑셀 파일을 5만원씩 주고 사셨나요?',
        fullScript: '언제 적 DB인지도 모르는 오래된 엑셀 파일을 5만원씩 주고 사셨나요? 이제 오늘자 포털 지도에 등록된 진짜 최신 매장 연락처를 직접 실시간으로 뽑으세요. 무료 100건 추출 지원 중!',
        status: 'ready',
        youtubeStatus: 'draft',
        reelsStatus: 'draft',
        tiktokStatus: 'draft'
    },
    {
        id: 9,
        title: '맛집/카페 인플루언서 협찬 매장 리스트 10초 만에 정리하는 법',
        product: 'NPlace-DB',
        targetAudience: '인플루언서, 바이럴 대행사, 블로그 체험단',
        duration: '18초',
        voiceActor: '필재 (타입캐스트 20대 남성/트렌디 톤)',
        hookCopy: '체험단 섭외할 핫플 카페 리스트, 아직도 인스타에서 뒤지시나요?',
        fullScript: '체험단 섭외할 핫플 카페 리스트, 아직도 인스타에서 뒤지시나요? 지역별 베이커리, 디저트 카페 상호명과 번호를 10초 만에 엑셀로 모으세요. 협찬 제안서 발송이 10배 빨라집니다. 3Monster에서 무료로 체험하세요!',
        status: 'ready',
        youtubeStatus: 'draft',
        reelsStatus: 'draft',
        tiktokStatus: 'draft'
    },
    {
        id: 10,
        title: '3Monster 허브 론칭 기념: 전 프로그램 100건 무료 체험권 증정',
        product: 'NPlace-DB',
        targetAudience: '전체 소상공인 & 온라인 셀러',
        duration: '20초',
        voiceActor: '필재 (타입캐스트 20대 남성/공식 안내 톤)',
        hookCopy: '업무 효율 10배 올려주는 몬스터 시리즈 전 제품, 100건 무료 개방!',
        fullScript: '업무 효율 10배 올려주는 3Monster 시리즈 전 제품, 100건 무료 개방! 포털 지도 DB 추출기부터 카페 수집기까지, 카드 등록이나 로그인 없이 1초 만에 다운로드 가능합니다. 프로필 링크에서 지금 바로 체험해보세요!',
        status: 'ready',
        youtubeStatus: 'draft',
        reelsStatus: 'draft',
        tiktokStatus: 'draft'
    }
];

export const ShortsStudio = () => {
    const [scenarios, setScenarios] = useState<ScenarioItem[]>(initialScenarios);
    const [selectedScenario, setSelectedScenario] = useState<ScenarioItem>(initialScenarios[0]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [filterProduct, setFilterProduct] = useState<string>('all');
    const [isGenerating, setIsGenerating] = useState(false);

    const filteredScenarios = scenarios.filter(s => {
        if (filterProduct === 'all') return true;
        return s.product.toLowerCase().includes(filterProduct.toLowerCase());
    });

    const handleGenerateTTS = (id: number) => {
        setScenarios(prev => prev.map(s => s.id === id ? { ...s, status: 'rendering' } : s));
        setTimeout(() => {
            setScenarios(prev => prev.map(s => s.id === id ? { ...s, status: 'completed' } : s));
        }, 2000);
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 pt-2 pb-16 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white shadow-lg shadow-indigo-200">
                            <Video className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                숏폼 스튜디오 <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">Auto Marketing v2.0</span>
                            </h1>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5">
                                AI 시나리오 기획 ➔ 타입캐스트(전속 성우: <span className="text-indigo-600 font-bold">필재</span>) 음성 ➔ 9:16 세로 렌더링 ➔ 플랫폼 자동 배포
                            </p>
                        </div>
                    </div>
                </div>

                {/* Global Actions */}
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={() => {
                            setIsGenerating(true);
                            setTimeout(() => setIsGenerating(false), 1500);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black h-10 px-4 shadow-md shadow-indigo-100 flex items-center gap-1.5"
                    >
                        <Sparkles className={cn("w-3.5 h-3.5", isGenerating && "animate-spin")} />
                        {isGenerating ? "AI 시나리오 생성 중..." : "새 AI 대본 자동생성"}
                    </Button>
                    <Button 
                        variant="outline"
                        className="rounded-xl text-xs font-black h-10 px-3.5 border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        상태 새로고침
                    </Button>
                </div>
            </div>

            {/* Main Stage Grid: Left Player (9:16), Right Scenario List */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: 9:16 Vertical Preview Studio (5 Cols) */}
                <div className="lg:col-span-5 space-y-4">
                    <Card className="p-0 overflow-hidden border border-slate-200 rounded-3xl bg-slate-950 shadow-2xl text-white">
                        {/* Video Frame (9:16 Aspect Ratio) */}
                        <div className="relative aspect-[9/16] w-full max-w-[340px] mx-auto bg-slate-900 overflow-hidden rounded-2xl border-4 border-slate-800 shadow-inner flex flex-col justify-between my-4">
                            {/* Video Background / Demo */}
                            <video
                                src="/showroom/nplace/nplace-demo.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover opacity-80"
                            />

                            {/* Top HUD */}
                            <div className="relative z-10 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between">
                                <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black tracking-wider uppercase flex items-center gap-1 shadow-md">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                    {selectedScenario.product}
                                </span>
                                <span className="text-[11px] font-bold text-slate-300 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                                    {selectedScenario.duration}
                                </span>
                            </div>

                            {/* Center Play Overlay */}
                            <div className="relative z-10 flex items-center justify-center pointer-events-none">
                                <div className="p-3.5 rounded-full bg-indigo-600/90 text-white backdrop-blur-md shadow-2xl transform transition-transform hover:scale-110">
                                    {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 fill-white translate-x-0.5" />}
                                </div>
                            </div>

                            {/* Bottom Captions HUD */}
                            <div className="relative z-10 p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent space-y-2">
                                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 backdrop-blur-md text-[12px] font-bold text-amber-300 leading-snug shadow-lg">
                                    💬 "{selectedScenario.hookCopy}"
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Volume2 className="w-3 h-3 text-indigo-400" />
                                        성우: <strong className="text-white">필재 (Typecast)</strong>
                                    </span>
                                    <span className="text-emerald-400 font-bold">1080x1920 (9:16)</span>
                                </div>
                            </div>
                        </div>

                        {/* Player Controls Under Card */}
                        <div className="p-5 border-t border-slate-800 bg-slate-900/90 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-black text-sm text-white truncate max-w-[260px]">{selectedScenario.title}</h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">전속 성우: <strong className="text-indigo-400">필재</strong> • {selectedScenario.targetAudience}</p>
                                </div>
                                <Button 
                                    size="sm"
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold px-3 h-8"
                                >
                                    {isPlaying ? "일시정지" : "미리보기"}
                                </Button>
                            </div>

                            {/* Full Script Text Box */}
                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-medium">
                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">📜 풀 시나리오 대본 (타입캐스트 성우 필재 리딩용)</p>
                                {selectedScenario.fullScript}
                            </div>

                            {/* Action Row */}
                            <div className="flex items-center gap-2 pt-1">
                                <Button 
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black h-9 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30"
                                    onClick={() => handleGenerateTTS(selectedScenario.id)}
                                >
                                    <Volume2 className="w-3.5 h-3.5" />
                                    필재 TTS 음성 생성
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-bold h-9 px-3"
                                >
                                    <Download className="w-3.5 h-3.5" /> MP4 저장
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right: 10 Scenario Matrix & Distribution Status (7 Cols) */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Filter Tabs */}
                    <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-1.5">
                            {['all', 'NPlace-DB', 'CafeCrawler', 'EventStats'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilterProduct(f)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-xl text-xs font-black transition-all",
                                        filterProduct === f
                                            ? "bg-slate-900 text-white shadow-sm"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                    )}
                                >
                                    {f === 'all' ? '전체 대본 (10종)' : f}
                                </button>
                            ))}
                        </div>
                        <div className="text-[11px] font-bold text-slate-500">
                            총 <strong className="text-indigo-600 font-black">{filteredScenarios.length}</strong>개 시나리오
                        </div>
                    </div>

                    {/* Scenario List Table / Cards */}
                    <div className="space-y-3">
                        {filteredScenarios.map((s, idx) => {
                            const isSelected = selectedScenario.id === s.id;
                            return (
                                <Card 
                                    key={s.id}
                                    onClick={() => setSelectedScenario(s)}
                                    className={cn(
                                        "p-4 rounded-2xl border transition-all cursor-pointer",
                                        isSelected 
                                            ? "border-indigo-600 bg-indigo-50/20 shadow-md ring-2 ring-indigo-500/20" 
                                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">
                                                    {idx + 1}
                                                </span>
                                                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                                    {s.product}
                                                </span>
                                                <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-0.5">
                                                    <Clock className="w-2.5 h-2.5" /> {s.duration}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-500">
                                                    성우: <strong className="text-slate-800">필재</strong>
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-black text-slate-900 leading-snug pt-0.5">
                                                {s.title}
                                            </h4>
                                            <p className="text-xs text-slate-500 line-clamp-1 font-medium pt-0.5">
                                                🎯 {s.hookCopy}
                                            </p>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            {s.status === 'completed' ? (
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 렌더링 완료
                                                </span>
                                            ) : s.status === 'rendering' ? (
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 animate-pulse">
                                                    <RefreshCw className="w-3 h-3 animate-spin text-amber-600" /> 렌더링 중
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200">
                                                    대본 대기
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Distribution Channels Footer */}
                                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-400 font-bold">배포 채널:</span>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1",
                                                s.youtubeStatus === 'published' ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-slate-50 text-slate-400"
                                            )}>
                                                유튜브 쇼츠 {s.youtubeStatus === 'published' ? '✅' : '⏳'}
                                            </span>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1",
                                                s.reelsStatus === 'published' ? "bg-pink-50 text-pink-700 border border-pink-200" : "bg-slate-50 text-slate-400"
                                            )}>
                                                인스타 릴스 {s.reelsStatus === 'published' ? '✅' : '⏳'}
                                            </span>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1",
                                                s.tiktokStatus === 'published' ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400"
                                            )}>
                                                틱톡 {s.tiktokStatus === 'published' ? '✅' : '⏳'}
                                            </span>
                                        </div>

                                        {s.views && (
                                            <span className="font-black text-indigo-600 flex items-center gap-1">
                                                <Eye className="w-3 h-3" /> {s.views.toLocaleString()}회
                                            </span>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
