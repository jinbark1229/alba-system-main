# 🛠 기술 스택 정리 — 알바시스템 (Alba System)

---

## 1. Frontend Framework

### React 19
- **용도**: 전체 UI 구성
- **적용 내용**
  - 함수형 컴포넌트 + Hooks (`useState`, `useEffect`, `useContext`, `lazy`, `Suspense`)
  - **`React.lazy()` + `Suspense`**: 페이지 단위 코드 스플리팅 — 방문한 페이지만 JS 번들을 로드해 초기 로딩 속도 개선
  - **Context API**: `AuthContext`로 로그인 상태, 사용자 정보, 인증 함수를 전역 공유

### TypeScript
- **용도**: 전체 코드 정적 타입 검사
- **적용 내용**
  - DB 테이블 타입 (`DbUser`, `DbWorkLog`, `DbSchedule`, `DbNotice`, `DbAllowedName`)
  - API 응답 및 컴포넌트 Props의 명시적 타입 정의
  - `tsc -b` 빌드 성공 여부로 Vercel 배포 가능 여부 확인

---

## 2. Build & Dev Tools

### Vite 7
- **용도**: 번들러 및 개발 서버
- **적용 내용**
  - `npm run dev`로 HMR(Hot Module Replacement) 지원 개발 환경
  - `React.lazy()` 동적 import를 자동으로 청크 분리
  - `build.chunkSizeWarningLimit` 설정으로 빌드 경고 억제

### ESLint
- **용도**: 코드 품질 규칙 적용
- **적용 내용**
  - `eslint-plugin-react-hooks`: Hooks 규칙 검사
  - `eslint-plugin-react-refresh`: 개발 중 새로고침 안전성 검사

---

## 3. Styling

### Tailwind CSS v3
- **용도**: 유틸리티 클래스 기반 스타일링
- **적용 내용**
  - **다크모드**: `dark:` 접두사로 라이트/다크 테마 전환 (`class` 전략)
  - **반응형 레이아웃**: `sm:`, `md:`, `lg:` 브레이크포인트로 모바일/데스크톱 대응
  - HSL 기반 커스텀 컬러 팔레트 (`primary`, `background-light`, `background-dark`)
  - `animate-spin` 등 내장 애니메이션 활용

### Google Material Symbols
- **용도**: 아이콘
- **적용 내용**: `material-symbols-outlined` 클래스로 SVG 아이콘 인라인 렌더링 (CDN 로드)

---

## 4. Routing

### React Router v7
- **용도**: 클라이언트 사이드 SPA 라우팅
- **적용 내용**
  - `BrowserRouter` + `Routes` + `Route` 구조
  - **`ProtectedRoute`** 커스텀 컴포넌트: 미로그인 시 `/login` 리다이렉트, 권한 없는 역할 시 `/` 리다이렉트
  - `vercel.json` rewrites 설정으로 새로고침 시 404 방지 (`/* → /index.html`)

---

## 5. Backend / Database

### Supabase (PostgreSQL)
- **용도**: 메인 데이터베이스 및 백엔드
- **적용 내용**

| 테이블 | 용도 |
|--------|------|
| `users` | 회원 계정 (이름, bcrypt 해시 비밀번호, 역할, 소속 매장) |
| `allowed_names` | 회원가입 화이트리스트 (개인 인증코드 포함) |
| `work_logs` | 알바생 근무 일지 (날짜, 출퇴근 시간, 휴게시간, 메모) |
| `schedules` | 근무 일정 (CSV 업로드로 관리) |
| `notices` | 공지사항 (우선순위, 대상 매장, 이미지 URL 배열) |

- **Supabase Client**: `@supabase/supabase-js` v2 — REST API 직접 쿼리
- **Realtime**: `supabase.channel().on('postgres_changes')` 구독으로 notices·schedules 실시간 동기화
- **Storage**: `supabase.storage` 버킷에 공지 이미지 업로드, 공개 URL 발급

---

## 6. 보안

### bcryptjs
- **용도**: 비밀번호 단방향 해싱
- **적용 내용**
  - `bcrypt.hash(password, 10)`: 회원가입·비밀번호 변경·초기화 시 저장 전 해싱 (솔트 라운드 10)
  - `bcrypt.compare(input, hash)`: 로그인·비밀번호 변경 시 원본 복원 없이 검증
  - **자동 마이그레이션**: 기존 평문 비밀번호 계정은 다음 로그인 시 bcrypt로 자동 업그레이드

### 인증 흐름
- **화이트리스트 방식**: `allowed_names` 테이블에 등록된 이름 + 개인 인증코드를 가진 사람만 회원가입 가능
- **역할 기반 접근 제어(RBAC)**: `worker` / `boss` / `admin` 3단계 역할, 라우트와 UI 모두 권한 분기
- **로그인 검증**: 인메모리 캐시가 아닌 Supabase를 직접 쿼리해 항상 최신 상태 확인
- **데모 계정 분리**: 하드코딩 데모 계정(admin, boss 등)은 DB 조회 없이 별도 분기 처리

---

## 7. 파일 처리

### JSZip
- **용도**: 데이터 내보내기 — 직원별 CSV를 하나의 ZIP으로 패키징
- **적용 내용**
  - `await import('jszip')` 동적 임포트 (사용할 때만 로드)
  - 직원별 `.csv` 파일을 ZIP에 추가 후 `Blob`으로 다운로드

### XLSX
- **용도**: CSV 파일 파싱 (근무 일정 업로드)
- **적용 내용**: `ScheduleUpload` 컴포넌트에서 CSV 파일을 파싱해 Supabase `schedules` 테이블에 일괄 삽입

### FileReader API (Web API)
- **용도**: CSV 파일 텍스트 읽기
- **적용 내용**: `reader.readAsText(file)`으로 CSV 내용을 문자열로 파싱

### Promise.all
- **용도**: 이미지 다중 업로드 병렬 처리
- **적용 내용**: `uploadImages(files)` 에서 `Promise.all(files.map(uploadImage))` — 이미지를 순차가 아닌 병렬 업로드

---

## 8. 배포 (CI/CD)

### Vercel
- **용도**: 프론트엔드 호스팅 및 자동 배포
- **적용 내용**
  - GitHub 메인 브랜치 push → Vercel 자동 빌드 (`tsc -b && vite build`)
  - `vercel.json` `rewrites` 설정으로 SPA 새로고침 라우팅 지원
  - `.env` 환경변수 (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) Vercel 대시보드 관리

### GitHub
- **용도**: 소스 코드 버전 관리
- **배포 사이트**: [shift-hub.vercel.app](https://shift-hub.vercel.app)

---

## 9. 개발 패턴 & 설계

| 패턴 | 설명 |
|------|------|
| **Context + Custom Hook** | `AuthContext` + `useAuth` 훅으로 인증 상태 캡슐화 |
| **코드 스플리팅** | `React.lazy` + `Suspense`로 라우트별 지연 로딩 |
| **Optimistic UI** | Realtime 수신 시 상태 직접 업데이트로 즉각 반영 |
| **Transparent Migration** | 평문 → bcrypt 전환 시 재가입 없이 자동 업그레이드 |
| **역할 기반 라우팅** | `ProtectedRoute` HOC 패턴 |
| **DB 직접 쿼리** | 캐시 없이 Supabase REST API를 직접 호출해 항상 최신 데이터 보장 |

---

> **라이브 데모**: [shift-hub.vercel.app](https://shift-hub.vercel.app)  
> **GitHub**: [jinbark1229/alba-system-main](https://github.com/jinbark1229/alba-system-main)
