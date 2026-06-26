create table if not exists public.comments (
    id uuid default gen_random_uuid() primary key,
    author text not null,
    content text not null,
    store_id text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- disable RLS for simplicity as requested by the initial design
alter table public.comments disable row level security;

-- Enable Realtime for all tables
alter publication supabase_realtime add table notices, schedules, shift_swaps, work_logs, comments;
