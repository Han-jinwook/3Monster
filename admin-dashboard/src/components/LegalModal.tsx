import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { ShieldCheck, FileText, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

export type LegalDocType = 'terms' | 'privacy' | 'refund';

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
            title={
                activeTab === 'terms' ? '📜 3Monster 서비스 이용약관' :
                activeTab === 'privacy' ? '🔒 썬드림 개인정보 처리방침' :
                '📦 라이선스 환불 및 청약철회 규정'
            }
            className="max-w-3xl"
        >
            <div className="space-y-4 text-left">
                {/* Tab Navigation */}
                <div className="flex border-b border-slate-200 pb-2 gap-2">
                    <button
                        onClick={() => setActiveTab('terms')}
                        className={cn(
                            "px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5",
                            activeTab === 'terms'
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                    >
                        <FileText className="w-3.5 h-3.5" /> 서비스 이용약관
                    </button>
                    <button
                        onClick={() => setActiveTab('privacy')}
                        className={cn(
                            "px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5",
                            activeTab === 'privacy'
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                    >
                        <ShieldCheck className="w-3.5 h-3.5" /> 개인정보 처리방침
                    </button>
                    <button
                        onClick={() => setActiveTab('refund')}
                        className={cn(
                            "px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5",
                            activeTab === 'refund'
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> 환불 및 청약철회
                    </button>
                </div>

                {/* Content Box */}
                <div className="max-h-[60vh] overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs leading-relaxed text-slate-700 space-y-4">
                    {activeTab === 'terms' && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-black text-slate-900 border-b pb-2">제 1 조 (목적)</h4>
                            <p>
                                본 약관은 <strong>썬드림 주식회사</strong>(이하 "회사")가 제공하는 <strong>3Monster</strong> 소프트웨어 라이선스, 플랫폼 대시보드 및 제반 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                            </p>

                            <h4 className="text-sm font-black text-slate-900 border-b pb-2 pt-2">제 2 조 (용어의 정의)</h4>
                            <p>
                                1. "서비스"란 회사가 개발하여 공급하는 NPlace-DB, CafeCrawler, UserManager, ContentCrawler 등 소프트웨어 패키지 및 3Monster 웹 플랫폼을 의미합니다.<br />
                                2. "이용자"란 본 약관에 동의하고 회사가 발급한 시리얼 키(라이선스)를 등록하여 서비스를 이용하는 자를 의미합니다.<br />
                                3. "시리얼 키(라이선스)"란 정식 소프트웨어를 활성화할 수 있는 고유 식별 암호 코드를 의미합니다.
                            </p>

                            <h4 className="text-sm font-black text-slate-900 border-b pb-2 pt-2">제 3 조 (라이선스 사용 권한 및 제한)</h4>
                            <p>
                                1. 회사는 이용자에게 약정된 이용 기간 및 수집 한도 내에서 소프트웨어를 사용할 수 있는 비독점적이고 양도 불가능한 사용권을 부여합니다.<br />
                                2. 시리얼 키는 원칙적으로 1기기(HWID)에 귀속되며, 타인에게 무단 재판매, 양도, 대여 또는 리버스 엔지니어링(디컴파일)할 수 없습니다.
                            </p>

                            <h4 className="text-sm font-black text-slate-900 border-b pb-2 pt-2">제 4 조 (서비스의 제공 및 기술지원)</h4>
                            <p>
                                1. 회사는 연중무휴 1일 24시간 안정적인 서비스를 제공하기 위해 최선을 다합니다.<br />
                                2. 포털 사이트의 구조 개편이나 알고리즘 업데이트가 발생할 경우, 회사는 신속하게 OTA 자동 업데이트를 통해 프로그램을 유지보수합니다.<br />
                                3. 기술지원은 3Monster 고객센터(070-7424-2695, chiu3@naver.com) 및 1:1 게시판을 통해 평일 09:00~18:00에 제공됩니다.
                            </p>

                            <h4 className="text-sm font-black text-slate-900 border-b pb-2 pt-2">제 5 조 (면책 조항)</h4>
                            <p>
                                1. 회사는 천재지변, 기간통신사업자의 회선 장애 또는 포털 플랫폼의 예고 없는 시스템 차단 등 불가항력으로 인하여 서비스를 일시 제공할 수 없는 경우 책임을 면합니다.<br />
                                2. 이용자가 수집한 데이터의 활용 방식(마케팅 발송 등)과 관련된 법적 책임은 이용자 본인에게 있습니다.
                            </p>
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-black text-slate-900 border-b pb-2">1. 개인정보의 수집 항목 및 방법</h4>
                            <p>
                                <strong>썬드림 주식회사</strong>는 3Monster 서비스 제공, 라이선스 발급, 결제 검증 및 고객 기술지원을 위해 아래와 같은 개인정보를 수집합니다.
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>필수 수집 항목:</strong> 성함(또는 상호명), 이메일 주소, 구매 내역, 기기 식별 고유값(HWID)</li>
                                <li><strong>선택/결제 항목:</strong> 휴대폰 번호, 결제 수단 승인 데이터(카드사 승인번호, 주문번호)</li>
                                <li><strong>자동 수집 항목:</strong> 서비스 접속 로그, IP 주소, 프로그램 버전 정보</li>
                            </ul>

                            <h4 className="text-sm font-black text-slate-900 border-b pb-2 pt-2">2. 개인정보의 수집 및 이용 목적</h4>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>소프트웨어 정식 시리얼 키 자동 발급 및 기기 인증</li>
                                <li>결제 승인 내역 확인 및 세금계산서/현금영수증 발행</li>
                                <li>프로그램 오류 해결을 위한 1:1 기술지원 상담 및 OTA 업데이트 안내</li>
                                <li>재구매 시 15% 우대 할인 혜택 검증</li>
                            </ul>

                            <h4 className="text-sm font-black text-slate-900 border-b pb-2 pt-2">3. 개인정보의 보유 및 이용 기간</h4>
                            <p>
                                원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 전자상거래 등에서의 소비자보호에 관한 법률 등 관련 법령에 따라 아래 정보는 일정 기간 보존합니다.
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
                                <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
                                <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
                            </ul>

                            <h4 className="text-sm font-black text-slate-900 border-b pb-2 pt-2">4. 개인정보 보호책임자</h4>
                            <div className="p-3 bg-white rounded-xl border border-slate-200">
                                <p>• <strong>성명:</strong> 백은숙</p>
                                <p>• <strong>직책:</strong> 개인정보관리책임자 (대표)</p>
                                <p>• <strong>연락처:</strong> 070-7424-2695 / beakes@naver.com (고객센터: chiu3@naver.com)</p>
                                <p>• <strong>주소:</strong> 21330 인천광역시 부평구 주부토로 236 인천테크노밸리 U1센터 C동 1110호/1111호</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'refund' && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-black text-slate-900 border-b pb-2">1. 디지털 라이선스 청약철회 및 환불 기준</h4>
                            <p>
                                3Monster의 소프트웨어는 디지털 콘텐츠(이용권)로 분류되며, 전자상거래 등에서의 소비자보호에 관한 법률 제17조 제2항에 따라 아래와 같은 환불 정책이 적용됩니다.
                            </p>
                            <div className="space-y-2 pt-1">
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
                                    <p className="font-black">✅ 100% 전액 환불 가능 조건</p>
                                    <p className="text-[11px] mt-1">시리얼 키 결제 후 <strong>소프트웨어에 키를 입력하여 기기 인증(바인딩)을 진행하지 않은 상태</strong>에서 결제일로부터 7일 이내에 환불을 요청하신 경우 전액 환불됩니다.</p>
                                </div>
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                                    <p className="font-black">❌ 환불 제한 조건</p>
                                    <p className="text-[11px] mt-1">시리얼 키를 프로그램에 등록하여 <strong>기기 인증이 완료되었거나 데이터 추출 기능을 실제로 이용한 경우</strong>에는 디지털 상품의 특성상 청약철회가 제한됩니다. (단, 프로그램 자체의 치명적 결함으로 작동이 불가능하고 회사가 이를 48시간 내에 수정하지 못한 경우는 예외로 환불 조치됩니다.)</p>
                                </div>
                            </div>

                            <h4 className="text-sm font-black text-slate-900 border-b pb-2 pt-2">2. 환불 신청 및 처리 절차</h4>
                            <p>
                                환불을 원하시는 경우 3Monster 고객센터(070-7424-2695) 또는 기술지원 게시판으로 주문번호 및 시리얼 키를 접수해 주시면 담당자 확인 후 1~2영업일 이내에 결제 취소 또는 계좌 환불을 완료해 드립니다.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer close button */}
                <div className="flex justify-end pt-2">
                    <Button onClick={onClose} className="px-6 h-10 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs">
                        확인 및 닫기
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
