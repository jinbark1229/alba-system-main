-- ⑦ allowed_names 테이블에 시급(hourly_wage) 추가
alter table public.allowed_names add column if not exists hourly_wage int not null default 9860;
