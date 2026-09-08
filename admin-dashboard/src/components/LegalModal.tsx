import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export type LegalDocType = 'terms' | 'privacy';

interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: LegalDocType;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, initialTab = 'terms' }) => {
    const [activeTab, setActiveTab] = useState<LegalDocType>(initialTab);

    React.useEffect(() => {
        if (isOpen && initialTab) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    if (!isOpen) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title=""
            className="max-w-3xl max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl"
        >
            {/* Modal Header & Tabs */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/80">
                <div className="flex items-center justify-between pb-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                            {activeTab === 'privacy' ? (
                                <>
                                    <ShieldCheck className="w-7 h-7 text-indigo-600" />
                                    <span>개인정보 처리방침</span>
                                </>
                            ) : (
                                <>
                                    <FileText className="w-7 h-7 text-indigo-600" />
                                    <span>서비스 이용약관</span>
                                </>
                            )}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                            최종 업데이트: 2026년 4월 23일 · 썬드림 주식회사
                        </p>
                    </div>
                </div>

                {/* Tab switcher */}
                <div className="flex items-center gap-2 pt-1">
                    <button
                        onClick={() => setActiveTab('privacy')}
                        className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                            activeTab === 'privacy' 
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                        )}
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        개인정보 처리방침
                    </button>
                    <button
                        onClick={() => setActiveTab('terms')}
                        className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                            activeTab === 'terms' 
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                        )}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        서비스 이용약관
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-sm text-slate-700 leading-relaxed max-h-[58vh]">
                {activeTab === 'privacy' && (
                    <div className="space-y-6">
                        <section className="space-y-2">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
                                1. 수집하는 개인정보
                            </h3>
                            <p className="text-slate-600">
                                <strong>썬드림 주식회사</strong>(이하 "회사")는 소프트웨어 라이선스 발급 및 서비스 제공을 위해 다음과 같은 정보를 수집합니다.
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                                <li><strong>이메일 주소</strong>: 로그인, 라이선스 키 발급/조회, 계정 식별 및 공지 발송 목적</li>
                                <li><strong>결제 정보</strong>: 유료 이용권/소프트웨어 라이선스 결제 승인 및 세금계산서/현금영수증 발행 (NHN KCP 암호화 처리)</li>
                                <li><strong>서비스 이용 기록</strong>: 라이선스 인증 일시, API 호출/추출 통계, 기기 식별값(PC 고유키)</li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
                                2. 개인정보의 이용 목적
                            </h3>
                            <ul className="list-disc pl-5 space-y-1 text-slate-600">
                                <li>3몬스터(3Monster) 마케팅·DB 자동화 소프트웨어 라이선스 발급 및 활성화 관리</li>
                                <li>결제 확인 및 라이선스 갱신 안내</li>
                                <li>고객 문의 응대 및 기술 지원 (Q&A 티켓, 원격 지원 등)</li>
                                <li>서비스 이용 통계 및 품질 개선</li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
                                3. 개인정보의 보유 및 이용 기간
                            </h3>
                            <ul className="list-disc pl-5 space-y-1 text-slate-600">
                                <li><strong>회원 탈퇴 및 계정 삭제 시</strong>: 지체 없이 즉시 삭제 (단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 보관)</li>
                                <li><strong>결제 및 계약 관련 기록</strong>: 전자상거래 등에서의 소비자보호에 관한 법률에 따라 5년 보관</li>
                                <li><strong>접속 로그 및 IP 기록</strong>: 통신비밀보호법에 따라 3개월 보관</li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
                                4. 개인정보의 제3자 제공
                            </h3>
                            <p className="text-slate-600">
                                회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 단, 다음의 경우는 예외로 합니다:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-slate-600">
                                <li>이용자가 사전에 동의한 경우</li>
                                <li>법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
                                5. 이용자의 권리
                            </h3>
                            <p className="text-slate-600">
                                이용자는 언제든지 자신의 개인정보를 조회·수정하거나 계정 삭제를 요청할 수 있으며, 고객센터 이메일 또는 유선 번호로 연락 주시면 즉시 처리됩니다.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
                                6. 개인정보보호 책임자 및 고객지원
                            </h3>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-700">
                                <p><strong>상호명</strong>: 썬드림 주식회사</p>
                                <p><strong>서비스명</strong>: 3몬스터 (3Monster)</p>
                                <p><strong>대표자 / 개인정보관리책임자</strong>: 백은숙 (beakes@naver.com)</p>
                                <p><strong>사업자등록번호</strong>: 333-87-00482</p>
                                <p><strong>고객문의</strong>: 070-7424-2695 / chiu3@naver.com</p>
                                <p><strong>사업장 주소</strong>: 21330 인천광역시 부평구 주부토로 236 인천테크노밸리 U1센터 C동 1110호/1111호</p>
                            </div>
                        </section>

                        <section className="space-y-2">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
                                7. 개인정보처리방침 변경
                            </h3>
                            <p className="text-slate-600">
                                본 방침은 관련 법령 또는 회사 내부 정책 변경에 따라 개정될 수 있으며, 개정 시 서비스 웹사이트를 통해 공지합니다.
                            </p>
                        </section>
                    </div>
                )}

                {activeTab === 'terms' && (
                    <div className="space-y-6">
                        <section className="space-y-2">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
                                1. 목적 및 회사정보
                            </h3>
                            <p className="text-slate-600">
                                본 약관은 <strong>썬드림 주식회사</strong>(이하 "회사")가 제공하는 3몬스터(3Monster) 플랫폼 및 마케팅/DB 자동화 소프트웨어 서비스(이하 "서비스")의 이용 조건 및 절차에 관한 제반 사항을 규정함을 목적으로 합니다.
                            </p>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-700">
                                <p><strong>상호</strong>: 썬드림 주식회사</p>
                                <p><strong>대표자</strong>: 백은숙</p>
                                <p><strong>사업자등록번호</strong>: 333-87-00482</p>
                                <p><strong>이메일</strong>: beakes@naver.com / chiu3@naver.com</p>
                            </div>
                        </section>

                        <section className="space-y-2">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
                                2. 이용권, 라이선스 및 결제
                            </h3>
                            <p className="text-slate-600">
                                회사는 서비스 내에서 사용 가능한 디지털 소프트웨어 라이선스 키, 코인 또는 정기 이용권을 유료로 제공합니다.
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                                <li><strong>결제 수단</strong>: 신용카드, 계좌이체 등 회사가 제공하는 결제 수단 (NHN KCP 전자결제)</li>
                                <li><strong>상품 형태</strong>: 결제 완료 즉시 계정에 발급·부여되는 무형의 디지털 콘텐츠 및 소프트웨어 라이선스 키 (실물 배송 없음)</li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
                                3. 청약철회 및 환불 규정
                            </h3>
                            <p className="text-slate-600">
                                무형의 디지털 콘텐츠 특성상 전자상거래 등에서의 소비자보호에 관한 법률 제17조 제2항에 의거하여 다음과 같은 환불 규정을 따릅니다:
                            </p>
                            <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-xl space-y-2 text-xs text-amber-950">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                    <span><strong>전액 환불 가능</strong>: 결제 후 7일 이내로서 라이선스 키를 단 1회도 등록하거나 서비스를 이용하지 않은 경우</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                    <span><strong>환불 불가 (서비스 개시)</strong>: 라이선스 키를 소프트웨어에 등록하거나, 데이터 조회·추출 등 서비스 기능을 1회 이상 사용한 경우 디지털 콘텐츠 제공이 개시된 것으로 간주되어 환불이 불가능합니다.</span>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-2">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
                                4. 서비스 이용 및 제한
                            </h3>
                            <p className="text-slate-600">
                                회사는 이용자가 타인의 권리를 침해하거나 서비스의 정상적인 운영을 방해하는 경우(비정상적인 대량 트래픽 유발, 라이선스 무단 공유/양도, 리버스 엔지니어링 등) 사전 통보 없이 서비스 이용을 제한하거나 라이선스를 회수할 수 있습니다.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
                                5. 면책 조항
                            </h3>
                            <p className="text-slate-600">
                                회사가 제공하는 소프트웨어 및 데이터 추출 결과는 외부 공개 웹 플랫폼의 정보를 기반으로 작동하며, 대상 플랫폼의 일시적 장애, 점검 또는 정책 변경으로 인한 동작 지연에 대해 회사의 고의 또는 중과실이 없는 한 책임을 지지 않습니다.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
                                6. 관할 법원
                            </h3>
                            <p className="text-slate-600">
                                서비스 이용과 관련하여 발생한 분쟁에 대해서는 회사의 본점 소재지를 관할하는 법원을 전용 관할 법원으로 합니다.
                            </p>
                        </section>
                    </div>
                )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                    (주)썬드림 고객지원: 070-7424-2695
                </span>
                <Button 
                    onClick={onClose} 
                    className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                    확인
                </Button>
            </div>
        </Modal>
    );
};
