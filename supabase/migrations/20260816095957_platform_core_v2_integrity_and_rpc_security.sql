-- TIMCHENKO PLATFORM Core v2.1
-- Cross-project integrity and evidence-based RPC privilege hardening.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.enforce_platform_core_v2_scope()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_data jsonb := to_jsonb(new);
  v_project_id uuid := nullif(row_data ->> 'project_id', '')::uuid;
  v_organization_id uuid := nullif(row_data ->> 'organization_id', '')::uuid;
  v_zone_id uuid := nullif(row_data ->> 'zone_id', '')::uuid;
  v_system_id uuid := nullif(row_data ->> 'system_id', '')::uuid;
  v_node_id uuid := nullif(row_data ->> 'node_id', '')::uuid;
  v_work_id uuid := nullif(row_data ->> 'work_id', '')::uuid;
  v_project_organization_id uuid;
  v_purchase_order_id uuid;
  v_estimate_id bigint;
begin
  if tg_table_name = 'purchase_items' then
    v_purchase_order_id := nullif(row_data ->> 'purchase_order_id', '')::uuid;
    select po.project_id, po.organization_id
      into v_project_id, v_organization_id
    from public.purchase_orders po
    where po.id = v_purchase_order_id;

    if v_project_id is null then
      raise exception using errcode = '23503', message = 'purchase_order_id does not reference an accessible purchase order';
    end if;
  elsif tg_table_name = 'estimate_items' then
    v_estimate_id := nullif(row_data ->> 'estimate_id', '')::bigint;

    if (v_work_id is not null or nullif(row_data ->> 'project_material_id', '') is not null)
       and v_estimate_id is null then
      raise exception using errcode = '23514', message = 'Core v2 links require estimate_id';
    end if;

    if v_estimate_id is not null then
      select e.project_id, e.organization_id
        into v_project_id, v_organization_id
      from public.estimates e
      where e.id = v_estimate_id;
    end if;
  elsif tg_table_name = 'projects' then
    v_project_id := new.id;
    v_project_organization_id := new.organization_id;
  end if;

  if v_project_id is not null and tg_table_name <> 'projects' then
    select p.organization_id
      into v_project_organization_id
    from public.projects p
    where p.id = v_project_id;

    if v_project_organization_id is null then
      raise exception using errcode = '23503', message = 'project_id does not reference a project with an organization';
    end if;

    if v_organization_id is not null and v_organization_id is distinct from v_project_organization_id then
      raise exception using errcode = '23514', message = 'organization_id must match the project organization';
    end if;
  end if;

  if v_zone_id is not null and not exists (
    select 1 from public.zones z
    where z.id = v_zone_id
      and z.project_id = v_project_id
      and (v_organization_id is null or z.organization_id = v_organization_id)
  ) then
    raise exception using errcode = '23514', message = 'zone_id must belong to the same project and organization';
  end if;

  if v_system_id is not null and not exists (
    select 1 from public.systems s
    where s.id = v_system_id
      and s.project_id = v_project_id
      and (v_organization_id is null or s.organization_id = v_organization_id)
  ) then
    raise exception using errcode = '23514', message = 'system_id must belong to the same project and organization';
  end if;

  if v_node_id is not null and not exists (
    select 1 from public.nodes n
    where n.id = v_node_id
      and n.project_id = v_project_id
      and (v_organization_id is null or n.organization_id = v_organization_id)
  ) then
    raise exception using errcode = '23514', message = 'node_id must belong to the same project and organization';
  end if;

  if v_work_id is not null and not exists (
    select 1 from public.works w
    where w.id = v_work_id
      and w.project_id = v_project_id
      and (v_organization_id is null or w.organization_id = v_organization_id)
  ) then
    raise exception using errcode = '23514', message = 'work_id must belong to the same project and organization';
  end if;

  if nullif(row_data ->> 'client_id', '') is not null and not exists (
    select 1 from public.clients c
    where c.id = (row_data ->> 'client_id')::uuid
      and c.organization_id = v_project_organization_id
  ) then
    raise exception using errcode = '23514', message = 'client_id must belong to the project organization';
  end if;

  if nullif(row_data ->> 'parent_zone_id', '') is not null and not exists (
    select 1 from public.zones z
    where z.id = (row_data ->> 'parent_zone_id')::uuid
      and z.project_id = v_project_id
      and z.organization_id = v_organization_id
  ) then
    raise exception using errcode = '23514', message = 'parent_zone_id must belong to the same project and organization';
  end if;

  if nullif(row_data ->> 'parent_system_id', '') is not null and not exists (
    select 1 from public.systems s
    where s.id = (row_data ->> 'parent_system_id')::uuid
      and s.project_id = v_project_id
      and s.organization_id = v_organization_id
  ) then
    raise exception using errcode = '23514', message = 'parent_system_id must belong to the same project and organization';
  end if;

  if nullif(row_data ->> 'parent_node_id', '') is not null and not exists (
    select 1 from public.nodes n
    where n.id = (row_data ->> 'parent_node_id')::uuid
      and n.project_id = v_project_id
      and n.organization_id = v_organization_id
  ) then
    raise exception using errcode = '23514', message = 'parent_node_id must belong to the same project and organization';
  end if;

  if nullif(row_data ->> 'parent_work_id', '') is not null and not exists (
    select 1 from public.works w
    where w.id = (row_data ->> 'parent_work_id')::uuid
      and w.project_id = v_project_id
      and w.organization_id = v_organization_id
  ) then
    raise exception using errcode = '23514', message = 'parent_work_id must belong to the same project and organization';
  end if;

  if nullif(row_data ->> 'stage_id', '') is not null and not exists (
    select 1 from public.project_stages ps
    where ps.id = (row_data ->> 'stage_id')::uuid
      and ps.project_id = v_project_id
  ) then
    raise exception using errcode = '23514', message = 'stage_id must belong to the same project';
  end if;

  if nullif(row_data ->> 'project_material_id', '') is not null and not exists (
    select 1 from public.project_materials pm
    where pm.id = (row_data ->> 'project_material_id')::uuid
      and pm.project_id = v_project_id
      and (v_organization_id is null or pm.organization_id = v_organization_id)
  ) then
    raise exception using errcode = '23514', message = 'project_material_id must belong to the same project and organization';
  end if;

  if nullif(row_data ->> 'material_request_id', '') is not null and not exists (
    select 1 from public.material_requests mr
    where mr.id = (row_data ->> 'material_request_id')::uuid
      and mr.project_id = v_project_id
      and mr.organization_id = v_organization_id
  ) then
    raise exception using errcode = '23514', message = 'material_request_id must belong to the same project and organization';
  end if;

  if nullif(row_data ->> 'material_request_item_id', '') is not null and not exists (
    select 1
    from public.material_request_items mri
    join public.material_requests mr on mr.id = mri.request_id
    where mri.id = (row_data ->> 'material_request_item_id')::uuid
      and mr.project_id = v_project_id
      and mr.organization_id = v_organization_id
  ) then
    raise exception using errcode = '23514', message = 'material_request_item_id must belong to the same project and organization';
  end if;

  if tg_table_name = 'projects'
     and tg_op = 'UPDATE'
     and old.organization_id is distinct from new.organization_id
     and exists (
       select 1 from public.zones z where z.project_id = new.id
       union all select 1 from public.systems s where s.project_id = new.id
       union all select 1 from public.nodes n where n.project_id = new.id
       union all select 1 from public.works w where w.project_id = new.id
       union all select 1 from public.project_materials pm where pm.project_id = new.id
       union all select 1 from public.purchase_orders po where po.project_id = new.id
     ) then
    raise exception using errcode = '23514', message = 'project organization cannot change after Core v2 data exists';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_platform_core_v2_scope() from public, anon, authenticated;

create trigger projects_core_v2_scope
before insert or update of organization_id, client_id on public.projects
for each row execute function private.enforce_platform_core_v2_scope();
create trigger zones_core_v2_scope
before insert or update on public.zones
for each row execute function private.enforce_platform_core_v2_scope();
create trigger systems_core_v2_scope
before insert or update on public.systems
for each row execute function private.enforce_platform_core_v2_scope();
create trigger nodes_core_v2_scope
before insert or update on public.nodes
for each row execute function private.enforce_platform_core_v2_scope();
create trigger works_core_v2_scope
before insert or update on public.works
for each row execute function private.enforce_platform_core_v2_scope();
create trigger project_materials_core_v2_scope
before insert or update on public.project_materials
for each row execute function private.enforce_platform_core_v2_scope();
create trigger purchase_orders_core_v2_scope
before insert or update on public.purchase_orders
for each row execute function private.enforce_platform_core_v2_scope();
create trigger purchase_items_core_v2_scope
before insert or update on public.purchase_items
for each row execute function private.enforce_platform_core_v2_scope();
create trigger tasks_core_v2_scope
before insert or update of project_id, organization_id, zone_id, system_id, node_id, work_id on public.tasks
for each row execute function private.enforce_platform_core_v2_scope();
create trigger estimate_items_core_v2_scope
before insert or update of estimate_id, work_id, project_material_id on public.estimate_items
for each row execute function private.enforce_platform_core_v2_scope();
create trigger project_media_core_v2_scope
before insert or update of project_id, organization_id, zone_id, node_id, work_id on public.project_media
for each row execute function private.enforce_platform_core_v2_scope();
create trigger documents_core_v2_scope
before insert or update of project_id, organization_id, stage_id, zone_id, system_id, node_id, work_id on public.documents
for each row execute function private.enforce_platform_core_v2_scope();

-- Actor RPCs are called only by deployed Edge Functions using service_role.
-- Authenticated "my" wrappers remain directly callable; anon/PUBLIC access is removed.
do $$
declare
  fn record;
  is_authenticated_wrapper boolean;
begin
  for fn in
    select p.oid, p.oid::regprocedure as signature, p.proname
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prosecdef
      and (
        p.proname like '%_for_actor'
        or p.proname ~ '(^|_)my(_|$)'
        or p.proname in (
          'platform_context_for_user',
          'consume_telegram_link_code',
          'stage_exact_catalog_payload',
          'current_app_user_id',
          'user_has_org_access',
          'user_has_project_access',
          'user_is_org_member_for_project',
          'create_telegram_link_code',
          'get_my_context'
        )
      )
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', fn.signature);
    execute format('grant execute on function %s to service_role', fn.signature);

    is_authenticated_wrapper := fn.proname ~ '(^|_)my(_|$)'
      or fn.proname in (
        'current_app_user_id',
        'user_has_org_access',
        'user_has_project_access',
        'user_is_org_member_for_project',
        'create_telegram_link_code',
        'get_my_context'
      );

    if is_authenticated_wrapper then
      execute format('grant execute on function %s to authenticated', fn.signature);
    end if;
  end loop;
end;
$$;

-- Preserve the intentionally public preliminary calculator RPC unchanged.
