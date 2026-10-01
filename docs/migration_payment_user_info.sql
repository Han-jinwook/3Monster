-- 🔱 [3Monster] 무통장 입금자명 및 증빙 정보 자동 저장을 위한 컬럼 추가 및 권한 설정
-- 목적:
-- 1. users 테이블에 무통장 입금자명(depositor_name), 증빙유형(receipt_type), 증빙번호(receipt_number) 컬럼 추가
-- 2. 사용자가 무통장 입금 시 입력한 정보를 DB에 킵(저장)했다가 다음 결제 시 자동 완성을 통해 즉시 수정/사용 가능하도록 지원
--
-- 실행 방법:
-- 1. https://supabase.com 접속 -> 로그인 -> 프로젝트 선택
-- 2. 좌측 메뉴 [SQL Editor] 클릭 -> [New query]
-- 3. 아래 SQL 스크립트를 전체 복사하여 붙여넣고 우측 하단 [Run] 클릭

-- 1. users 테이블에 입금자명 및 증빙 관련 컬럼 추가
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS depositor_name TEXT;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS receipt_type TEXT DEFAULT 'tax_invoice';

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS receipt_number TEXT;

-- 2. 컬럼 코멘트 등록 (가독성 및 유지보수용)
COMMENT ON COLUMN public.users.depositor_name IS '무통장 입금 시 사용한 최근 입금자명';
COMMENT ON COLUMN public.users.receipt_type IS '최근 선택한 증빙서류 유형 (tax_invoice, cash_receipt, none)';
COMMENT ON COLUMN public.users.receipt_number IS '최근 입력한 증빙 발급용 사업자등록번호 또는 휴대폰번호';

-- 3. 결제 시 본인 계정 정보 갱신(UPDATE) 허용 정책 보장
DROP POLICY IF EXISTS "Allow update user payment info" ON public.users;
CREATE POLICY "Allow update user payment info" ON public.users
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 4. 정상 추가 여부 확인 쿼리
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('depositor_name', 'receipt_type', 'receipt_number');
