-- ============================================================
-- 알바시스템 (Alba System) - Supabase 스키마
-- Supabase 대시보드 → SQL Editor에서 실행하세요
-- ============================================================

-- ① users 테이블
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  email text unique,
  password text not null,
  role text not null check (role in ('worker', 'manager', 'boss', 'admin')),
  store_id text check (store_id in ('store1', 'store2', 'both')),
  created_at timestamptz not null default now()
);
alter table public.users disable row level security;
grant all on public.users to anon, authenticated;

-- ② allowed_names 테이블
create table if not exists public.allowed_names (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  role text not null check (role in ('worker', 'manager', 'boss')),
  store_id text not null check (store_id in ('store1', 'store2', 'both')),
  registration_code text not null,
  added_at date not null default current_date
);
alter table public.allowed_names disable row level security;
grant all on public.allowed_names to anon, authenticated;

-- ③ work_logs 테이블
create table if not exists public.work_logs (
  id uuid primary key default gen_random_uuid(),
  user_name text not null,
  date date not null,
  start_time text not null,
  end_time text not null,
  break_duration int not null default 0,
  note text,
  created_at timestamptz not null default now()
);
alter table public.work_logs disable row level security;
grant all on public.work_logs to anon, authenticated;

-- ④ schedules 테이블
create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date date not null,
  start_time text not null,
  end_time text not null,
  store_id text not null check (store_id in ('store1', 'store2'))
);
alter table public.schedules disable row level security;
grant all on public.schedules to anon, authenticated;

-- ⑤ notices 테이블
create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  author text not null,
  store_id text not null default 'all' check (store_id in ('store1', 'store2', 'all')),
  priority text not null default 'normal' check (priority in ('normal', 'important', 'urgent')),
  image_urls text[] default array[]::text[],
  created_at timestamptz not null default now()
);
alter table public.notices disable row level security;
grant all on public.notices to anon, authenticated;

-- ============================================================
-- 샘플 공지사항 데이터 삽입 (포트폴리오용)
-- ============================================================
insert into public.notices (title, content, author, store_id, priority, image_urls, created_at)
values
  ('3월 근무 규정 안내',
   '안녕하세요! 3월부터 변경되는 근무 규정을 안내드립니다.' || chr(10) ||
   '1. 출근 시간: 5분 전까지 도착' || chr(10) ||
   '2. 복장: 회사 유니폼 착용 필수' || chr(10) ||
   '3. 휴게시간: 4시간 이상 근무 시 30분 보장',
   'boss', 'all', 'important', array[]::text[], now() - interval '2 days'),
  ('[연산점] 이번 주 청소 담당 변경',
   '이번 주 수요일 청소 담당이 변경되었습니다.' || chr(10) ||
   '수요일: 김철수 → 이영희' || chr(10) ||
   '담당 변경 내용 꼭 확인해 주세요!',
   'boss', 'store1', 'normal', array[]::text[], now() - interval '1 day'),
  ('[부전점] 냉장고 정리 요청',
   '부전점 냉장고 정리가 필요합니다.' || chr(10) ||
   '유통기한 지난 물품 확인 후 폐기 처리 부탁드립니다.',
   'boss', 'store2', 'normal', array[]::text[], now() - interval '12 hours'),
  ('🚨 긴급 - 카드 단말기 점검',
   '내일 오전 10시~12시 카드 단말기 정기 점검이 예정되어 있습니다.' || chr(10) ||
   '해당 시간 동안 현금 결제만 가능하오니 고객 안내 부탁드립니다.',
   'boss', 'all', 'urgent', array[]::text[], now() - interval '3 hours')
on conflict do nothing;

-- ============================================================
-- Supabase Storage: images 버킷 생성 (공지 이미지 첨부용)
-- Storage 탭이 아닌 SQL로는 직접 생성 불가 → 아래 안내 참고
-- 대시보드 → Storage → New bucket → 이름: images, Public: ON
-- ============================================================
