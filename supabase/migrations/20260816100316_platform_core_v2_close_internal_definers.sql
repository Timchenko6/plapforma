-- TIMCHENKO PLATFORM Core v2.3
-- Close the last internal SECURITY DEFINER functions inherited by anon/PUBLIC.

revoke execute on function public.recalc_estimate_totals_v2(bigint)
  from public, anon, authenticated;
grant execute on function public.recalc_estimate_totals_v2(bigint)
  to service_role;

revoke execute on function public.recalculate_project_paid_amount()
  from public, anon, authenticated;
grant execute on function public.recalculate_project_paid_amount()
  to service_role;

revoke execute on function public.sync_auth_user_to_app_user()
  from public, anon, authenticated;
grant execute on function public.sync_auth_user_to_app_user()
  to service_role;
