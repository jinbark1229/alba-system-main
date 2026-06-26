-- ⑥ shift_swaps 테이블
create table if not exists public.shift_swaps (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid references public.schedules(id) on delete cascade,
  requester_name text not null,
  acceptor_name text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.shift_swaps disable row level security;
grant all on public.shift_swaps to anon, authenticated;
