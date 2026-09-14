-- 🔱 [3Monster] KCP 결제 및 라이선스 자동 발급을 위한 RLS 보안 정책 패치
-- 목적:
-- 1. KCP 결제 완료 후 일반 구매자가 licenses 테이블에 신규 라이선스를 INSERT할 수 있도록 허용
-- 2. 기존 관리자 ALL 정책("Master admin access")은 유지되어 일반 사용자의 타인 라이선스 무단 수정/삭제는 완벽 차단
-- 
-- 실행 방법:
-- 1. https://supabase.com 접속 -> 로그인 -> 프로젝트(suwinftalfgybvrnzruz) 선택
-- 2. 좌측 메뉴 [SQL Editor] 클릭
-- 3. 아래 SQL 스크립트를 전체 복사하여 붙여넣고 우측 하단 [Run] 버튼 실행

-- 1. licenses 테이블에 신규 라이선스 INSERT 정책 추가
DROP POLICY IF EXISTS "Allow insert for new license purchases" ON public.licenses;
CREATE POLICY "Allow insert for new license purchases" ON public.licenses
    FOR INSERT
    WITH CHECK (true);

-- 2. licenses 테이블 조회(SELECT) 정책 보장 (비회원/공개 검증 및 구매자 마이페이지 조회용)
DROP POLICY IF EXISTS "Allow select for licenses" ON public.licenses;
CREATE POLICY "Allow select for licenses" ON public.licenses
    FOR SELECT
    USING (true);

-- 3. 정책 적용 결과 확인
SELECT schemaname, tablename, policyname, cmd, permissive, roles 
FROM pg_policies 
WHERE tablename = 'licenses';
