-- 🔱 Supabase RLS 정책 익명 로그인(Anonymous Auth) 호환성 패치
-- - 목적: email이 비어 있는 익명 로그인 세션에서도 public.users 테이블의 UID 매핑을 추적하여 권한을 판별하도록 수정

-- 1. licenses 테이블 정책 재정의
DROP POLICY IF EXISTS "Master admin access" ON public.licenses;
CREATE POLICY "Master admin access" ON public.licenses
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.uid = auth.uid() AND users.role = 'admin'
        )
    );

-- 2. support_tickets 조회 정책 재정의
DROP POLICY IF EXISTS "Enable read for owners and admins" ON public.support_tickets;
CREATE POLICY "Enable read for owners and admins" ON public.support_tickets
    FOR SELECT
    USING (
        auth.uid() = uid 
        OR email IN (SELECT email FROM public.users WHERE users.uid = auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.uid = auth.uid() AND users.role = 'admin'
        )
    );

-- 3. support_tickets 수정 정책 재정의
DROP POLICY IF EXISTS "Enable update for owners and admins" ON public.support_tickets;
CREATE POLICY "Enable update for owners and admins" ON public.support_tickets
    FOR UPDATE
    USING (
        auth.uid() = uid 
        OR email IN (SELECT email FROM public.users WHERE users.uid = auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.uid = auth.uid() AND users.role = 'admin'
        )
    );

-- 4. notifications 쓰기 정책 재정의
DROP POLICY IF EXISTS "Allow write access to notifications for admins" ON public.notifications;
CREATE POLICY "Allow write access to notifications for admins" ON public.notifications
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.uid = auth.uid() AND users.role = 'admin'
        )
    );
