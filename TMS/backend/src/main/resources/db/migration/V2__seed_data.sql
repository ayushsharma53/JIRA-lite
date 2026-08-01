insert into users (id, name, email, password, role, created_at, updated_at) values
('11111111-1111-1111-1111-111111111111', 'Avery Stone', 'avery@example.com', '$2a$10$5r4k7rfT/v6J8LhdEcOhK.ARRLCXkBZTDVvR.NzfO7pNusp9qGGem', 'ADMIN', now(), now()),
('22222222-2222-2222-2222-222222222222', 'Mina Kapoor', 'mina@example.com', '$2a$10$5r4k7rfT/v6J8LhdEcOhK.ARRLCXkBZTDVvR.NzfO7pNusp9qGGem', 'MEMBER', now(), now());

insert into workspaces (id, name, description, owner_id, created_at) values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Acme Product', 'Roadmap, launch and operations workspace.', '11111111-1111-1111-1111-111111111111', now());

insert into workspace_members (id, workspace_id, user_id, role) values
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'ADMIN'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'MEMBER');

insert into projects (id, name, description, workspace_id, created_at) values
('cccccccc-cccc-cccc-cccc-ccccccccccc1', 'Core Platform', 'Authentication, workspace model and developer workflows.', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now()),
('cccccccc-cccc-cccc-cccc-ccccccccccc2', 'Launch Site', 'Public landing experience and onboarding funnel.', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now());

insert into tasks (id, title, description, status, priority, due_date, project_id, assignee_id, reporter_id, created_at, updated_at) values
('dddddddd-dddd-dddd-dddd-dddddddddd01', 'Design dashboard empty states', 'Create refined zero-state layouts for workspace, project and task views.', 'TODO', 'MEDIUM', current_date + interval '5 days', 'cccccccc-cccc-cccc-cccc-ccccccccccc2', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', now(), now()),
('dddddddd-dddd-dddd-dddd-dddddddddd02', 'Ship JWT refresh rotation', 'Verify refresh token rotation and logout invalidation across browsers.', 'IN_PROGRESS', 'HIGH', current_date + interval '2 days', 'cccccccc-cccc-cccc-cccc-ccccccccccc1', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', now(), now()),
('dddddddd-dddd-dddd-dddd-dddddddddd03', 'Tune Kanban drag interactions', 'Make drag previews feel fast, calm and reliable on touch devices.', 'IN_REVIEW', 'HIGH', current_date + interval '7 days', 'cccccccc-cccc-cccc-cccc-ccccccccccc2', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', now(), now()),
('dddddddd-dddd-dddd-dddd-dddddddddd04', 'Document Railway deployment', 'Add environment variables and release checks for the API service.', 'DONE', 'LOW', current_date - interval '1 day', 'cccccccc-cccc-cccc-cccc-ccccccccccc1', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', now(), now());
