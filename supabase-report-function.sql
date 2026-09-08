create or replace function public.get_click_report()
returns table (
  event_type text,
  community text,
  latest_count bigint,
  total_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    e.event_type,
    e.community,
    count(*) filter (where e.created_at >= now() - interval '12 hours') as latest_count,
    count(*) as total_count
  from public.click_events e
  group by e.event_type, e.community;
$$;

revoke all on function public.get_click_report() from public;
grant execute on function public.get_click_report() to anon;