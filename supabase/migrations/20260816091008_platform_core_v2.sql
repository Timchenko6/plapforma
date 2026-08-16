-- TIMCHENKO PLATFORM Core v2
-- Additive-only migration. Existing production tables and RPC contracts are preserved.

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  app_user_id uuid references public.app_users(id) on delete set null,
  display_name text not null check (btrim(display_name) <> ''),
  phone text,
  email text,
  company_name text,
  status text not null default 'active'
    check (status in ('lead', 'active', 'inactive', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, app_user_id)
);

create table public.zones (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  project_id uuid not null references public.projects(id) on delete cascade,
  parent_zone_id uuid references public.zones(id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  zone_type text not null default 'zone'
    check (zone_type in ('site', 'building', 'floor', 'room', 'outdoor', 'technical', 'zone')),
  code text,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, parent_zone_id, name),
  unique (project_id, code)
);

create table public.systems (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  project_id uuid not null references public.projects(id) on delete cascade,
  zone_id uuid references public.zones(id) on delete set null,
  parent_system_id uuid references public.systems(id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  system_type text not null
    check (system_type in ('heating', 'water', 'sewer', 'electric', 'ventilation', 'air_conditioning', 'automation', 'security', 'other')),
  status text not null default 'planned'
    check (status in ('planned', 'design', 'procurement', 'installation', 'commissioning', 'active', 'service', 'disabled')),
  code text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, code)
);

create table public.nodes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  project_id uuid not null references public.projects(id) on delete cascade,
  system_id uuid not null references public.systems(id) on delete cascade,
  zone_id uuid references public.zones(id) on delete set null,
  parent_node_id uuid references public.nodes(id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  node_type text not null default 'assembly',
  status text not null default 'planned'
    check (status in ('planned', 'ordered', 'installed', 'commissioned', 'active', 'fault', 'service', 'retired')),
  code text,
  manufacturer text,
  model text,
  serial_number text,
  installed_at date,
  commissioned_at date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, code)
);

create table public.works (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  project_id uuid not null references public.projects(id) on delete cascade,
  zone_id uuid references public.zones(id) on delete set null,
  system_id uuid references public.systems(id) on delete set null,
  node_id uuid references public.nodes(id) on delete set null,
  stage_id uuid references public.project_stages(id) on delete set null,
  parent_work_id uuid references public.works(id) on delete cascade,
  title text not null check (btrim(title) <> ''),
  description text,
  status text not null default 'planned'
    check (status in ('planned', 'ready', 'in_progress', 'blocked', 'review', 'done', 'cancelled')),
  unit text,
  planned_quantity numeric check (planned_quantity is null or planned_quantity >= 0),
  completed_quantity numeric not null default 0 check (completed_quantity >= 0),
  planned_start date,
  planned_finish date,
  actual_start timestamptz,
  actual_finish timestamptz,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_materials (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  project_id uuid not null references public.projects(id) on delete cascade,
  zone_id uuid references public.zones(id) on delete set null,
  system_id uuid references public.systems(id) on delete set null,
  node_id uuid references public.nodes(id) on delete set null,
  work_id uuid references public.works(id) on delete set null,
  catalog_item_id text references public.catalog_products_v2(item_id) on delete set null,
  name_snap text not null check (btrim(name_snap) <> ''),
  unit text not null default 'шт',
  required_quantity numeric not null default 0 check (required_quantity >= 0),
  reserved_quantity numeric not null default 0 check (reserved_quantity >= 0),
  ordered_quantity numeric not null default 0 check (ordered_quantity >= 0),
  delivered_quantity numeric not null default 0 check (delivered_quantity >= 0),
  installed_quantity numeric not null default 0 check (installed_quantity >= 0),
  status text not null default 'planned'
    check (status in ('planned', 'requested', 'ordered', 'partially_delivered', 'delivered', 'installed', 'cancelled')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  project_id uuid not null references public.projects(id) on delete cascade,
  supplier_id bigint references public.suppliers(id) on delete set null,
  material_request_id uuid references public.material_requests(id) on delete set null,
  created_by uuid references public.app_users(id) on delete set null,
  order_number text,
  supplier_name text,
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'confirmed', 'partially_delivered', 'delivered', 'cancelled')),
  currency text not null default 'RUB' check (char_length(currency) = 3),
  subtotal numeric not null default 0 check (subtotal >= 0),
  delivery_cost numeric not null default 0 check (delivery_cost >= 0),
  total_amount numeric not null default 0 check (total_amount >= 0),
  ordered_at timestamptz,
  expected_at timestamptz,
  delivered_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, order_number)
);

create table public.purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  project_material_id uuid references public.project_materials(id) on delete set null,
  material_request_item_id uuid references public.material_request_items(id) on delete set null,
  catalog_item_id text references public.catalog_products_v2(item_id) on delete set null,
  name_snap text not null check (btrim(name_snap) <> ''),
  unit text not null default 'шт',
  quantity numeric not null check (quantity > 0),
  delivered_quantity numeric not null default 0 check (delivered_quantity >= 0),
  unit_price numeric not null default 0 check (unit_price >= 0),
  total numeric generated always as (quantity * unit_price) stored,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.projects
  add column client_id uuid references public.clients(id) on delete set null;

alter table public.tasks
  add column zone_id uuid references public.zones(id) on delete set null,
  add column system_id uuid references public.systems(id) on delete set null,
  add column node_id uuid references public.nodes(id) on delete set null,
  add column work_id uuid references public.works(id) on delete set null;

alter table public.estimate_items
  add column work_id uuid references public.works(id) on delete set null,
  add column project_material_id uuid references public.project_materials(id) on delete set null;

alter table public.project_media
  add column zone_id uuid references public.zones(id) on delete set null,
  add column node_id uuid references public.nodes(id) on delete set null,
  add column work_id uuid references public.works(id) on delete set null;

alter table public.documents
  add column zone_id uuid references public.zones(id) on delete set null,
  add column system_id uuid references public.systems(id) on delete set null,
  add column node_id uuid references public.nodes(id) on delete set null,
  add column work_id uuid references public.works(id) on delete set null;

create index clients_organization_id_idx on public.clients (organization_id);
create index clients_app_user_id_idx on public.clients (app_user_id) where app_user_id is not null;
create index zones_project_parent_idx on public.zones (project_id, parent_zone_id);
create index systems_project_zone_idx on public.systems (project_id, zone_id);
create index nodes_project_system_idx on public.nodes (project_id, system_id);
create index nodes_zone_id_idx on public.nodes (zone_id) where zone_id is not null;
create index works_project_status_idx on public.works (project_id, status);
create index works_scope_idx on public.works (zone_id, system_id, node_id);
create index project_materials_project_status_idx on public.project_materials (project_id, status);
create index project_materials_catalog_item_idx on public.project_materials (catalog_item_id) where catalog_item_id is not null;
create index purchase_orders_project_status_idx on public.purchase_orders (project_id, status);
create index purchase_items_order_idx on public.purchase_items (purchase_order_id);
create index projects_client_id_idx on public.projects (client_id) where client_id is not null;
create index tasks_work_id_idx on public.tasks (work_id) where work_id is not null;
create index estimate_items_work_id_idx on public.estimate_items (work_id) where work_id is not null;
create index estimate_items_project_material_id_idx on public.estimate_items (project_material_id) where project_material_id is not null;
create index project_media_work_id_idx on public.project_media (work_id) where work_id is not null;
create index documents_work_id_idx on public.documents (work_id) where work_id is not null;

create trigger clients_set_updated_at before update on public.clients
for each row execute function public.set_updated_at();
create trigger zones_set_updated_at before update on public.zones
for each row execute function public.set_updated_at();
create trigger systems_set_updated_at before update on public.systems
for each row execute function public.set_updated_at();
create trigger nodes_set_updated_at before update on public.nodes
for each row execute function public.set_updated_at();
create trigger works_set_updated_at before update on public.works
for each row execute function public.set_updated_at();
create trigger project_materials_set_updated_at before update on public.project_materials
for each row execute function public.set_updated_at();
create trigger purchase_orders_set_updated_at before update on public.purchase_orders
for each row execute function public.set_updated_at();

alter table public.clients enable row level security;
alter table public.zones enable row level security;
alter table public.systems enable row level security;
alter table public.nodes enable row level security;
alter table public.works enable row level security;
alter table public.project_materials enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_items enable row level security;

create policy clients_org_access on public.clients for all to authenticated
using ((select public.user_has_org_access(organization_id)))
with check ((select public.user_has_org_access(organization_id)));

create policy zones_project_access on public.zones for all to authenticated
using ((select public.user_has_project_access(project_id)))
with check ((select public.user_has_project_access(project_id)));
create policy systems_project_access on public.systems for all to authenticated
using ((select public.user_has_project_access(project_id)))
with check ((select public.user_has_project_access(project_id)));
create policy nodes_project_access on public.nodes for all to authenticated
using ((select public.user_has_project_access(project_id)))
with check ((select public.user_has_project_access(project_id)));
create policy works_project_access on public.works for all to authenticated
using ((select public.user_has_project_access(project_id)))
with check ((select public.user_has_project_access(project_id)));
create policy project_materials_project_access on public.project_materials for all to authenticated
using ((select public.user_has_project_access(project_id)))
with check ((select public.user_has_project_access(project_id)));
create policy purchase_orders_project_access on public.purchase_orders for all to authenticated
using ((select public.user_has_project_access(project_id)))
with check ((select public.user_has_project_access(project_id)));
create policy purchase_items_project_access on public.purchase_items for all to authenticated
using (exists (
  select 1 from public.purchase_orders po
  where po.id = purchase_order_id
    and (select public.user_has_project_access(po.project_id))
))
with check (exists (
  select 1 from public.purchase_orders po
  where po.id = purchase_order_id
    and (select public.user_has_project_access(po.project_id))
));

revoke all on table public.clients, public.zones, public.systems, public.nodes,
  public.works, public.project_materials, public.purchase_orders, public.purchase_items
from anon;
grant select, insert, update, delete on table public.clients, public.zones, public.systems,
  public.nodes, public.works, public.project_materials, public.purchase_orders, public.purchase_items
to authenticated;
grant select, insert, update, delete on table public.clients, public.zones, public.systems,
  public.nodes, public.works, public.project_materials, public.purchase_orders, public.purchase_items
to service_role;

comment on table public.clients is 'Organization-scoped client records; app_users compatibility is preserved.';
comment on table public.works is 'Project work breakdown between systems/nodes and existing tasks.';
comment on table public.project_materials is 'Project material plan linked to catalog_products_v2 without duplicating the catalog.';

