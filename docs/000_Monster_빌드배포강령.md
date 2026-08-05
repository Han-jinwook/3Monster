# 🔱 Monster 하위 프로그램 빌드 및 배포 강령

- **문서 번호**: 3M-DOC-002
- **버전**: v1.0
- **갱신 일시**: 2026-08-05
- **관리 주체**: Monster 총괄 AI (Hub AI)

---

본 문서는 `3Monster` 프로젝트 산하 하위 프로그램들의 로컬 컴파일(PyInstaller 빌드), 패키징(압축), 그리고 깃허브(GitHub Releases) 및 Supabase DB 연동 자동 배포에 대한 절대 지침서입니다. 다음 세션의 AI는 반드시 이 가이드를 읽고 하부 제품들의 빌드 및 배포 작업을 수행하십시오.

---

## 1. N플레이스 타겟 DB 수집기 (Map_DB / N-Place-DB)

### 📂 정보 및 환경 설정
* **로컬 소스 경로**: `d:\N-Place-DB`
* **깃허브 저장소**: `https://github.com/Han-jinwook/n-place-db`
* **인증 및 자격 증명**: `.env` 파일 (루트에 위치, `GITHUB_PAT` 및 `SUPABASE_SERVICE_ROLE_KEY` 내장)
* **버전 제어 파일**: `config.py` 내 `CURRENT_VERSION = "1.1.X"` 변수

### 🛠️ 빌드 및 배포 프로세스 (프로그램별)
1. **버전 수정**: 
   * 배포 전 `config.py` 파일의 `CURRENT_VERSION`을 최신화합니다.
2. **로컬 빌드**:
   * **`build.bat`** 파일을 실행합니다.
   * `build_exe.py`가 작동하며 `config.py`의 `BUILD_TYPE`을 런타임에 동적으로 변경하여 `dist\Map_DB-PRO` 및 `dist\Map_DB-TRIAL`을 순차적으로 PyInstaller 컴파일합니다.
3. **배포 및 업로드 (자동화)**:
   * 터미널에서 **`python deploy_ota.py`** 명령을 실행합니다.
   * 이 스크립트는 릴리즈 호환성 및 업데이터 연동을 위해 **5종의 ZIP 패키지**를 자동 압축 및 업로드하고 Supabase를 동기화합니다:
     1. `Map_DB-Pro-v{Version}.zip` (버전 정보가 포함된 정식판 패키지)
     2. `Map_DB-Trial-v{Version}.zip` (버전 정보가 포함된 체험판 패키지)
     3. `Map_DB-Pro.zip` (구버전 호환용 정적 정식판 패키지)
     4. `Map_DB-Trial.zip` (구버전 호환용 정적 체험판 패키지)
     5. `NPlace-DB-Trial.zip` (쇼룸 다운로드 링크 전용 패키지)
   * 깃허브 Releases에 태그(`v{Version}`)를 생성하여 위 5개 자산을 업로드하고 Supabase `app_versions` 테이블을 최종 업데이트합니다.

---

## 2. 카페 몬스터 통합본 (CafeScraper / CafeMonster)

### 📂 정보 및 환경 설정
* **로컬 소스 경로**: `d:\CafeScraper`
* **깃허브 저장소**: `https://github.com/Han-jinwook/CafeScraper`
* **인증 및 자격 증명**: `.env` 파일 (N-Place-DB의 토큰을 복사하여 루트에 보관)
* **버전 제어 파일**: `version.txt` (단 한 줄로 버전 기록, 예: `1.3.65`)

### 🛠️ 빌드 및 배포 프로세스 (프로그램별)
1. **버전 수정**: 
   * 배포 전 `version.txt`와 `CHANGELOG.md`를 갱신합니다.
2. **로컬 빌드**:
   * **`build.bat`** 파일을 실행합니다.
   * PyInstaller 컴파일러가 작동하여 `dist\cafescraper_V{Version}` 폴더에 단독 실행형 실행 파일(`CafeScraper.exe`)을 빌드합니다.
3. **패키징 (압축 분리)**:
   * **`package.bat`** 파일을 실행합니다.
   * `scripts\pack_dist.ps1` 스크립트가 실행되어 빌드된 결과물을 기반으로 `mode.txt` 분기 데이터를 동적으로 셋업하고, 프로젝트 루트에 **4종의 최종 배포용 ZIP 파일**을 구성합니다:
     * `CafeCrawler-Pro.zip` (기본 정품 모드)
     * `EventStats-Pro.zip` (기본 정품 모드)
     * `AutoComment-Pro.zip` (기본 정품 모드)
     * `CafeMonster-Trial.zip` (기본 체험판 모드 - **3개 하위 기능의 통합 체험판**)
4. **배포 및 업로드 (자동화)**:
   * 터미널에서 **`python deploy_ota.py`** 명령을 실행합니다.
   * 작성 완료된 4개의 ZIP 파일을 `Han-jinwook/CafeScraper` 깃허브의 버전 태그(`v{Version}`) Releases 페이지에 업로드합니다.
   * 동시에 Supabase `app_versions` 테이블에 `CafeCrawler`, `EventStats`, `AutoComment` 3개 제품군의 최신 버전 정보와 다운로드 URL 링크를 한 번에 갱신하여 OTA 업데이트 시스템을 동기화합니다.

---

## 3. 3Monster 통합 웹 허브 (대시보드 & 쇼룸)

### 📂 정보 및 환경 설정
* **로컬 소스 경로**: `d:\3Monster`
* **깃허브 저장소**: `https://github.com/Han-jinwook/3Monster`

### 🔗 체험판 다운로드 매핑 규칙
하위 제품들의 배포 방식이 단일화됨에 따라 쇼룸 및 어드민 대시보드 내의 Trial 다운로드 경로를 다음과 같이 고정하여 연동해야 합니다.

1. **카페 몬스터 3종 체험판 (카페수집기 / 활동분석기 / 자동댓글러)**:
   * **다운로드 연결 파일**: `CafeMonster-Trial.zip`
   * **쇼룸 코드 ([Showroom.tsx](file:///d:/3Monster/admin-dashboard/src/pages/Showroom.tsx))**:
     ```typescript
     selectedProduct.id === 'cafe-crawler' || selectedProduct.id === 'event-activity-stats' || selectedProduct.id === 'comment-stats'
         ? "https://github.com/Han-jinwook/CafeScraper/releases/latest/download/CafeMonster-Trial.zip"
     ```
   * **어드민 허브 ([LicenseGenerator.tsx](file:///d:/3Monster/admin-dashboard/src/pages/LicenseGenerator.tsx))**:
     ```typescript
     if (type === 'Trial' && (productId === 'CafeCrawler' || productId === 'EventStats' || productId === 'AutoComment')) {
         return `https://github.com/Han-jinwook/CafeScraper/releases/latest/download/CafeMonster-Trial.zip`;
     }
     ```

2. **N플레이스 DB 추출기 체험판**:
   * **다운로드 연결 파일**: `NPlace-DB-Trial.zip` (또는 `Map_DB-Trial.zip`)
   * **쇼룸 코드**:
     ```typescript
     selectedProduct.id === 'nplace-db'
         ? "https://github.com/Han-jinwook/n-place-db/releases/latest/download/NPlace-DB-Trial.zip"
     ```

---
*Updated on 2026-08-05 by Antigravity*
