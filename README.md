# 🏪 알바시스템 (Alba System)

> 카페 알바생 및 사장님을 위한 **근무 관리 올인원 플랫폼**  
> 포트폴리오 데모 프로젝트 | [🚀 라이브 데모](https://shift-hub.vercel.app)

---

## 📋 프로젝트 개요

알바시스템(Alba System)은 소규모 카페의 **알바생·사장님·관리자** 3가지 역할을 지원하는 근무 관리 웹 애플리케이션입니다.  
실제 운영 가능한 수준의 Supabase 백엔드 + Vercel 배포 구조를 포트폴리오 목적으로 구현했습니다.

### 지원 점포
- **연산점 (store1)** / **부전점 (store2)** / **양쪽 모두 (both)**

---

## ✨ 주요 기능

### 👷 알바생 (Worker)
| 기능 | 설명 |
|------|------|
| 근무 일지 | 출퇴근 시간·휴게시간 입력 및 일별 근무 기록 관리 |
| 근무 일정 | 주간 표 보기 / 월간 달력 보기 전환 |
| 급여 계산 | 시급·근무시간 기반 예상 급여 자동 계산 |
| 공지사항 | 사장님이 올린 공지 확인 (이미지 포함) |
| 설정 | 비밀번호 변경, 다크모드 설정 |

### 👑 사장님 (Boss) / 🔧 관리자 (Admin)
| 기능 | 설명 |
|------|------|
| 허용이름 관리 | 직원 등록 화이트리스트 관리, 개인 인증코드 발급/재발급 |
| 비밀번호 초기화 | 가입된 직원의 비밀번호를 "1234"로 초기화 |
| 공지사항 작성 | 우선순위·대상 점포 설정, 이미지 최대 6장 업로드 |
| 근무 일정 업로드 | CSV 파일로 전체 직원 스케줄 일괄 등록 |
| 데이터 내보내기 | 기간별 직원 근무 일지 ZIP(CSV) 다운로드 |
| 실시간 동기화 | 공지·스케줄 변경 시 모든 접속자 화면 자동 갱신 |

---

## 🔐 인증 및 보안 시스템

### 가입 흐름
```
사장님이 허용이름 등록 → 개인 인증코드 발급
→ 직원이 인증코드로 회원가입 → 비밀번호 설정 (bcrypt 해싱 저장)
→ 이름 + 비밀번호로 로그인
```

### 비밀번호 보안 (bcrypt)
- 회원가입 시 비밀번호는 **bcrypt(rounds=10)** 로 해싱 후 저장
- 로그인 시 `bcrypt.compare()`로 해시 비교 (원본 복원 불가)
- 비밀번호 변경 시 새 비밀번호도 bcrypt 해싱 후 저장
- 비밀번호 초기화("1234")도 해싱 후 저장
- **자동 마이그레이션**: 기존 평문 비밀번호 계정은 다음 로그인 시 자동으로 bcrypt 업그레이드 (재가입 불필요)

### 역할별 접근 권한
| 역할 | 대시보드 | 근무일지 | 공지작성 | 허용이름관리 | 데이터 내보내기 |
|------|:---:|:---:|:---:|:---:|:---:|
| worker | ✅ | ✅ | ❌ | ❌ | ❌ |
| boss | ✅ | ❌ | ✅ | ✅ | ✅ |
| admin | ✅ | ❌ | ✅ | ✅ | ✅ |

---

## 🎭 포트폴리오 테스트 계정

> **Supabase DB에 저장되지 않는 하드코딩 데모 계정입니다.**

| 계정 | 비밀번호 | 역할 | 소속 |
|------|----------|------|------|
| `admin` | `admin` | 관리자 | 양쪽 |
| `boss` | `boss` | 사장님 | 양쪽 |
| `yeonsan` | `yeonsan` | 알바생 | 연산점 |
| `bujeon` | `bujeon` | 알바생 | 부전점 |
| `dual` | `dual` | 알바생 | 양쪽 |

### ⚠️ 데모 계정 제한 사항

**데이터 내보내기 기능은 데모 계정(admin, boss, yeonsan 등)에서 작동하지 않습니다.**

**이유**: 데모 계정은 Supabase `users` 테이블에 실제 데이터로 존재하지 않는 하드코딩 계정입니다.  
데이터 내보내기는 DB의 `work_logs` 테이블에서 직원 이름으로 실제 근무 기록을 조회하는데,  
데모 계정으로 입력된 근무 일지가 없으면 빈 ZIP 파일이 생성됩니다.

**정상 테스트 방법**:
1. `boss` 계정으로 로그인 → 허용이름 관리에서 실제 직원 등록 (인증코드 발급)
2. 직원이 인증코드로 회원가입 → 근무 일지 입력
3. `boss` 계정 → 데이터 내보내기로 CSV/ZIP 다운로드

---

## 🛠 기술 스택

| 분류 | 기술 |
|------|------|
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS v3 |
| **Routing** | React Router v7 |
| **Backend** | Supabase (PostgreSQL + REST API + Realtime) |
| **Storage** | Supabase Storage (공지 이미지) |
| **인증 보안** | bcryptjs (비밀번호 해싱) |
| **파일 처리** | JSZip (근무데이터 ZIP 내보내기), XLSX |
| **배포** | Vercel (자동 CI/CD, GitHub 연동) |

---

## 🗄 데이터베이스 스키마

```sql
-- 사용자 (실제 가입 계정, 비밀번호는 bcrypt 해시로 저장)
users: id, name, password(bcrypt), role, store_id, created_at

-- 허용 이름 목록 (회원가입 화이트리스트)
allowed_names: id, name, role, store_id, registration_code, added_at

-- 근무 일지
work_logs: id, user_name, date, start_time, end_time, break_duration, note, created_at

-- 근무 일정 (CSV 업로드)
schedules: id, name, date, start_time, end_time, store_id

-- 공지사항
notices: id, title, content, author, store_id, priority, image_urls, created_at
```

> RLS(Row Level Security)는 포트폴리오 데모 목적으로 비활성화되어 있습니다.

---

## 🚀 로컬 실행

### 1. 레포지토리 클론
```bash
git clone https://github.com/jinbark1229/alba-system-main.git
cd alba-system-main
```

### 2. 환경 변수 설정
```bash
# .env 파일 생성
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 의존성 설치 및 개발 서버 실행
```bash
npm install
npm run dev
```

### 4. Supabase 스키마 설정
Supabase 대시보드 → SQL Editor에서 `supabase_schema.sql` 실행

---

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── layout/               # Sidebar, MobileNav, MainLayout
│   ├── NoticeBoard.tsx       # 공지사항 (작성/조회/삭제 + Realtime)
│   ├── ScheduleCalendar.tsx  # 달력 뷰 (Supabase Realtime)
│   └── ScheduleTableView.tsx # 주간 표 뷰 (Supabase Realtime)
├── context/
│   └── AuthContext.tsx       # 전역 인증 상태 (로그인·권한·비밀번호·bcrypt)
├── pages/
│   ├── Login.tsx             # 로그인 (Supabase 직접 쿼리 + bcrypt 비교)
│   ├── Register.tsx          # 인증코드 기반 회원가입 (bcrypt 해싱)
│   ├── DailyLog.tsx          # 근무 일지 입력
│   ├── SchedulePage.tsx      # 근무 일정 뷰
│   ├── SalaryPage.tsx        # 급여 계산
│   ├── NoticePage.tsx        # 공지사항 페이지
│   ├── AdminExportPage.tsx   # 데이터 내보내기 (JSZip)
│   ├── AllowedNamesManagement.tsx  # 허용이름 관리 + 비밀번호 초기화
│   ├── MainPage.tsx          # 홈 대시보드
│   └── SettingsPage.tsx      # 설정 (비밀번호 변경·다크모드)
├── services/
│   └── api.ts                # Supabase API 함수 모음
└── lib/
    └── supabase.ts           # Supabase 클라이언트 초기화
```

---

## 🔄 주요 구현 및 해결 사항

### 인증 & 보안
| 항목 | 내용 |
|------|------|
| **bcrypt 비밀번호 해싱** | 회원가입·비밀번호 변경·초기화 시 bcrypt(rounds=10) 적용 |
| **자동 마이그레이션** | 기존 평문 비밀번호 계정은 다음 로그인 시 자동 bcrypt 업그레이드 |
| **Supabase 직접 쿼리** | 로그인·비밀번호 변경을 인메모리 배열이 아닌 DB 직접 조회로 수정 |
| **삭제된 유저 차단** | 로그인 시 `allowed_names` 테이블 실시간 확인으로 즉시 차단 |
| **인증 로딩 버그** | `isLoading` 처리로 인증 초기화 중 간헐적 접근 거부 현상 해결 |

### 사용자 관리
| 항목 | 내용 |
|------|------|
| **허용이름 관리 통합** | 불필요한 "사용자 관리" 페이지 제거, 허용이름 관리로 통합 |
| **인증코드 기반 가입** | 외부인 무단 가입 방지를 위한 개인 인증코드 화이트리스트 시스템 |
| **비밀번호 초기화** | 사장님/관리자가 허용이름 관리 페이지에서 직원 비밀번호를 "1234"로 초기화 |
| **동일 비밀번호 방지** | 현재와 같은 비밀번호로 변경 시도 시 안내 메시지 출력 |

### 실시간 동기화
| 항목 | 내용 |
|------|------|
| **공지사항 Realtime** | Supabase Realtime으로 공지 생성·삭제 시 즉시 화면 반영 |
| **스케줄 Realtime** | 표 보기·달력 보기 모두 Supabase Realtime 적용 |

### 데이터 처리
| 항목 | 내용 |
|------|------|
| **데이터 내보내기** | JSZip을 사용해 직원별 CSV를 하나의 ZIP 파일로 패키징 다운로드 |
| **이메일 기능 제거** | 이름만으로 로그인·회원가입하도록 단순화 |

---

## 📸 스크린샷

라이브 데모에서 확인: [shift-hub.vercel.app](https://shift-hub.vercel.app)

| 페이지 | URL |
|--------|-----|
| 로그인 | `/login` |
| 회원가입 | `/register` |
| 홈 대시보드 | `/` |
| 근무 일지 | `/daily-log` |
| 근무 일정 | `/schedule` |
| 급여 계산 | `/salary` |
| 공지사항 | `/notices` |
| 허용이름 관리 | `/admin/allowed-names` |
| 데이터 내보내기 | `/admin/export` |

---

> **개발**: 포트폴리오 목적 프로젝트 | **배포**: [shift-hub.vercel.app](https://shift-hub.vercel.app)  
> **기술 문의**: GitHub Issues