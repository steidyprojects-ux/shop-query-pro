-- Revoke execute on has_role from anonymous users
revoke execute on function public.has_role(uuid, app_role) from anon;

-- Set search_path on the updated_at trigger function
alter function public.set_updated_at() set search_path = public;
