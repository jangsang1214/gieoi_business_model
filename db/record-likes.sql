-- prof. record reactions. Visibility follows the records RLS policy.
create table if not exists public.record_likes (
  record_id uuid not null references public.records(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(record_id,user_id)
);
create index if not exists record_likes_user_idx on public.record_likes(user_id,created_at desc);
alter table public.record_likes enable row level security;
revoke all on public.record_likes from public,anon,authenticated;
grant select,insert,delete on public.record_likes to authenticated;
create policy record_likes_view_visible on public.record_likes
for select to authenticated
using(exists(select 1 from public.records r where r.id=record_id));
create policy record_likes_insert_self on public.record_likes
for insert to authenticated
with check(user_id=(select auth.uid()) and exists(select 1 from public.records r where r.id=record_id));
create policy record_likes_delete_self on public.record_likes
for delete to authenticated
using(user_id=(select auth.uid()));
