-- TIMCHENKO PLATFORM Core v2.2
-- Cover every Core v2 foreign key reported by the Supabase performance advisor.

create index zones_organization_id_idx on public.zones (organization_id);
create index zones_parent_zone_id_idx on public.zones (parent_zone_id) where parent_zone_id is not null;

create index systems_organization_id_idx on public.systems (organization_id);
create index systems_zone_id_idx on public.systems (zone_id) where zone_id is not null;
create index systems_parent_system_id_idx on public.systems (parent_system_id) where parent_system_id is not null;

create index nodes_organization_id_idx on public.nodes (organization_id);
create index nodes_system_id_idx on public.nodes (system_id);
create index nodes_parent_node_id_idx on public.nodes (parent_node_id) where parent_node_id is not null;

create index works_organization_id_idx on public.works (organization_id);
create index works_zone_id_idx on public.works (zone_id) where zone_id is not null;
create index works_system_id_idx on public.works (system_id) where system_id is not null;
create index works_node_id_idx on public.works (node_id) where node_id is not null;
create index works_stage_id_idx on public.works (stage_id) where stage_id is not null;
create index works_parent_work_id_idx on public.works (parent_work_id) where parent_work_id is not null;

create index project_materials_organization_id_idx on public.project_materials (organization_id);
create index project_materials_zone_id_idx on public.project_materials (zone_id) where zone_id is not null;
create index project_materials_system_id_idx on public.project_materials (system_id) where system_id is not null;
create index project_materials_node_id_idx on public.project_materials (node_id) where node_id is not null;
create index project_materials_work_id_idx on public.project_materials (work_id) where work_id is not null;

create index purchase_orders_supplier_id_idx on public.purchase_orders (supplier_id) where supplier_id is not null;
create index purchase_orders_material_request_id_idx on public.purchase_orders (material_request_id) where material_request_id is not null;
create index purchase_orders_created_by_idx on public.purchase_orders (created_by) where created_by is not null;

create index purchase_items_project_material_id_idx on public.purchase_items (project_material_id) where project_material_id is not null;
create index purchase_items_material_request_item_id_idx on public.purchase_items (material_request_item_id) where material_request_item_id is not null;
create index purchase_items_catalog_item_id_idx on public.purchase_items (catalog_item_id) where catalog_item_id is not null;

create index tasks_zone_id_idx on public.tasks (zone_id) where zone_id is not null;
create index tasks_system_id_idx on public.tasks (system_id) where system_id is not null;
create index tasks_node_id_idx on public.tasks (node_id) where node_id is not null;

create index project_media_zone_id_idx on public.project_media (zone_id) where zone_id is not null;
create index project_media_node_id_idx on public.project_media (node_id) where node_id is not null;

create index documents_zone_id_idx on public.documents (zone_id) where zone_id is not null;
create index documents_system_id_idx on public.documents (system_id) where system_id is not null;
create index documents_node_id_idx on public.documents (node_id) where node_id is not null;
