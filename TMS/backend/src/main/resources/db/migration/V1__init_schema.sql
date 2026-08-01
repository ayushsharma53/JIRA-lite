create table users (
    id uuid primary key,
    name varchar(255) not null,
    email varchar(255) not null unique,
    password varchar(255) not null,
    role varchar(32) not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table workspaces (
    id uuid primary key,
    name varchar(255) not null,
    description text,
    owner_id uuid not null references users(id),
    created_at timestamp with time zone not null
);

create table workspace_members (
    id uuid primary key,
    workspace_id uuid not null references workspaces(id) on delete cascade,
    user_id uuid not null references users(id) on delete cascade,
    role varchar(32) not null,
    constraint uk_workspace_member unique (workspace_id, user_id)
);

create table projects (
    id uuid primary key,
    name varchar(255) not null,
    description text,
    workspace_id uuid not null references workspaces(id) on delete cascade,
    created_at timestamp with time zone not null
);

create table tasks (
    id uuid primary key,
    title varchar(255) not null,
    description text,
    status varchar(32) not null,
    priority varchar(32) not null,
    due_date date,
    project_id uuid not null references projects(id) on delete cascade,
    assignee_id uuid references users(id),
    reporter_id uuid not null references users(id),
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table refresh_tokens (
    id uuid primary key,
    token varchar(512) not null unique,
    user_id uuid not null references users(id) on delete cascade,
    expiry_date timestamp with time zone not null
);

create index idx_workspace_members_user_id on workspace_members(user_id);
create index idx_projects_workspace_id on projects(workspace_id);
create index idx_tasks_project_id on tasks(project_id);
create index idx_tasks_assignee_id on tasks(assignee_id);
create index idx_tasks_status_priority on tasks(status, priority);
create index idx_tasks_due_date on tasks(due_date);
create index idx_refresh_tokens_user_id on refresh_tokens(user_id);
