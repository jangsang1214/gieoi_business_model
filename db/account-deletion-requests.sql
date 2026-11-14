-- prof. account deletion request intake.
-- This does NOT perform deletion. Human-reviewed processing is required because
-- TEAM/opportunity/outcome rows can reference other users or be ON DELETE RESTRICT.
-- Only an authenticated user may submit/read their own request. No client can
-- update status or remove a request.
create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending','processing','completed','rejected')),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
create unique index if not exists account_deletion_requests_one_pending
  on public.account_deletion_requests(user_id)
  where status = 'pending';
alter table public.account_deletion_requests enable row level security;
revoke all on public.account_deletion_requests from public, anon, authenticated;
grant select on public.account_deletion_requests to authenticated;
grant insert (user_id) on public.account_deletion_requests to authenticated;
create policy account_deletion_requests_read_own
  on public.account_deletion_requests
  for select to authenticated
  using (user_id = (select auth.uid()));
create policy account_deletion_requests_request_own
  on public.account_deletion_requests
  for insert to authenticated
  with check (user_id = (select auth.uid())
              and status = 'pending'
              and processed_at is null);
