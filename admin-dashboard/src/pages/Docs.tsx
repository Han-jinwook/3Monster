import { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { BookOpen, Download, MousePointerClick, Mail, MessageCircle, AlertCircle } from 'lucide-react';

const tabs = [
    { id: 'install', label: '설치', icon: Download },
    { id: 'collect', label: '수집', icon: MousePointerClick },
    { id: 'email', label: '이메일', icon: Mail },
    { id: 'insta', label: '인스타', icon: MessageCircle },
];

export function Docs() {
    const [activeTab, setActiveTab] = useState('install');

    // Currently only NPlace-DB docs are fully populated, others will just show generic or coming soon.

    return (
        <div className="max-w-[1000px] mx-auto space-y-8 pt-0 pb-12 px-4">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-xl">
                        <BookOpen className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">설치 & 사용 가이드</h1>
                </div>
                <p className="text-slate-500 font-bold ml-1">
                    프로그램 설치부터 핵심 기능 활용법까지 한 곳에서 확인하세요.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl gap-1">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-sm transition-all ${
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

            {/* Content */}
            <Card className="border-slate-200/60 shadow-sm rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-8">
                    {activeTab === 'install' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-slate-800 border-b border-slate-100 pb-4">설치 및 기본 세팅</h2>
                            <div className="space-y-4 text-slate-600 leading-relaxed font-medium">
                                <p>1. 쇼룸 페이지 하단의 <strong>[무료체험판 다운로드]</strong> 또는 발급받으신 <strong>[정식 제품]</strong> ZIP 파일을 다운로드합니다.</p>
                                <p>2. 다운로드 받은 ZIP 파일의 압축을 해제합니다. (권장: C드라이브 또는 바탕화면의 전용 폴더)</p>
                                <p>3. 압축이 해제된 폴더 내의 <code className="bg-slate-100 px-2 py-1 rounded text-pink-600 text-sm font-bold">NPlace-DB-실행.bat</code> (또는 프로그램 이름의 실행 파일)을 더블 클릭하여 실행합니다.</p>
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 mt-6">
                                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-amber-800">Windows PC 보호 알림이 뜨는 경우</h4>
                                        <p className="text-sm text-amber-700/80">처음 실행 시 "Windows의 PC 보호" 창이 나타날 수 있습니다. 이는 서명되지 않은 신규 프로그램에서 발생하는 윈도우 기본 알림입니다. <strong>[추가 정보]</strong>를 클릭하신 후 <strong>[실행]</strong> 버튼을 누르시면 정상적으로 프로그램이 시작됩니다.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'collect' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-slate-800 border-b border-slate-100 pb-4">플레이스 데이터 수집 가이드</h2>
                            <div className="space-y-4 text-slate-600 leading-relaxed font-medium">
                                <p>NPlace-DB 수집 엔진은 네이버 스마트플레이스 데이터를 안전하게 실시간으로 수집합니다.</p>
                                <div className="space-y-2 mt-4">
                                    <h4 className="font-black text-slate-800">기본 수집 방법</h4>
                                    <ul className="list-decimal pl-5 space-y-2">
                                        <li><strong>지역 선택</strong>: 좌측 사이드바에서 원하는 <strong>시/도</strong>와 <strong>구/군</strong>을 선택하세요. 여러 개 선택도 가능합니다.</li>
                                        <li><strong>키워드 입력</strong>: '피부샵', '네일아트' 등 타겟 업종을 콤마(,)로 구분하여 한 개 이상 입력하세요.</li>
                                        <li><strong>수집 시작</strong>: <strong>[▶ 수집 시작]</strong> 버튼을 누르면 백그라운드 엔진이 가동되며 실시간 로그창에 진행 상황이 표시됩니다.</li>
                                    </ul>
                                </div>
                                <div className="space-y-2 mt-6">
                                    <h4 className="font-black text-slate-800">안전하고 효율적인 수집 팁</h4>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li><strong>IP 차단 방지</strong>: 너무 짧은 수집 지연 시간은 IP 차단을 유발할 수 있으니 기본 설정값을 유지하는 것을 권장합니다.</li>
                                        <li><strong>중도 정지</strong>: 작업 중 언제든 <strong>[■ 수집 중지]</strong> 버튼을 눌러 멈출 수 있으며, 그때까지 수집된 데이터는 모두 안전하게 저장됩니다.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'email' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-slate-800 border-b border-slate-100 pb-4">이메일 자동 발송 세팅</h2>
                            <div className="space-y-4 text-slate-600 leading-relaxed font-medium">
                                <p>수집된 고객 데이터베이스를 기반으로 타겟팅된 제안 메일을 자동으로 발송할 수 있습니다.</p>
                                
                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mt-4 space-y-3">
                                    <h4 className="font-black text-indigo-900">1. 네이버 메일 (SMTP) 설정 방법</h4>
                                    <p className="text-sm text-indigo-800/80 mb-2">네이버 비밀번호를 그대로 입력하면 보안상 발송이 차단됩니다. 반드시 <strong>'앱 비밀번호'</strong>를 발급받아야 합니다.</p>
                                    <ul className="list-decimal pl-5 space-y-2 text-sm text-indigo-900">
                                        <li>네이버 로그인 후 <strong>내정보 &gt; 보안설정</strong>으로 이동합니다.</li>
                                        <li><strong>2단계 인증</strong>을 활성화합니다.</li>
                                        <li>2단계 인증 관리 페이지 하단의 <strong>애플리케이션 비밀번호 관리</strong> 메뉴로 이동합니다.</li>
                                        <li>종류를 '기타(직접입력)'으로 선택하고 'NPlace-DB' 등 이름을 입력 후 <strong>[생성]</strong>을 클릭합니다.</li>
                                        <li>생성된 12자리 비밀번호(띄어쓰기 제외)를 복사하여 <strong>앱 비밀번호</strong> 칸에 붙여넣습니다.</li>
                                    </ul>
                                </div>

                                <div className="bg-rose-50 border border-rose-100 rounded-xl p-5 mt-4 space-y-3">
                                    <h4 className="font-black text-rose-900">2. 구글 (Gmail) 설정 방법</h4>
                                    <p className="text-sm text-rose-800/80 mb-2">구글 역시 2단계 인증을 통한 <strong>'앱 비밀번호'</strong> 발급이 필수입니다.</p>
                                    <ul className="list-decimal pl-5 space-y-2 text-sm text-rose-900">
                                        <li>구글 계정 관리 &gt; <strong>보안</strong> 탭으로 이동합니다.</li>
                                        <li><strong>2단계 인증</strong>을 활성화합니다.</li>
                                        <li>검색창에 <strong>앱 비밀번호</strong>를 검색하거나 2단계 인증 메뉴 맨 아래에서 <strong>앱 비밀번호</strong>를 클릭합니다.</li>
                                        <li>'앱 이름'에 'NPlace-DB'를 입력하고 <strong>[만들기]</strong>를 클릭합니다.</li>
                                        <li>생성된 16자리 영문자 비밀번호(띄어쓰기 제외)를 복사하여 <strong>앱 비밀번호</strong> 칸에 붙여넣습니다.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'insta' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-slate-800 border-b border-slate-100 pb-4">인스타그램 DM 마케팅 노하우</h2>
                            <div className="space-y-4 text-slate-600 leading-relaxed font-medium">
                                <p>수집된 인스타그램 계정으로 DM(다이렉트 메시지)을 자동 발송하는 기능입니다. 인스타그램은 스팸 필터링이 매우 엄격하므로 아래 가이드를 <strong>반드시</strong> 숙지하세요.</p>
                                
                                <div className="space-y-2 mt-4">
                                    <h4 className="font-black text-slate-800">안전한 발송을 위한 핵심 수칙</h4>
                                    <ul className="list-disc pl-5 space-y-3">
                                        <li><strong>휴식 시간 준수</strong>: 한 번에 너무 많은 메시지를 연속 발송하면 계정이 정지될 수 있습니다. 시스템에 설정된 <strong>기본 지연시간(Random Delay)</strong>을 임의로 너무 짧게 줄이지 마세요.</li>
                                        <li><strong>계정 분산 (부계정 활용)</strong>: 본계정 하나로 하루 수백 건의 DM을 발송하는 것은 위험합니다. 영업용 서브 계정을 여러 개 만들어 분산 발송하는 것을 강력히 권장합니다.</li>
                                        <li><strong>메시지 치환 기능 활용</strong>: 똑같은 문구만 반복 발송하면 스팸 봇으로 인식됩니다. <code>{`{업체명}`}</code>, <code>{`{대표님}`}</code> 등 치환 태그를 활용해 각 업체마다 조금씩 다른, 개인화된 메시지를 발송하세요.</li>
                                        <li><strong>적절한 타겟팅</strong>: DM은 불특정 다수가 아닌 확실한 가망 고객에게 제안서 형태로 보내는 것이 전환율이 압도적으로 높습니다.</li>
                                    </ul>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl mt-4">
                                    <p className="text-sm font-bold text-slate-700">💡 꿀팁: DM에는 긴 설명보다 짧은 인사말과 함께 핵심 포트폴리오/노션 링크 등을 첨부하여 상세 내용을 웹에서 확인하게 유도하는 것이 훨씬 효과적입니다.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
