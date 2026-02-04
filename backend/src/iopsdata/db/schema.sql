-- iOpsData Supabase schema
-- This schema defines the multi-tenant data model, row-level security policies,
-- and automation helpers for a Supabase-backed deployment.

create extension if not exists "pgcrypto";

-- Workspaces represent a tenant boundary for all data and users.
create table if not exists public.workspaces (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text unique,
    created_by uuid not null references auth.users (id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Workspace membership ties Supabase users to workspaces with a role.
create table if not exists public.workspace_members (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references public.workspaces (id) on delete cascade,
    user_id uuid not null references auth.users (id) on delete cascade,
    role text not null default 'member',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (workspace_id, user_id)
);

-- Connections store credentials (encrypted at rest) for external data sources.
create table if not exists public.connections (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references public.workspaces (id) on delete cascade,
    name text not null,
    connection_type text not null,
    credentials jsonb not null,
    created_by uuid not null references auth.users (id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Conversations capture chat threads within a workspace.
create table if not exists public.conversations (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references public.workspaces (id) on delete cascade,
    title text,
    created_by uuid not null references auth.users (id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Messages store chat history, including generated SQL for lineage.
create table if not exists public.messages (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references public.workspaces (id) on delete cascade,
    conversation_id uuid not null references public.conversations (id) on delete cascade,
    role text not null,
    content text not null,
    sql_query text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Uploaded files represent user-provided datasets or artifacts.
create table if not exists public.uploaded_files (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references public.workspaces (id) on delete cascade,
    file_name text not null,
    storage_path text not null,
    content_type text,
    size_bytes bigint,
    uploaded_by uuid not null references auth.users (id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Query history captures executed SQL for lineage, auditing, and performance.
create table if not exists public.query_history (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references public.workspaces (id) on delete cascade,
    connection_id uuid references public.connections (id) on delete set null,
    user_id uuid not null references auth.users (id) on delete cascade,
    sql_query text not null,
    executed_at timestamptz not null default now(),
    duration_ms integer,
    rows_returned integer,
    status text not null default 'success',
    error_message text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- User settings store per-user preferences and defaults for the app.
create table if not exists public.user_settings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null unique references auth.users (id) on delete cascade,
    default_workspace_id uuid references public.workspaces (id) on delete set null,
    settings jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_workspace_members_workspace_id on public.workspace_members (workspace_id);
create index if not exists idx_workspace_members_user_id on public.workspace_members (user_id);
create index if not exists idx_connections_workspace_id on public.connections (workspace_id);
create index if not exists idx_connections_created_by on public.connections (created_by);
create index if not exists idx_conversations_workspace_id on public.conversations (workspace_id);
create index if not exists idx_conversations_created_by on public.conversations (created_by);
create index if not exists idx_messages_conversation_id on public.messages (conversation_id);
create index if not exists idx_messages_workspace_id on public.messages (workspace_id);
create index if not exists idx_uploaded_files_workspace_id on public.uploaded_files (workspace_id);
create index if not exists idx_uploaded_files_uploaded_by on public.uploaded_files (uploaded_by);
create index if not exists idx_query_history_workspace_id on public.query_history (workspace_id);
create index if not exists idx_query_history_connection_id on public.query_history (connection_id);
create index if not exists idx_query_history_user_id on public.query_history (user_id);
create index if not exists idx_user_settings_user_id on public.user_settings (user_id);

comment on table public.workspaces is 'Top-level tenant container for all data and users in iOpsData.';
comment on table public.workspace_members is 'Join table mapping users to workspaces with a role for access control.';
comment on table public.connections is 'External data source connections with encrypted credentials.';
comment on table public.conversations is 'Chat sessions within a workspace for analytics workflows.';
comment on table public.messages is 'Chat messages plus optional generated SQL for lineage.';
comment on table public.uploaded_files is 'User-uploaded datasets or artifacts stored in object storage.';
comment on table public.query_history is 'Executed SQL statements with metadata for auditing and lineage.';
comment on table public.user_settings is 'Per-user settings and defaults for the iOpsData app.';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger set_workspaces_updated_at
before update on public.workspaces
for each row
execute function public.set_updated_at();

create trigger set_workspace_members_updated_at
before update on public.workspace_members
for each row
execute function public.set_updated_at();

create trigger set_connections_updated_at
before update on public.connections
for each row
execute function public.set_updated_at();

create trigger set_conversations_updated_at
before update on public.conversations
for each row
execute function public.set_updated_at();

create trigger set_messages_updated_at
before update on public.messages
for each row
execute function public.set_updated_at();

create trigger set_uploaded_files_updated_at
before update on public.uploaded_files
for each row
execute function public.set_updated_at();

create trigger set_query_history_updated_at
before update on public.query_history
for each row
execute function public.set_updated_at();

create trigger set_user_settings_updated_at
before update on public.user_settings
for each row
execute function public.set_updated_at();

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.connections enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.uploaded_files enable row level security;
alter table public.query_history enable row level security;
alter table public.user_settings enable row level security;

create policy workspaces_select on public.workspaces
for select
using (
    exists (
        select 1
        from public.workspace_members
        where workspace_members.workspace_id = workspaces.id
          and workspace_members.user_id = auth.uid()
    )
);

create policy workspaces_insert on public.workspaces
for insert
with check (created_by = auth.uid());

create policy workspaces_update on public.workspaces
for update
using (
    exists (
        select 1
        from public.workspace_members
        where workspace_members.workspace_id = workspaces.id
          and workspace_members.user_id = auth.uid()
          and workspace_members.role in ('owner', 'admin')
    )
);

create policy workspaces_delete on public.workspaces
for delete
using (
    exists (
        select 1
        from public.workspace_members
        where workspace_members.workspace_id = workspaces.id
          and workspace_members.user_id = auth.uid()
          and workspace_members.role in ('owner', 'admin')
    )
);

create policy workspace_members_select on public.workspace_members
for select
using (
    exists (
        select 1
        from public.workspace_members as member
        where member.workspace_id = workspace_members.workspace_id
          and member.user_id = auth.uid()
    )
);

create policy workspace_members_insert on public.workspace_members
for insert
with check (
    exists (
        select 1
        from public.workspace_members as member
        where member.workspace_id = workspace_members.workspace_id
          and member.user_id = auth.uid()
          and member.role in ('owner', 'admin')
    )
);

create policy workspace_members_update on public.workspace_members
for update
using (
    exists (
        select 1
        from public.workspace_members as member
        where member.workspace_id = workspace_members.workspace_id
          and member.user_id = auth.uid()
          and member.role in ('owner', 'admin')
    )
);

create policy workspace_members_delete on public.workspace_members
for delete
using (
    exists (
        select 1
        from public.workspace_members as member
        where member.workspace_id = workspace_members.workspace_id
          and member.user_id = auth.uid()
          and member.role in ('owner', 'admin')
    )
);

create policy connections_access on public.connections
for all
using (
    exists (
        select 1
        from public.workspace_members
        where workspace_members.workspace_id = connections.workspace_id
          and workspace_members.user_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.workspace_members
        where workspace_members.workspace_id = connections.workspace_id
          and workspace_members.user_id = auth.uid()
    )
);

create policy conversations_access on public.conversations
for all
using (
    exists (
        select 1
        from public.workspace_members
        where workspace_members.workspace_id = conversations.workspace_id
          and workspace_members.user_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.workspace_members
        where workspace_members.workspace_id = conversations.workspace_id
          and workspace_members.user_id = auth.uid()
    )
);

create policy messages_access on public.messages
for all
using (
    exists (
        select 1
        from public.workspace_members
        where workspace_members.workspace_id = messages.workspace_id
          and workspace_members.user_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.workspace_members
        where workspace_members.workspace_id = messages.workspace_id
          and workspace_members.user_id = auth.uid()
    )
);

create policy uploaded_files_access on public.uploaded_files
for all
using (
    exists (
        select 1
        from public.workspace_members
        where workspace_members.workspace_id = uploaded_files.workspace_id
          and workspace_members.user_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.workspace_members
        where workspace_members.workspace_id = uploaded_files.workspace_id
          and workspace_members.user_id = auth.uid()
    )
);

create policy query_history_access on public.query_history
for all
using (
    exists (
        select 1
        from public.workspace_members
        where workspace_members.workspace_id = query_history.workspace_id
          and workspace_members.user_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.workspace_members
        where workspace_members.workspace_id = query_history.workspace_id
          and workspace_members.user_id = auth.uid()
    )
);

create policy user_settings_access on public.user_settings
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    new_workspace_id uuid;
    workspace_name text;
begin
    workspace_name := coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), 'Personal Workspace');

    insert into public.workspaces (name, slug, created_by)
    values (workspace_name, concat('workspace-', new.id), new.id)
    returning id into new_workspace_id;

    insert into public.workspace_members (workspace_id, user_id, role)
    values (new_workspace_id, new.id, 'owner');

    insert into public.user_settings (user_id, default_workspace_id)
    values (new.id, new_workspace_id);

    return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
