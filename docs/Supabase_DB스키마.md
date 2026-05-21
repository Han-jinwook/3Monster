# 🗄 Supabase 전역 DB 스키마 명세서

- **문서 번호**: 3M-DOC-002
- **버전**: v1.0
- **갱신 일시**: 2026-05-18
- **관리 주체**: Monster 총괄 AI (Hub AI)

---

본 문서는 3Monster 프로젝트의 전역 라이선스 및 버전 관리를 위한 클라우드 데이터베이스(Supabase)의 구조를 정의합니다. 모든 개별 앱의 연동 라이브러리는 본 스키마를 최종 권위로 참조합니다.

## 1. 데이터베이스 개요
- **플랫폼**: Supabase Cloud DB
- **종류**: PostgreSQL
- **용도**: 라이선스 인증, 기기 바인딩(HWID), 앱 최신 버전 갱신 관리

## 2. 테이블 상세 명세

### [테이블명: licenses]
- **목적**: 전역 라이선스 정보, PC 기기 바인딩(HWID) 상태, 만료 상태 및 사용자 속성 관리.
- **테이블 구조**:

| 컬럼명 | 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| **serial_key** | TEXT | PRIMARY KEY | 라이선스 고유 시리얼 키 (예: `CM-XXXX-XXXX-XXXX` 또는 `TEST-XXXX-XXXX`) |
| **bound_value** | TEXT | NULLABLE | 최초 등록 또는 바인딩된 PC의 HWID |
| **status** | TEXT | DEFAULT 'unused' | 키 상태 (`active`, `used`, `unused`, `blocked`, `expired`) |
| **expire_date** | TIMESTAMPTZ | - | 라이선스 만료 일시 (ISO 8601) |
| **collection_limit**| INTEGER | NULLABLE | 1회/기간 내 최대 수집 제한 건수 (체험판/테스트 키용) |
| **product_id** | TEXT | - | 적용 대상 제품 식별자 (예: `NPlace-DB`, `CafeCrawler`) |
| **buyer_name** | TEXT | NULLABLE | 구매자 성함 또는 상호명 |
| **contact** | TEXT | NULLABLE | 구매자 연락처 |
| **price_sold** | NUMERIC | DEFAULT 0 | 실제 판매 가격 |
| **memo** | TEXT | NULLABLE | 특이사항 기록용 메모 |
| **created_at** | TIMESTAMPTZ | DEFAULT now() | 발행 일시 |

---

### [테이블명: app_versions]
- **목적**: 3Monster 계열 앱들의 버전 정보 및 바이너리 다운로드 경로 관리 (자동 업데이트용).
- **테이블 구조**:

| 컬럼명 | 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| **id** | BIGINT | PRIMARY KEY (Identity)| 버전 등록 고유 번호 |
| **product_id** | TEXT | - | 해당 제품 식별자 (예: `NPlace-DB`, `CafeCrawler`) |
| **version** | TEXT | - | 버전 명칭 (예: `1.0.0`, `1.0.1`) |
| **download_url** | TEXT | - | 바이너리 파일 다운로드 경로 (Supabase Storage 또는 CDN 주소) |
| **release_notes** | TEXT | NULLABLE | 이번 업데이트의 패치 노트 내용 |
| **created_at** | TIMESTAMPTZ | DEFAULT now() | 버전 배포 일시 |

---
*Since 2026-05-18 by Monster*
