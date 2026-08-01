import type { Project, Task, Workspace } from "../../types";

export const demoWorkspace: Workspace = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  name: "Acme Product",
  description: "Roadmap, launch and operations workspace.",
  ownerId: "11111111-1111-1111-1111-111111111111",
  createdAt: new Date().toISOString()
};

export const demoProjects: Project[] = [
  {
    id: "cccccccc-cccc-cccc-cccc-ccccccccccc1",
    name: "Core Platform",
    description: "Authentication, workspace model and developer workflows.",
    workspaceId: demoWorkspace.id,
    createdAt: new Date().toISOString()
  },
  {
    id: "cccccccc-cccc-cccc-cccc-ccccccccccc2",
    name: "Launch Site",
    description: "Landing experience and onboarding funnel.",
    workspaceId: demoWorkspace.id,
    createdAt: new Date().toISOString()
  }
];

export const demoTasks: Task[] = [
  {
    id: "dddddddd-dddd-dddd-dddd-dddddddddd01",
    title: "Design dashboard empty states",
    description: "Create refined zero-state layouts for workspace, project and task views.",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "2026-06-20",
    projectId: demoProjects[1].id,
    projectName: "Launch Site",
    assigneeId: "22222222-2222-2222-2222-222222222222",
    assigneeName: "Mina Kapoor",
    reporterId: "11111111-1111-1111-1111-111111111111",
    reporterName: "Avery Stone",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "dddddddd-dddd-dddd-dddd-dddddddddd02",
    title: "Ship JWT refresh rotation",
    description: "Verify refresh token rotation and logout invalidation across browsers.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: "2026-06-17",
    projectId: demoProjects[0].id,
    projectName: "Core Platform",
    assigneeId: "11111111-1111-1111-1111-111111111111",
    assigneeName: "Avery Stone",
    reporterId: "11111111-1111-1111-1111-111111111111",
    reporterName: "Avery Stone",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "dddddddd-dddd-dddd-dddd-dddddddddd03",
    title: "Tune Kanban drag interactions",
    description: "Make drag previews feel fast, calm and reliable on touch devices.",
    status: "IN_REVIEW",
    priority: "HIGH",
    dueDate: "2026-06-22",
    projectId: demoProjects[1].id,
    projectName: "Launch Site",
    assigneeId: "22222222-2222-2222-2222-222222222222",
    assigneeName: "Mina Kapoor",
    reporterId: "11111111-1111-1111-1111-111111111111",
    reporterName: "Avery Stone",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "dddddddd-dddd-dddd-dddd-dddddddddd04",
    title: "Document Railway deployment",
    description: "Add environment variables and release checks for the API service.",
    status: "DONE",
    priority: "LOW",
    dueDate: "2026-06-13",
    projectId: demoProjects[0].id,
    projectName: "Core Platform",
    assigneeId: "11111111-1111-1111-1111-111111111111",
    assigneeName: "Avery Stone",
    reporterId: "22222222-2222-2222-2222-222222222222",
    reporterName: "Mina Kapoor",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
