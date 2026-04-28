-- DeskCare — log_completed_session RPC + Storage buckets for video.

-- ============================
-- log_completed_session RPC (atomic)
-- ============================

create or replace function public.log_completed_session(
  p_session_type   text,
  p_duration_sec   integer,
  p_exercises_total integer,
  p_exercises_completed integer,
  p_exercises_skipped integer default 0
) returns table (
  o_current_streak integer,
  o_longest_streak integer,
  o_last_activity_date date,
  o_total_sessions   integer,
  o_total_minutes    integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_today   date := (now() at time zone 'utc')::date;
  v_minutes integer := greatest(0, round(p_duration_sec / 60.0));
  v_started timestamptz := now() - make_interval(secs => p_duration_sec);
begin
  if v_user_id is null then
    raise exception 'log_completed_session: anonymous calls not allowed';
  end if;

  insert into public.sessions (
    user_id, session_type, started_at, completed_at, duration_seconds,
    exercises_total, exercises_completed, exercises_skipped
  ) values (
    v_user_id, p_session_type, v_started, now(), p_duration_sec,
    p_exercises_total, p_exercises_completed, p_exercises_skipped
  );

  return query
  with prev as (
    select s.current_streak as p_curr,
           s.longest_streak as p_long,
           s.last_activity_date as p_last,
           s.total_sessions as p_sessions,
           s.total_minutes as p_minutes
    from public.streaks s
    where s.user_id = v_user_id
    for update
  ),
  next_streak as (
    select
      case
        when (select p_last from prev) is null then 1
        when (select p_last from prev) = v_today then (select p_curr from prev)
        when (select p_last from prev) = v_today - 1 then (select p_curr from prev) + 1
        else 1
      end::integer as ns
  ),
  upsert as (
    insert into public.streaks (
      user_id, current_streak, longest_streak, last_activity_date,
      total_sessions, total_minutes
    )
    values (
      v_user_id,
      coalesce((select ns from next_streak), 1),
      coalesce((select ns from next_streak), 1),
      v_today,
      1,
      v_minutes
    )
    on conflict (user_id) do update
    set
      current_streak     = (select ns from next_streak),
      longest_streak     = greatest(public.streaks.longest_streak, (select ns from next_streak)),
      last_activity_date = v_today,
      total_sessions     = public.streaks.total_sessions + 1,
      total_minutes      = public.streaks.total_minutes + v_minutes,
      updated_at         = now()
    returning
      streaks.current_streak,
      streaks.longest_streak,
      streaks.last_activity_date,
      streaks.total_sessions,
      streaks.total_minutes
  )
  select * from upsert;
end;
$$;

-- ============================
-- Storage buckets
-- ============================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('exercise-videos',     'exercise-videos',     true, 50 * 1024 * 1024, array['video/mp4','video/quicktime']),
  ('exercise-thumbnails', 'exercise-thumbnails', true,  5 * 1024 * 1024, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "exercise_videos_anon_read"    on storage.objects;
drop policy if exists "exercise_thumbs_anon_read"    on storage.objects;
create policy "exercise_videos_anon_read"
  on storage.objects for select
  using (bucket_id = 'exercise-videos');
create policy "exercise_thumbs_anon_read"
  on storage.objects for select
  using (bucket_id = 'exercise-thumbnails');

drop policy if exists "exercise_videos_service_write" on storage.objects;
drop policy if exists "exercise_thumbs_service_write" on storage.objects;
create policy "exercise_videos_service_write"
  on storage.objects for all
  to service_role
  using (bucket_id = 'exercise-videos')
  with check (bucket_id = 'exercise-videos');
create policy "exercise_thumbs_service_write"
  on storage.objects for all
  to service_role
  using (bucket_id = 'exercise-thumbnails')
  with check (bucket_id = 'exercise-thumbnails');
