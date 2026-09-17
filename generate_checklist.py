# -*- coding: utf-8 -*-
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def build_checklist():
    wb = openpyxl.Workbook()

    # ==========================================
    # Sheet 1: 전국 키워드 체크리스트
    # ==========================================
    ws1 = wb.active
    ws1.title = '전국_키워드_체크리스트'
    ws1.views.sheetView[0].showGridLines = True

    # Title Header
    ws1.merge_cells('A1:K1')
    title_cell = ws1['A1']
    title_cell.value = '🎯 NPlace-DB 전국 아웃바운드 영업 키워드 실전 공략 체크리스트'
    title_cell.font = Font(name='맑은 고딕', size=16, bold=True, color='FFFFFF')
    title_cell.fill = PatternFill(start_color='1E293B', end_color='1E293B', fill_type='solid')
    title_cell.alignment = Alignment(horizontal='center', vertical='center')
    ws1.row_dimensions[1].height = 42

    # Subtitle / Guide
    ws1.merge_cells('A2:K2')
    sub_cell = ws1['A2']
    sub_cell.value = '※ 지역을 쪼개지 않고 [전국 단위]로 키워드를 입력하여 대량 추출한 뒤 콜드메일 / 인스타DM / 자체문자로 아웃바운드 영업을 진행하는 실전 체크리스트입니다.'
    sub_cell.font = Font(name='맑은 고딕', size=10, italic=True, color='475569')
    sub_cell.fill = PatternFill(start_color='F1F5F9', end_color='F1F5F9', fill_type='solid')
    sub_cell.alignment = Alignment(horizontal='center', vertical='center')
    ws1.row_dimensions[2].height = 26

    # Headers
    headers = [
        '체크\n[ V ]', '타겟 분류', 'NPlace-DB 검색 키워드', '공략 대상 (누구에게?)', 
        '제안 무기 / 킬러 메시지', '예상 DB\n(전국)', '추출일자', 
        '이메일\n발송', '인스타DM\n발송', '문자\n발송', '비고 및 계약/반응 기록'
    ]

    ws1.row_dimensions[3].height = 32
    header_fill = PatternFill(start_color='4F46E5', end_color='4F46E5', fill_type='solid') # Indigo
    header_font = Font(name='맑은 고딕', size=11, bold=True, color='FFFFFF')
    thin_border = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )

    for col_num, h_text in enumerate(headers, 1):
        c = ws1.cell(row=3, column=col_num)
        c.value = h_text
        c.font = header_font
        c.fill = header_fill
        c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
        c.border = thin_border

    # Data Rows
    data = [
        # 1. 마케팅 대행사 / 광고 실행사
        ('마케팅 대행사', '온라인마케팅', '종합 마케팅 / 광고 대행사', '신규 개업 소상공인 DB 공급 / DB 추출기 납품 제안', '3,000+'),
        ('마케팅 대행사', '마케팅대행사', '중소형 실행사 / 랩사', '외주비 절감용 자체 솔루션 도입 (월구독제)', '2,500+'),
        ('마케팅 대행사', '바이럴마케팅', '체험단 / 블로그 바이럴 전문사', '매월 광고주 유치용 아웃바운드 타겟 DB 공급', '2,800+'),
        ('마케팅 대행사', '광고대행사', '전국 오프라인/온라인 광고기획사', '플레이스 상위노출 광고 영업용 소상공인 DB', '4,000+'),
        ('마케팅 대행사', 'SNS마케팅', '인스타그램/쇼츠 대행사', '인스타 계정/DM 보유 업체 타겟 맞춤 DB', '2,200+'),
        ('마케팅 대행사', '인플루언서 마케팅', '인플루언서 매칭 플랫폼/대행사', '협찬 희망 매장/맛집/뷰티샵 타겟 DB 공급', '1,200+'),
        ('마케팅 대행사', '블로그체험단', '체험단 모집 플랫폼 및 실행사', '체험단 필요한 로컬 매장 사장님 직통 DB', '1,800+'),
        ('마케팅 대행사', '퍼포먼스마케팅', '메타/구글/네이버 성과형 광고대행사', 'B2B 클라이언트 영업용 타겟 리스트', '1,500+'),
        ('마케팅 대행사', '검색광고대행사', '네이버 파워링크/쇼핑검색 대행사', '로컬 키워드 광고주 전환 영업용 DB', '1,600+'),
        ('마케팅 대행사', '브랜드마케팅', '브랜딩 / 디자인 에이전시', '신규 오픈 매장 CI/BI/인테리어 패키지 영업', '1,100+'),
        ('마케팅 대행사', '웹에이전시', '홈페이지 / 쇼핑몰 제작사', '웹사이트 없는 로컬 플레이스 매장 DB 공급', '2,000+'),
        ('마케팅 대행사', '홈페이지제작', '소상공인 전문 웹제작 업체', '홈페이지 미보유 매장 타겟 랜딩페이지 영업', '3,500+'),
        ('마케팅 대행사', '상세페이지제작', '이커머스/스마트스토어 상세페이지 제작사', '온라인 판로 개척 희망 제조/도소매업 DB', '1,400+'),
        ('마케팅 대행사', '영상제작대행', '유튜브/릴스/홍보영상 프로덕션', '영상 홍보 필요한 병원/학원/호텔 타겟 DB', '1,900+'),

        # 2. 분양 대행사 / 부동산 영업팀
        ('분양/부동산 대행사', '분양대행사', '아파트/오피스텔/상가 분양대행 법인', '분양 고객 유치용 고소득 자영업자/원장 DB', '3,200+'),
        ('분양/부동산 대행사', '분양홍보관', '전국 현장 모델하우스/홍보관', '현장 인근 고소득 병원장/전문직 타겟 DB', '1,500+'),
        ('분양/부동산 대행사', '분양영업소', '분양 총괄 본부 / 영업 팀장', '팀원 영업용 실시간 타겟 리스트 대량 공급', '1,800+'),
        ('분양/부동산 대행사', '지식산업센터분양', '지산 분양 전문 대행사/영업단', '사무실 이전/확장 필요한 법인/제조/IT 기업 DB', '1,200+'),
        ('분양/부동산 대행사', '오피스텔분양', '수익형 부동산 분양 대행사', '임대 수익 희망 자산가/원장님 타겟 DB', '1,400+'),
        ('분양/부동산 대행사', '상가분양', '신축 상가/프라자상가 분양팀', '개원/개업 희망 프랜차이즈/병원/학원장 DB', '2,100+'),
        ('분양/부동산 대행사', '부동산컨설팅', '토지개발 / 상업용 부동산 컨설팅', '부동산 투자 여력 있는 전국 사업체 대표 DB', '4,500+'),
        ('분양/부동산 대행사', '부동산마케팅', '부동산 온라인 분양 마케팅사', '분양 전용 콜드아웃바운드 솔루션 납품', '1,300+'),
        ('분양/부동산 대행사', '토지개발', '토지 분양 / 전원주택 개발사', '전원주택/세컨하우스 타겟 고소득 대표 DB', '1,600+'),

        # 3. 프랜차이즈 가맹본부 / 창업 영업
        ('프랜차이즈 가맹본부', '프랜차이즈본사', '외식/유통/서비스 프랜차이즈 본사', '신규 가맹점주 유치용 창업 희망 자영업자 DB', '2,800+'),
        ('프랜차이즈 가맹본부', '가맹본부', '전국 가맹 사업 본부 (FC)', '업종 전환 희망 매장(폐업 위기 매장) 리스트', '2,100+'),
        ('프랜차이즈 가맹본부', '창업컨설팅', '상가 매매 / 창업 중개 컨설팅사', '양도양수/신규 매장 계약 희망 대표자 DB', '3,400+'),
        ('프랜차이즈 가맹본부', '외식프랜차이즈', '치킨/피자/고깃집/주점 가맹본부', '배달전문점/외식업 자영업자 직통 연락처', '1,900+'),
        ('프랜차이즈 가맹본부', '카페창업컨설팅', '원두 유통 / 베이커리 / 카페 컨설팅', '전국 신규 카페/베이커리 매장 개업 DB', '1,500+'),
        ('프랜차이즈 가맹본부', '무인창업', '무인 아이스크림/빨래방/밀키트 본사', '무인 아이템 추가 도입 희망 샵인샵 점주 DB', '1,100+'),
        ('프랜차이즈 가맹본부', '스터디카페창업', '스터디카페 / 독서실 프랜차이즈', '공실 상가 소유주 및 학원가 인근 투자자 DB', '800+'),
        ('프랜차이즈 가맹본부', '식자재유통', 'B2B 식자재/원자재 공급 업체', '전국 음식점/주점 직통 번호/주소 DB 납품', '3,800+'),
        ('프랜차이즈 가맹본부', '포스기설치', '카드단말기 / POS / 키오스크 유통사', '신규 오픈 예정/개업 매장 긴급 단말기 영업', '2,600+'),

        # 4. B2B 서비스 / 전문직 법인
        ('B2B 전문 서비스', '정책자금컨설팅', '중기부/소진공 정책자금 경영컨설팅', '시설자금/운전자금 필요 소상공인/중소기업 DB', '3,100+'),
        ('B2B 전문 서비스', '경영컨설팅', '기업부설연구소/벤처인증 컨설팅', '법인 사업자 및 기술 인증 타겟 DB', '2,900+'),
        ('B2B 전문 서비스', '세무회계사무소', '세무사 / 회계사 사무소', '신규 사업자 세무 기장 대리 영업용 DB', '4,200+'),
        ('B2B 전문 서비스', '노무법인', '공인노무사 사무소 / 노무컨설팅', '직원 고용 5인 이상 음식점/병원/학원 DB', '2,700+'),
        ('B2B 전문 서비스', '법인보험영업', '법인 GA / CEO 플랜 / 기업보험', '대표자 상해보험/화재보험/퇴직연금 플랜', '3,600+'),
        ('B2B 전문 서비스', '방역소독업체', '위생 방역 / 해충 방제 / 소독', '정기 소독 의무 대상 음식점/학원/병원 DB', '2,300+'),
        ('B2B 전문 서비스', '인테리어시공', '상업공간 / 사무실 전문 인테리어', '오래된 매장 리모델링 및 신규 이전 업체 DB', '5,000+'),
        ('B2B 전문 서비스', '간판제작', '옥외광고 / LED 간판 / 썬팅 전문', '개업/리뉴얼 준비 매장 간판 교체 영업 DB', '4,100+')
    ]

    category_colors = {
        '마케팅 대행사': 'EEF2FF',      # Light Indigo
        '분양/부동산 대행사': 'FEF3C7',  # Light Amber
        '프랜차이즈 가맹본부': 'ECFDF5', # Light Emerald
        'B2B 전문 서비스': 'F3E8FF'     # Light Purple
    }

    row_idx = 4
    for item in data:
        ws1.row_dimensions[row_idx].height = 24
        cat = item[0]
        bg_color = category_colors.get(cat, 'FFFFFF')
        row_fill = PatternFill(start_color=bg_color, end_color=bg_color, fill_type='solid')
        
        # Col 1: Checkbox
        c1 = ws1.cell(row=row_idx, column=1, value='[  ]')
        c1.alignment = Alignment(horizontal='center', vertical='center')
        
        # Col 2: Category
        c2 = ws1.cell(row=row_idx, column=2, value=cat)
        c2.alignment = Alignment(horizontal='center', vertical='center')
        c2.font = Font(name='맑은 고딕', size=10, bold=True)
        
        # Col 3: Keyword (Bold)
        c3 = ws1.cell(row=row_idx, column=3, value=item[1])
        c3.alignment = Alignment(horizontal='left', vertical='center', indent=1)
        c3.font = Font(name='맑은 고딕', size=10, bold=True, color='1E1B4B')
        
        # Col 4: Target
        c4 = ws1.cell(row=row_idx, column=4, value=item[2])
        c4.alignment = Alignment(horizontal='left', vertical='center', indent=1)
        
        # Col 5: Weapon
        c5 = ws1.cell(row=row_idx, column=5, value=item[3])
        c5.alignment = Alignment(horizontal='left', vertical='center', indent=1)
        
        # Col 6: Estimated Count
        c6 = ws1.cell(row=row_idx, column=6, value=item[4])
        c6.alignment = Alignment(horizontal='center', vertical='center')
        c6.font = Font(name='맑은 고딕', size=10, bold=True, color='4338CA')
        
        # Col 7: Extract Date
        c7 = ws1.cell(row=row_idx, column=7, value='')
        c7.alignment = Alignment(horizontal='center', vertical='center')
        
        # Col 8, 9, 10: Channels
        c8 = ws1.cell(row=row_idx, column=8, value='[  ]')
        c8.alignment = Alignment(horizontal='center', vertical='center')
        c9 = ws1.cell(row=row_idx, column=9, value='[  ]')
        c9.alignment = Alignment(horizontal='center', vertical='center')
        c10 = ws1.cell(row=row_idx, column=10, value='[  ]')
        c10.alignment = Alignment(horizontal='center', vertical='center')
        
        # Col 11: Note
        c11 = ws1.cell(row=row_idx, column=11, value='')
        c11.alignment = Alignment(horizontal='left', vertical='center')
        
        for col_i in range(1, 12):
            cell = ws1.cell(row=row_idx, column=col_i)
            cell.border = thin_border
            if col_i in [1, 7, 8, 9, 10, 11]:
                cell.fill = PatternFill(start_color='FFFFFF', end_color='FFFFFF', fill_type='solid')
            else:
                cell.fill = row_fill
            if not cell.font.name:
                cell.font = Font(name='맑은 고딕', size=10)
                
        row_idx += 1

    # Column Widths for Sheet 1
    col_widths1 = {
        'A': 8,   # Checkbox
        'B': 18,  # Category
        'C': 20,  # Keyword
        'D': 28,  # Target
        'E': 38,  # Weapon
        'F': 12,  # Est Count
        'G': 14,  # Date
        'H': 10,  # Email
        'I': 11,  # Insta
        'J': 10,  # SMS
        'K': 32   # Notes
    }
    for col_letter, width in col_widths1.items():
        ws1.column_dimensions[col_letter].width = width

    # ==========================================
    # Sheet 2: 콜드메일 및 발송 문구 템플릿
    # ==========================================
    ws2 = wb.create_sheet(title='콜드아웃바운드_발송템플릿')
    ws2.views.sheetView[0].showGridLines = True

    ws2.merge_cells('A1:F1')
    t2_cell = ws2['A1']
    t2_cell.value = '📋 즉시 복사해서 쓰는 타겟별 콜드메일 / 인스타DM / 자체문자 템플릿'
    t2_cell.font = Font(name='맑은 고딕', size=15, bold=True, color='FFFFFF')
    t2_cell.fill = PatternFill(start_color='0F172A', end_color='0F172A', fill_type='solid')
    t2_cell.alignment = Alignment(horizontal='center', vertical='center')
    ws2.row_dimensions[1].height = 42

    ws2.merge_cells('A2:F2')
    s2_cell = ws2['A2']
    s2_cell.value = '※ NPlace-DB 프로그램 [이메일] 탭 및 [인스타] 탭, 그리고 대표님의 [자체 문자발송기]에 그대로 복사해서 붙여넣으시면 됩니다.'
    s2_cell.font = Font(name='맑은 고딕', size=10, italic=True, color='475569')
    s2_cell.fill = PatternFill(start_color='F8FAFC', end_color='F8FAFC', fill_type='solid')
    s2_cell.alignment = Alignment(horizontal='center', vertical='center')
    ws2.row_dimensions[2].height = 26

    headers2 = ['구분', '타겟 업종', '채널', '메일 제목 / DM 첫줄', '발송 본문 템플릿 (치환태그 {상호명} 사용)', '핵심 공략 포인트']
    ws2.row_dimensions[3].height = 30
    h2_fill = PatternFill(start_color='2563EB', end_color='2563EB', fill_type='solid') # Blue
    for col_num, h_text in enumerate(headers2, 1):
        c = ws2.cell(row=3, column=col_num)
        c.value = h_text
        c.font = Font(name='맑은 고딕', size=11, bold=True, color='FFFFFF')
        c.fill = h2_fill
        c.alignment = Alignment(horizontal='center', vertical='center')
        c.border = thin_border

    templates_data = [
        # 1. 마케팅 대행사 - 콜드메일
        (
            '템플릿 1',
            '마케팅 대행사\n/ 광고 실행사',
            '콜드 이메일',
            '[제안] {상호명} 영업팀의 소상공인 DB 수집 인건비를 80% 줄여드립니다.',
            '''안녕하세요 {상호명} 대표님 및 마케팅 실무진 여러분!

신규 광고주 발굴하실 때, 아직도 알바생 써서 포털 지도를 일일이 클릭하며 엑셀 정리하고 계신가요?

저희 [마케팅몬스터]는 네이버 스마트플레이스에 등록된 전국의 상호, 직통 전화번호, 휴대폰, 인스타ID, 이메일, 블로그를 단 3분 만에 실시간 대량 추출하고 자동 발송까지 원클릭으로 처리하는 올인원 솔루션 [NPlace-DB]를 개발·공급하고 있습니다.

■ 대행사 실무진이 가장 열광하는 3가지:
1. 최신 개업 매장 실시간 타겟팅 (오픈 초기 마케팅 니즈 100%)
2. 인스타DM & 이메일 자동 발송 엔진 탑재
3. 건당 100원씩 사던 DB 비용 -> 월 구독제로 무제한급 자체 수집

현재 전국 30여 개 대행사에서 영업 인건비를 80% 절감하고 있습니다.
지금 100건 무료 체험으로 영업팀의 생산성을 5배 높여보세요.

▶ 무료 체험 및 프로그램 안내: [쇼룸/다운로드 링크 삽입]
궁금하신 점은 본 메일로 회신 주시면 10분 내로 답변드리겠습니다.

- 마케팅몬스터 B2B 솔루션팀 배상 -''',
            '외주비/인건비 절감과 최신 오픈 매장 선점 니즈 공략'
        ),
        # 2. 마케팅 대행사 - 인스타 DM
        (
            '템플릿 2',
            '마케팅 대행사\n/ 실행사',
            '인스타 DM',
            '안녕하세요 {상호명} 대표님! 협업 제안드립니다.',
            '''안녕하세요 {상호명} 대표님! 피드 마케팅 인사이트 잘 보고 있습니다 :)

혹시 신규 광고주 영업하실 때 소상공인 DB 수집에 시간과 인건비가 많이 들지 않으신가요?

저희는 네이버 플레이스 기반으로 전국 최신 개업 매장의 대표 번호와 인스타를 실시간으로 자동 수집해 주는 [마케팅몬스터 NPlace-DB]를 운영하고 있습니다.

대행사 영업팀에서 바로 써보실 수 있게 100건 무료 체험판을 제공해 드리고 있습니다.
필요하시면 링크 안내해 드리겠습니다. 번창하세요!''',
            '인스타 계정을 활발히 운영하는 트렌디한 대행사 대표 공략'
        ),
        # 3. 마케팅 대행사 - LMS 장문
        (
            '템플릿 3',
            '마케팅 대행사\n/ 실행사',
            '문자(LMS)',
            '[마케팅몬스터] {상호명} 광고영업팀 소상공인 DB 솔루션 안내',
            '''[마케팅몬스터] {상호명} 대표님 안녕하십니까.

광고주 수주 영업용 소상공인 DB, 아직도 비싼 돈 주고 사거나 직원이 노가다 수집하시나요?

[NPlace-DB]로 전국 신규 오픈 매장의 휴대폰/대표번호/인스타를 클릭 한 번으로 대량 추출하세요.
- 전국 시/군/구 및 업종별 맞춤 실시간 추출
- 엑셀 즉시 저장 후 콜드콜/문자 영업 바로 투입
- 월 3~7만원대 부담 없는 구독으로 팀 전체 활용

지금 100건 무료 추출로 직접 퀄리티를 검증해 보세요!
▶ 무료체험: [링크 삽입]
무료거부: 080-XXX-XXXX''',
            '광고영업팀장의 즉각적인 유효 DB 갈증 해결'
        ),
        # 4. 마케팅 대행사 - SMS 단문 (90byte)
        (
            '템플릿 4',
            '마케팅 대행사\n/ 실행사',
            '문자(SMS 90B)',
            '(단문)',
            '''(광고){상호명} 광고주발굴용 전국소상공인 실시간DB추출기 무료100건 [링크] 거부080-XXX-XXXX''',
            '90바이트 이하 최저비용 초대량 콜드 발송 최적화'
        ),
        # 5. 분양 대행사 - 콜드 이메일
        (
            '템플릿 5',
            '분양 대행사\n/ 부동산 영업팀',
            '콜드 이메일',
            '[분양영업] {상호명} 본부장님, 이번 현장 타겟 고객(고소득 자영업자/원장) DB 확보하셨습니까?',
            '''안녕하십니까, {상호명} 분양 총괄 본부장님 및 영업 팀장님.

요즘 분양 시장 침체로 TM 및 워킹 고객 유치가 갈수록 힘들어지고 있는 현장의 고충을 잘 알고 있습니다.

기존에 돌려쓰던 낡은 부동산 DB는 번호가 바뀌었거나 수신거부당하기 일쑤입니다.
지금 가장 효과적인 영업 타겟은 **[현장 인근의 고소득 병의원장, 프랜차이즈 대표, 대형 학원장]**의 최신 실시간 연락처입니다.

저희 [NPlace-DB]는 특정 지역(구/동 단위)의 고소득 자영업자 및 전문직 대표자 연락처를 실시간으로 즉시 추출하여 팀원들에게 배포할 수 있는 B2B 영업 무기입니다.

■ 분양 현장 맞춤 활용법:
1. 반경 5km 이내 신규 개업 병원, 한의원, 대형 음식점 대표 직통 번호 추출
2. 상가/지식산업센터 이전 수요가 있는 전국 법인/사업체 타겟팅
3. 팀원들 콜드콜/단체문자용 엑셀 즉시 다운로드

지금 100건 무료 추출로 인근 병원/사업체 번호가 얼마나 정확한지 직접 확인해 보십시오.

▶ 분양 전용 솔루션 체험: [쇼룸/다운로드 링크 삽입]

- 마케팅몬스터 영업지원팀 배상 -''',
            '낡은 DB로 지친 분양 본부장/영업팀장의 즉각적 갈증 해결'
        ),
        # 6. 분양 대행사 - 문자(LMS)
        (
            '템플릿 6',
            '분양 대행사\n/ 영업팀',
            '문자(LMS)',
            '[긴급] {상호명} 분양본부 타겟 영업 DB 안내',
            '''(광고)[마케팅몬스터] {상호명} 본부장님 안녕하십니까.

신규 분양 현장 오픈 후 유효 고객 DB 확보에 고민 많으시죠?
돌려쓰는 낡은 DB 대신, 현장 인근 병원장/전문직/자영업자 대표님의 [100% 최신 실시간 연락처]를 즉시 추출해 주는 솔루션을 제안드립니다.

- 반경 내 타겟 업종(병원/학원/프랜차이즈) 번호 실시간 추출
- 엑셀 즉시 저장 후 TM/단체문자 바로 연동
- 월 3~7만원대 부담 없는 구독으로 팀 전체 사용

지금 무료 100건 추출로 품질을 직접 검증하세요:
▶ [링크 삽입]
무료거부: 080-XXX-XXXX''',
            '대표님의 자체 문자발송기에 넣고 대량 발송 최적화'
        ),
        # 7. 분양 대행사 - 문자(SMS 90byte)
        (
            '템플릿 7',
            '분양 대행사\n/ 영업팀',
            '문자(SMS 90B)',
            '(단문)',
            '''(광고){상호명} 분양현장 인근 고소득 병원장/대표자 실시간DB추출 무료체험 [링크] 거부080-XXX-XXXX''',
            '현장 인근 자산가/원장님 타겟팅 강조 단문'
        ),
        # 8. 프랜차이즈 본사 - 콜드 이메일
        (
            '템플릿 8',
            '프랜차이즈 본사\n/ 가맹사업팀',
            '콜드 이메일',
            '[가맹영업] {상호명} 가맹점 100호점 돌파를 위한 전국 타겟 DB 솔루션',
            '''안녕하십니까, {상호명} 가맹사업본부 담당자님!

귀사의 멋진 브랜드 확장과 가맹 사업 성공을 진심으로 응원합니다.

신규 가맹점주를 유치하거나 업종 변경 창업을 제안할 때, 박람회 참가비나 포털 키워드 광고비로 수백만 원씩 지출하고 계시지는 않습니까?

[마케팅몬스터 NPlace-DB]를 사용하시면:
1. 전국 동종 업계 매장의 연락처를 실시간으로 확보하여 가맹 전환 제안
2. 샵인샵 / 밀키트 도입이 가능한 전국 카페, 펍, 음식점 타겟팅
3. 월 커피 한두 잔 가격으로 전국 수만 개 매장의 DB를 영구 보유

비싼 광고비 쓰시기 전에, 저희 솔루션으로 직접 타겟 가맹주들에게 제안해 보십시오.
무료 100건 체험을 통해 즉시 확인 가능합니다.

▶ 가맹영업 솔루션 안내: [링크 삽입]

- 마케팅몬스터 FC지원팀 -''',
            '가맹점 확장 비용 절감 및 타겟팅 가맹영업'
        ),
        # 9. 프랜차이즈 본사 - 문자(LMS)
        (
            '템플릿 9',
            '프랜차이즈 본사\n/ 가맹사업팀',
            '문자(LMS)',
            '[가맹영업] {상호명} 가맹점주 모집 전용 DB 솔루션',
            '''(광고)[마케팅몬스터] {상호명} 가맹본부 대표님 안녕하십니까.

가맹점 확장 영업, 아직도 고비용 박람회와 온라인 키워드 광고에만 의존하시나요?
[NPlace-DB]로 전국의 업종변경 희망 매장 및 창업 관심 자영업자 연락처를 실시간 추출하세요.

- 전국 외식/카페/주점 매장 직통 번호 원클릭 수집
- 가맹 제안서 발송용 이메일/인스타DM/문자 번호 통합 제공
- 월 구독제로 비용 부담 없이 대량 아웃바운드 진행

지금 100건 무료 추출로 가맹 영업의 속도를 올려보십시오.
▶ 무료체험: [링크 삽입]
무료거부: 080-XXX-XXXX''',
            '가맹본부 영업담당자의 월 가맹 유치 목표 달성 지원'
        ),
        # 10. 프랜차이즈 본사 - 인스타 DM
        (
            '템플릿 10',
            '프랜차이즈 본사\n/ 가맹사업팀',
            '인스타 DM',
            '{상호명} 가맹사업팀 담당자님 안녕하세요!',
            '''안녕하세요 {상호명} 본사 담당자님! 피드 브랜드 스토리 멋지게 보고 있습니다 :)

혹시 가맹점 확장 영업하실 때 전국 매장 타겟 DB 수집이 필요하지 않으신가요?
전국 상권별 자영업자 대표 번호와 인스타를 실시간 수집해 주는 [NPlace-DB]입니다.

가맹본부 전용 100건 무료 체험판을 제공 중이니 필요하시면 링크 전달해 드리겠습니다. 번창하세요!''',
            'SNS 활동이 활발한 트렌디한 F&B 가맹본부 마케팅팀 공략'
        ),
        # 11. B2B 전문 서비스 - 정책자금/컨설팅 콜드 이메일
        (
            '템플릿 11',
            'B2B 전문 서비스\n(정책자금/컨설팅)',
            '콜드 이메일',
            '[제안] {상호명} 지도사님, 중소기업/소상공인 정책자금 상담 DB 매월 어떻게 확보하십니까?',
            '''안녕하십니까 {상호명} 대표님 및 전문 지도사님.

정부 지원 정책자금, 시설자금 컨설팅 영업 시 가장 큰 병목은 [상담을 받을 유효 법인/사업체 대표의 연락처 확보]입니다.
시중에 도는 콜센터 DB는 10곳 넘게 전화를 받아 대표들이 매우 피로해합니다.

[NPlace-DB]는 전국 시/도/구별 신규 개업 매장과 중소기업 대표자의 최신 실시간 등록 정보를 단 3분 만에 엑셀로 내려받는 프로그램입니다.

■ 정책자금 컨설팅 맞춤 활용법:
1. 시설자금/운전자금 수요가 높은 신규 제조/도소매/음식점 대표 DB 추출
2. 고용지원금/바우처 적용 가능한 5인 이상 사업장 집중 타겟팅
3. 건당 몇만 원씩 사던 DB 비용 -> 월 구독제로 원하는 만큼 직접 추출

지금 100건 무료 체험으로 진짜 최신 사업자 번호인지 직접 확인해보십시오.
▶ 100건 무료 추출하기: [체험링크 삽입]

- 마케팅몬스터 B2B지원팀 -''',
            '닳고 닳은 정책자금 영업 DB 탈피, 신규 사업자 선점 영업'
        ),
        # 12. B2B 전문 서비스 - 세무기장 LMS
        (
            '템플릿 12',
            'B2B 전문 서비스\n(세무회계/노무)',
            '문자(LMS)',
            '[세무기장] {상호명} 신규 개업 사업자 기장영업 DB 안내',
            '''(광고)[마케팅몬스터] {상호명} 세무사님 안녕하십니까.

기장 거래처 확장을 위한 신규 사업자 발굴, 어떻게 하고 계신가요?
개업 1~3개월 차 사업자는 세무 기장과 부가세 신고 안내가 절실한 시기입니다.

[NPlace-DB]는 관내 신규 오픈 매장의 상호, 대표번호, 휴대폰을 실시간으로 자동 수집하여 기장 제안 안내문 발송을 돕습니다.
- 우리 지역 신규 개업 매장 실시간 추출
- 세무/노무 안내문 우편 및 문자 발송용 엑셀 즉시 생성
- 월 구독제로 언제든 추가 추출 가능

지금 100건 무료 추출로 관내 신규 매장을 확인하세요.
▶ 무료체험: [링크 삽입]
무료거부: 080-XXX-XXXX''',
            '신규 개업 사업자의 세무 기장 니즈 타이밍 선점'
        ),
        # 13. B2B 전문 서비스 - 단문 SMS
        (
            '템플릿 13',
            'B2B 전문 서비스\n(정책/세무/노무)',
            '문자(SMS 90B)',
            '(단문)',
            '''(광고){상호명} 신규개업 사업자/법인대표 실시간 직통DB 추출기 무료100건 [링크] 거부080-XXX-XXXX''',
            '90바이트 단문 초저가 대량 발송 최적화'
        ),
        # 14. 상가 인테리어 / 간판 - 콜드 이메일
        (
            '템플릿 14',
            '상가 인테리어\n/ 간판 / 시공',
            '콜드 이메일',
            '[시공영업] {상호명} 대표님, 개업/리뉴얼 준비 매장 DB 매일 실시간으로 받아보세요',
            '''안녕하십니까 {상호명} 대표님!

상업 공간 인테리어와 LED 간판 시공은 [공사 시작 직전의 매장]을 가장 먼저 찾는 것이 영업의 90%입니다.

[NPlace-DB]는 네이버 플레이스에 새롭게 등록되는 전국 매장(상가 오픈 준비 중인 매장)의 정보를 실시간으로 수집해 드립니다.
- 신규 오픈 예정 매장 상호 및 대표자 번호 선제적 확보
- 인테리어/간판 무료 실측 및 3D 시안 제안용 콜드메일/문자 즉시 발송
- 타사보다 2~3주 먼저 대표자와 접촉하여 수주율 극대화

지금 100건 무료 추출로 관내 신규 매장을 확인해 보십시오.
▶ 인테리어/간판 전용 무료체험: [체험링크 삽입]

- 마케팅몬스터 시공솔루션팀 -''',
            '공사 수주를 위한 신규 매장 선점 영업 및 실측 제안'
        ),
        # 15. 상가 인테리어 / 간판 - 문자(LMS)
        (
            '템플릿 15',
            '상가 인테리어\n/ 간판 / 시공',
            '문자(LMS)',
            '[시공영업] {상호명} 신규 개업 상가 실시간 DB 안내',
            '''(광고)[마케팅몬스터] {상호명} 대표님 안녕하십니까.

인테리어/간판 공사 수주, 지인 소개나 오프라인 발품만으로는 한계가 있으셨죠?
[NPlace-DB]로 오픈을 준비 중인 우리 지역 상가/매장 사장님들의 연락처를 실시간 수집하세요.

- 신규 오픈 매장 대표 번호/휴대폰 즉시 확보
- 간판 교체 및 리모델링 제안 문자 바로 발송
- 월 구독제로 지역별 상가 DB 무제한 수집

지금 100건 무료 추출로 즉시 확인하세요:
▶ [링크 삽입]
무료거부: 080-XXX-XXXX''',
            '실시간 신규 오픈 상가 대표에게 다이렉트 시공 제안'
        ),
        # 16. 식자재 유통 / 주류 / 포스기 - 콜드 이메일
        (
            '템플릿 16',
            '식자재 유통\n/ 포스기·키오스크',
            '콜드 이메일',
            '[식자재/포스] {상호명} 영업팀의 신규 음식점·카페 계약을 폭발시키는 실시간 DB 솔루션',
            '''안녕하십니까 {상호명} 대표님 및 영업 담당자님.

식자재 납품과 POS/카드단말기 영업은 [신규 개업 음식점]을 경쟁사보다 하루라도 먼저 방문하는 것이 생명입니다.

[NPlace-DB]는 전국 외식업 매장(한식, 중식, 양식, 카페, 주점)의 상호, 상세주소, 직통 연락처를 실시간으로 추출해 드립니다.

■ 유통/단말기사 활용 방법:
1. 관할 구역 내 신규 오픈 음식점 리스트 매일 아침 추출
2. 배송 루트별 매장 주소 확인 후 루트 세일즈 동선 최적화
3. 포스/단말기 무료 설치 및 식자재 단가 비교 제안 문자 즉시 발송

지금 100건 무료 추출로 우리 동네 신규 매장을 즉시 확인해 보십시오.
▶ 식자재/포스 솔루션 무료체험: [체험링크 삽입]

- 마케팅몬스터 유통솔루션팀 -''',
            '경쟁사보다 빠른 첫 납품 계약 선점'
        ),
        # 17. 식자재 유통 / 주류 / 포스기 - 문자(LMS)
        (
            '템플릿 17',
            '식자재 유통\n/ 포스기·키오스크',
            '문자(LMS)',
            '[영업지원] {상호명} 전국 신규 음식점 실시간 DB',
            '''(광고)[마케팅몬스터] {상호명} 대표님 안녕하십니까.

신규 음식점/카페 납품 계약, 발품 파는 영업 사원들의 이동 동선 때문에 고민이셨죠?
[NPlace-DB]로 관내 신규 오픈 외식업 매장 연락처와 주소를 한 번에 엑셀로 받으세요.

- 지역별 신규 요식업/카페 매장 실시간 수집
- 식자재 샘플 제공 및 포스기 교체 제안 단체문자 즉시 연동
- 월 구독제로 영업팀 전원 최신 DB 공유

지금 100건 무료 추출로 매장 목록을 확인하세요:
▶ [링크 삽입]
무료거부: 080-XXX-XXXX''',
            '루트 세일즈 팀의 방문 영업 효율 극대화'
        ),
        # 18. 병의원 / 뷰티샵 / 헬스케어 - 콜드 이메일
        (
            '템플릿 18',
            '병의원 / 뷰티샵\n/ 헬스케어',
            '콜드 이메일',
            '[원장님 전용] {상호명} 신규 환자/고객 유치를 위한 인근 상권 타겟팅 DB 솔루션',
            '''안녕하십니까 {상호명} 원장님.

인근 지역 경쟁 매장 증가와 높은 포털 광고비로 마케팅 효율에 고민이 많으실 줄 압니다.
지역 기반 병의원, 피부관리실, 피트니스 센터는 [인근 사업체 대표 및 직장인 타겟 제휴]가 가장 안정적인 매출 파이프라인입니다.

[NPlace-DB]는 원장님 매장 반경 3~5km 이내의 기업체, 법인, 매장 연락처를 실시간 추출해 드립니다.
- 인근 회사 임직원 대상 비급여/건강검진/회원권 기업 제휴 제안
- 인근 자영업자 상생 할인 프로모션 안내문 발송
- 월 3~7만원대 부담 없는 솔루션으로 직접 타겟 마케팅

100건 무료 체험으로 원장님 매장 인근의 사업체 목록을 직접 조회해 보십시오.
▶ 100건 무료체험: [체험링크 삽입]

- 마케팅몬스터 로컬헬스팀 -''',
            '반경 3km 기업체 임직원 B2B 단체제휴 및 로컬 VIP 고객 확보'
        ),
        # 19. 학원 / 교육 프랜차이즈 - 문자(LMS)
        (
            '템플릿 19',
            '학원 / 교육 프랜차이즈',
            '문자(LMS)',
            '[원생모집] {상호명} 학원 인근 상권 학부모/상가 타겟 DB 안내',
            '''(광고)[마케팅몬스터] {상호명} 원장님 안녕하십니까.

새 학기/방학 특강 원생 모집, 현수막과 전단지 배포 비용 대비 효과가 떨어져 고민이셨죠?
학원 반경 2km 이내 상가 사장님들과 자영업자 가정은 가장 신뢰할 수 있는 잠재 원생 학부모입니다.

[NPlace-DB]로 학원 인근 상권 대표님들의 최신 연락처를 추출하여 특강 설명회 초대장을 발송하세요.
- 학원 인근 매장 사장님 직통 번호 추출
- 무료 진단 및 개강 설명회 문자 발송
- 월 구독제로 학원 자체 원생 모집 시스템 구축

지금 무료 100건으로 인근 매장 목록을 확인하세요:
▶ [링크 삽입]
무료거부: 080-XXX-XXXX''',
            '학원가 인근 자영업 학부모 타겟팅 및 설명회 초대'
        ),
        # 20. 만능 공통 단문 SMS (90byte)
        (
            '템플릿 20',
            '만능 공통\n(전 업종 발송용)',
            '문자(SMS 90B)',
            '(단문)',
            '''(광고){상호명} 전국 매장 대표번호/인스타/이메일 실시간 DB추출기 무료100건체험 [링크] 거부080-XXX-XXXX''',
            '90바이트 이하 최저비용으로 수만 건 대량 콜드 아웃바운드 즉시 실행'
        )
    ]

    r_idx2 = 4
    for t_item in templates_data:
        ws2.row_dimensions[r_idx2].height = 140
        
        # 1. No
        c1 = ws2.cell(row=r_idx2, column=1, value=t_item[0])
        c1.alignment = Alignment(horizontal='center', vertical='center')
        c1.font = Font(name='맑은 고딕', size=11, bold=True)
        
        # 2. Target
        c2 = ws2.cell(row=r_idx2, column=2, value=t_item[1])
        c2.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
        c2.font = Font(name='맑은 고딕', size=10, bold=True, color='1E40AF')
        
        # 3. Channel
        c3 = ws2.cell(row=r_idx2, column=3, value=t_item[2])
        c3.alignment = Alignment(horizontal='center', vertical='center')
        c3.font = Font(name='맑은 고딕', size=10, bold=True, color='047857' if '문자' in t_item[2] else ('D97706' if 'DM' in t_item[2] else '4338CA'))
        
        # 4. Subject
        c4 = ws2.cell(row=r_idx2, column=4, value=t_item[3])
        c4.alignment = Alignment(horizontal='left', vertical='center', wrap_text=True)
        c4.font = Font(name='맑은 고딕', size=10, bold=True)
        
        # 5. Body
        c5 = ws2.cell(row=r_idx2, column=5, value=t_item[4])
        c5.alignment = Alignment(horizontal='left', vertical='top', wrap_text=True)
        c5.font = Font(name='Consolas', size=9.5)
        
        # 6. Strategy Point
        c6 = ws2.cell(row=r_idx2, column=6, value=t_item[5])
        c6.alignment = Alignment(horizontal='left', vertical='center', wrap_text=True)
        c6.font = Font(name='맑은 고딕', size=9.5, italic=True, color='475569')
        
        for ci in range(1, 7):
            cell = ws2.cell(row=r_idx2, column=ci)
            cell.border = thin_border
            cell.fill = PatternFill(start_color='FFFFFF' if r_idx2 % 2 == 0 else 'F8FAFC', end_color='FFFFFF' if r_idx2 % 2 == 0 else 'F8FAFC', fill_type='solid')
            
        r_idx2 += 1

    col_widths2 = {
        'A': 12, # No
        'B': 22, # Target
        'C': 16, # Channel
        'D': 32, # Subject
        'E': 75, # Body
        'F': 35  # Strategy
    }
    for cl, cw in col_widths2.items():
        ws2.column_dimensions[cl].width = cw

    # Print Setup for Sheet 1 (A4 Landscape, fit to page width)
    ws1.page_setup.orientation = ws1.ORIENTATION_LANDSCAPE
    ws1.page_setup.paperSize = ws1.PAPERSIZE_A4
    ws1.page_setup.fitToWidth = 1
    ws1.page_setup.fitToHeight = 0
    ws1.sheet_properties.pageSetUpPr.fitToPage = True

    # Print Setup for Sheet 2 (A4 Landscape, fit to page width)
    ws2.page_setup.orientation = ws2.ORIENTATION_LANDSCAPE
    ws2.page_setup.paperSize = ws2.PAPERSIZE_A4
    ws2.page_setup.fitToWidth = 1
    ws2.page_setup.fitToHeight = 0
    ws2.sheet_properties.pageSetUpPr.fitToPage = True

    out_path_done = r'd:\3Monster\전국_영업공략_키워드_체크리스트_완성본.xlsx'
    wb.save(out_path_done)
    print(f"SUCCESS: {out_path_done}")

    out_path = r'd:\3Monster\전국_영업공략_키워드_체크리스트.xlsx'
    try:
        wb.save(out_path)
        print(f"SUCCESS: {out_path}")
    except PermissionError:
        print(f"NOTICE: {out_path} is currently open in Excel. Saved to {out_path_done} instead.")

if __name__ == '__main__':
    build_checklist()
