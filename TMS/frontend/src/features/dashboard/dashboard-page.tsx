import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Boxes,
  CheckCircle2,
  Clock,
  CommandIcon,
  LayoutDashboard,
  ListTodo,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  UserCircle,
  Users,
  X,
  LogOut,
  Trash2,
  Briefcase,
  Filter,
  Layers,
  BarChart4,
  Inbox,
  ArrowRight
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { api } from "../../lib/api";
import { cn } from "../../lib/utils";
import { useUiStore } from "../../store/ui-store";
import { useAuth } from "../auth/auth-context";
import type { Page, Task, TaskPriority, TaskStatus, Workspace, Project } from "../../types";

const columns: Array<{ id: Exclude<TaskStatus, "BACKLOG">; label: string }> = [
  { id: "TODO", label: "Todo" },
  { id: "IN_PROGRESS", label: "In progress" },
  { id: "IN_REVIEW", label: "In review" },
  { id: "DONE", label: "Done" }
];

const priorityTone: Record<TaskPriority, string> = {
  LOW: "bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300",
  MEDIUM: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200",
  HIGH: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
  URGENT: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200"
};

export interface WorkspaceMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
}

export function DashboardPage({ isDemo = false }: { isDemo?: boolean }) {
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  
  // Navigation sidebar view
  const [sidebarTab, setSidebarTab] = useState<"tasks" | "profile" | "settings">("tasks");
  const [activeTab, setActiveTab] = useState<"board" | "backlog" | "reports">("board");
  
  const [keyword, setKeyword] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  
  // Real-time notifications state
  const [notifications, setNotifications] = useState<string[]>([
    "Task board loaded successfully."
  ]);

  const { darkMode, toggleDarkMode, setCommandOpen, setSelectedTask } = useUiStore();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  // Helper to add notification
  const addNotification = (msg: string) => {
    setNotifications(prev => [msg, ...prev.slice(0, 9)]);
  };

  // Demo Mock Database States
  const [localWorkspaces, setLocalWorkspaces] = useState<Workspace[]>([]);
  const [localProjects, setLocalProjects] = useState<Project[]>([]);
  const [localMembers, setLocalMembers] = useState<WorkspaceMember[]>([]);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  // Seed Mock data in demo mode
  useEffect(() => {
    if (isDemo) {
      setLocalWorkspaces([
        { id: "ws-1", name: "Demo Acme Workspace", ownerId: "user-1", createdAt: "2026-07-18T00:00:00Z" }
      ]);
      setLocalProjects([
        { id: "proj-1", name: "Apollo Dashboard Project", workspaceId: "ws-1", createdAt: "2026-07-18T00:00:00Z" },
        { id: "proj-2", name: "Zeus Design UI System", workspaceId: "ws-1", createdAt: "2026-07-18T00:00:00Z" }
      ]);
      setLocalMembers([
        { id: "m-1", userId: "user-1", name: "Avery Stone (You)", email: "avery@example.com", role: "ADMIN" },
        { id: "m-2", userId: "user-2", name: "Bessie Cooper", email: "bessie@example.com", role: "MEMBER" },
        { id: "m-3", userId: "user-3", name: "Cody Fisher", email: "cody@example.com", role: "MEMBER" }
      ]);
      setLocalTasks([
        { id: "t-1", title: "Design high-fidelity dashboard layout", description: "Draft responsive CSS layouts using flexible rows and grid modules.", status: "BACKLOG", priority: "HIGH", dueDate: "2026-07-22", projectId: "proj-1", projectName: "Apollo Dashboard Project", assigneeId: "user-1", assigneeName: "Avery Stone (You)", reporterId: "user-2", reporterName: "Bessie Cooper", storyPoints: 5, createdAt: "2026-07-15T10:00:00Z", updatedAt: "2026-07-18T12:00:00Z" },
        { id: "t-2", title: "Setup Docker container architecture", description: "Configure multi-stage Dockerfiles and Nginx gateways.", status: "TODO", priority: "URGENT", dueDate: "2026-07-20", projectId: "proj-1", projectName: "Apollo Dashboard Project", assigneeId: "user-2", assigneeName: "Bessie Cooper", reporterId: "user-1", reporterName: "Avery Stone (You)", storyPoints: 8, createdAt: "2026-07-16T11:00:00Z", updatedAt: "2026-07-17T15:00:00Z" },
        { id: "t-3", title: "Connect API authentication flow", description: "Authenticate tokens against secure Spring Security endpoints.", status: "IN_PROGRESS", priority: "HIGH", dueDate: "2026-07-19", projectId: "proj-1", projectName: "Apollo Dashboard Project", assigneeId: "user-1", assigneeName: "Avery Stone (You)", reporterId: "user-3", reporterName: "Cody Fisher", storyPoints: 3, createdAt: "2026-07-17T09:00:00Z", updatedAt: "2026-07-18T10:00:00Z" },
        { id: "t-4", title: "Perform integration unit tests", description: "Increase code validation coverage to verify preflight headers.", status: "IN_REVIEW", priority: "MEDIUM", dueDate: "2026-07-21", projectId: "proj-1", projectName: "Apollo Dashboard Project", assigneeId: "user-3", assigneeName: "Cody Fisher", reporterId: "user-1", reporterName: "Avery Stone (You)", storyPoints: 2, createdAt: "2026-07-18T08:00:00Z", updatedAt: "2026-07-18T13:00:00Z" },
        { id: "t-5", title: "Deploy Flyway database schemas", description: "Build migrations to seed tables and seed password hashes.", status: "DONE", priority: "LOW", dueDate: "2026-07-15", projectId: "proj-1", projectName: "Apollo Dashboard Project", assigneeId: "user-2", assigneeName: "Bessie Cooper", reporterId: "user-1", reporterName: "Avery Stone (You)", storyPoints: 1, createdAt: "2026-07-14T09:00:00Z", updatedAt: "2026-07-15T14:00:00Z" }
      ]);
    }
  }, [isDemo]);

  // 1. Fetch workspaces
  const workspacesQuery = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const response = await api.get<Workspace[]>("/api/workspaces");
      return response.data;
    },
    enabled: !isDemo
  });

  const workspaces = isDemo ? localWorkspaces : (workspacesQuery.data ?? []);

  // Set default workspace
  useEffect(() => {
    if (workspaces.length && !activeWorkspaceId) {
      setActiveWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, activeWorkspaceId]);

  // 2. Fetch projects for active workspace
  const projectsQuery = useQuery({
    queryKey: ["projects", activeWorkspaceId],
    queryFn: async () => {
      if (!activeWorkspaceId) return [];
      const response = await api.get<Project[]>("/api/projects", {
        params: { workspaceId: activeWorkspaceId }
      });
      return response.data;
    },
    enabled: !!activeWorkspaceId && !isDemo
  });

  const projects = isDemo ? localProjects : (projectsQuery.data ?? []);

  // Set default project
  useEffect(() => {
    if (projects.length) {
      const exists = projects.some(p => p.id === activeProjectId);
      if (!exists) {
        setActiveProjectId(projects[0].id);
      }
    } else {
      setActiveProjectId(null);
    }
  }, [projects, activeProjectId]);

  // 3. Fetch members for active workspace
  const membersQuery = useQuery({
    queryKey: ["members", activeWorkspaceId],
    queryFn: async () => {
      if (!activeWorkspaceId) return [];
      const response = await api.get<WorkspaceMember[]>(`/api/workspaces/${activeWorkspaceId}/members`);
      return response.data;
    },
    enabled: !!activeWorkspaceId && !isDemo
  });

  const members = isDemo ? localMembers : (membersQuery.data ?? []);

  // 4. Fetch tasks for active project (including filters)
  const tasksQuery = useQuery({
    queryKey: ["tasks", activeProjectId, keyword, priorityFilter, assigneeFilter],
    queryFn: async () => {
      if (!activeProjectId) return [];
      const params: any = { projectId: activeProjectId, size: 50, sort: "createdAt,desc" };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (priorityFilter) params.priority = priorityFilter;
      if (assigneeFilter) params.assigneeId = assigneeFilter;

      const response = await api.get<Page<Task>>("/api/tasks", { params });
      return response.data.content;
    },
    enabled: !!activeProjectId && !isDemo
  });

  // Client side filtering for demo mode
  const tasks = useMemo(() => {
    if (!isDemo) return tasksQuery.data ?? [];
    let list = localTasks;
    if (activeProjectId) {
      list = list.filter(t => t.projectId === activeProjectId);
    }
    if (keyword.trim()) {
      list = list.filter(t =>
        t.title.toLowerCase().includes(keyword.toLowerCase()) ||
        (t.description ?? "").toLowerCase().includes(keyword.toLowerCase())
      );
    }
    if (priorityFilter) {
      list = list.filter(t => t.priority === priorityFilter);
    }
    if (assigneeFilter) {
      list = list.filter(t => t.assigneeId === assigneeFilter);
    }
    return list;
  }, [isDemo, localTasks, tasksQuery.data, activeProjectId, keyword, priorityFilter, assigneeFilter]);

  // Dynamic statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const backlog = tasks.filter(t => t.status === "BACKLOG").length;
    const inProgress = tasks.filter(t => t.status === "IN_PROGRESS").length;
    const urgent = tasks.filter(t => t.priority === "URGENT").length;
    const done = tasks.filter(t => t.status === "DONE").length;
    
    // Total estimated story points
    const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    const completedPoints = tasks
      .filter(t => t.status === "DONE")
      .reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);

    return { total, backlog, inProgress, urgent, done, totalPoints, completedPoints };
  }, [tasks]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommandOpen]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      if (isDemo) {
        setLocalTasks(prev => prev.map(t => t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t));
        return null;
      }
      return api.patch(`/api/tasks/${id}/status`, { status });
    },
    onSuccess: (_, variables) => {
      if (!isDemo) {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
      const t = tasks.find(task => task.id === variables.id);
      addNotification(`Moved "${t?.title || 'Task'}" to status ${variables.status.toLowerCase().replace("_", " ")}.`);
    },
    onError: () => addNotification("Error: Could not sync task status to server.")
  });

  function onDragStart(event: any) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    const taskId = String(event.active.id);
    const status = event.over?.id as TaskStatus | undefined;
    setActiveId(null);
    if (!status || !columns.some(column => column.id === status)) {
      return;
    }
    updateStatus.mutate({ id: taskId, status });
  }

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  const activeProject = projects.find(p => p.id === activeProjectId);

  // Mock User details for demo
  const demoUser = {
    id: "user-1",
    name: "Demo Explorer",
    email: "demo@jirolite.com",
    role: "ADMIN"
  };
  const activeUser = isDemo ? demoUser : user;

  const handleLogout = () => {
    if (isDemo) {
      window.location.href = "/";
    } else {
      logout();
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-border bg-white/60 p-5 backdrop-blur-xl dark:bg-white/[0.03] lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex items-center gap-3 text-sm font-semibold mb-8">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <Boxes size={18} />
            </span>
            Jira Lite {isDemo && <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded ml-1">Demo</span>}
          </div>

          {/* Navigation items */}
          <div className="space-y-1 mb-6">
            <button
              onClick={() => setSidebarTab("tasks")}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                sidebarTab === "tasks"
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <LayoutDashboard size={18} />
              Tasks & Board
            </button>
            <button
              onClick={() => setSidebarTab("profile")}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                sidebarTab === "profile"
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <UserCircle size={18} />
              User Profile
            </button>
            <button
              onClick={() => setSidebarTab("settings")}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                sidebarTab === "settings"
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Settings size={18} />
              Settings
            </button>
          </div>

          {/* Workspace Switcher */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Workspaces</span>
              <button onClick={() => setCreateWorkspaceOpen(true)} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground">
                <Plus size={14} />
              </button>
            </div>
            {workspaces.length ? (
              <select
                value={activeWorkspaceId ?? ""}
                onChange={e => {
                  setActiveWorkspaceId(e.target.value);
                  setActiveProjectId(null);
                  setSidebarTab("tasks");
                }}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
              >
                {workspaces.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-muted-foreground">No workspaces found.</p>
            )}
          </div>

          {/* Project Switcher */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Projects</span>
              <button
                onClick={() => setCreateProjectOpen(true)}
                disabled={!activeWorkspaceId}
                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <Plus size={14} />
              </button>
            </div>
            {projects.length ? (
              <div className="space-y-1">
                {projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveProjectId(p.id);
                      setSidebarTab("tasks");
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition",
                      activeProjectId === p.id && sidebarTab === "tasks"
                        ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Briefcase size={16} />
                    {p.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No projects found.</p>
            )}
          </div>
        </div>

        {/* Logout at bottom */}
        <div className="space-y-4">
          <Card className="border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-semibold">{isDemo ? "Demo sandbox active" : "Deployment ready"}</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {isDemo ? "You are interacting in an in-memory client database sandbox." : "Vercel frontend, Railway API, Neon PostgreSQL and Flyway migrations."}
            </p>
          </Card>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
          >
            <LogOut size={18} />
            {isDemo ? "Exit Demo" : "Logout"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="min-w-0 flex-1 flex flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-background/75 px-4 py-4 backdrop-blur-xl lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Workspace / {activeWorkspace?.name ?? "Loading..."}
              </p>
              <h1 className="text-2xl font-semibold tracking-normal">
                {sidebarTab === "tasks" 
                  ? (activeProject?.name ?? "No active project") 
                  : sidebarTab === "profile" 
                    ? "Your Profile Credentials" 
                    : "Settings"}
              </h1>
            </div>
            
            {/* Filter controls */}
            {sidebarTab === "tasks" && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-0 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    className="pl-10"
                    value={keyword}
                    onChange={event => setKeyword(event.target.value)}
                    placeholder="Search tasks..."
                  />
                </div>

                {/* Priority Filter */}
                <div className="flex items-center gap-1 border border-border rounded-xl bg-card px-2 py-1.5 text-sm">
                  <Filter size={14} className="text-muted-foreground" />
                  <select
                    value={priorityFilter}
                    onChange={e => setPriorityFilter(e.target.value)}
                    className="bg-transparent outline-none text-xs font-medium cursor-pointer"
                  >
                    <option value="">All Priorities</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                {/* Assignee Filter */}
                <div className="flex items-center gap-1 border border-border rounded-xl bg-card px-2 py-1.5 text-sm">
                  <Users size={14} className="text-muted-foreground" />
                  <select
                    value={assigneeFilter}
                    onChange={e => setAssigneeFilter(e.target.value)}
                    className="bg-transparent outline-none text-xs font-medium cursor-pointer"
                  >
                    <option value="">All Assignees</option>
                    {members.map(m => (
                      <option key={m.userId} value={m.userId}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Button variant="outline" size="icon" onClick={() => setCommandOpen(true)} title="Command palette">
                  <CommandIcon size={18} />
                </Button>
                <Button variant="outline" size="icon" onClick={toggleDarkMode} title="Toggle dark mode">
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </Button>
                <Button variant="indigo" onClick={() => setCreateTaskOpen(true)} disabled={!activeProjectId}>
                  <Plus size={18} /> Create Task
                </Button>
              </div>
            )}

            {sidebarTab !== "tasks" && (
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={toggleDarkMode} title="Toggle dark mode">
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </Button>
              </div>
            )}
          </div>

          {/* Navigation Tab Bar (Only for tasks tab) */}
          {sidebarTab === "tasks" && (
            <div className="flex border-b border-border mt-4 gap-6 text-sm shrink-0">
              <button
                onClick={() => setActiveTab("board")}
                className={cn(
                  "pb-2 font-medium border-b-2 transition flex items-center gap-2",
                  activeTab === "board"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <ListTodo size={16} />
                Active Board
              </button>
              <button
                onClick={() => setActiveTab("backlog")}
                className={cn(
                  "pb-2 font-medium border-b-2 transition flex items-center gap-2",
                  activeTab === "backlog"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Inbox size={16} />
                Backlog Management
                {stats.backlog > 0 && (
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                    {stats.backlog}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={cn(
                  "pb-2 font-medium border-b-2 transition flex items-center gap-2",
                  activeTab === "reports"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <BarChart4 size={16} />
                Reports & Insights
              </button>
            </div>
          )}
        </header>

        <main className="flex-1 space-y-6 p-4 lg:p-8">
          {sidebarTab === "tasks" && (
            <>
              {/* Dynamic Statistics Cards */}
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="p-5 flex flex-col justify-between h-28 border-border bg-card shadow-soft">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Total Tasks</span>
                  <h3 className="text-3xl font-semibold mt-2">{stats.total}</h3>
                </Card>
                <Card className="p-5 flex flex-col justify-between h-28 border-border bg-card shadow-soft">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Workspace Velocity</span>
                  <h3 className="text-3xl font-semibold mt-2 text-indigo-600 dark:text-indigo-400">
                    {stats.completedPoints} <span className="text-sm font-normal text-muted-foreground">/ {stats.totalPoints} pts</span>
                  </h3>
                </Card>
                <Card className="p-5 flex flex-col justify-between h-28 border-border bg-card shadow-soft">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Backlog Tasks</span>
                  <h3 className="text-3xl font-semibold mt-2 text-amber-600 dark:text-amber-400">{stats.backlog}</h3>
                </Card>
                <Card className="p-5 flex flex-col justify-between h-28 border-border bg-card shadow-soft">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Completed</span>
                  <h3 className="text-3xl font-semibold mt-2 text-emerald-600 dark:text-emerald-400">{stats.done}</h3>
                </Card>
              </section>

              {/* Dynamic Notifications Banner */}
              <Card className="glass p-5 border-primary/20 bg-primary/5 flex items-start gap-4">
                <span className="relative flex h-3 w-3 mt-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase text-primary tracking-wider">Latest Activity Notice</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{notifications[0]}</p>
                </div>
              </Card>

              {/* Tab View Container */}
              <div className="flex-1">
                {activeTab === "board" && (
                  tasksQuery.isLoading && !isDemo ? (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {[1, 2, 3, 4].map(idx => (
                        <div key={idx} className="w-80 shrink-0 h-96 animate-pulse rounded-2xl bg-muted/40" />
                      ))}
                    </div>
                  ) : (
                    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
                      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin">
                        {columns.map(column => (
                          <KanbanColumn
                            key={column.id}
                            id={column.id}
                            label={column.label}
                            tasks={tasks.filter(task => task.status === column.id)}
                          />
                        ))}
                      </div>
                      <DragOverlay>
                        {activeId ? (
                          <TaskCard task={tasks.find(t => t.id === activeId)!} isOverlay />
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                  )
                )}

                {activeTab === "backlog" && (
                  <BacklogView 
                    tasks={tasks.filter(t => t.status === "BACKLOG")}
                    members={members}
                    addNotification={addNotification}
                    onCreateClick={() => setCreateTaskOpen(true)}
                    isDemo={isDemo}
                    setLocalTasks={setLocalTasks}
                  />
                )}

                {activeTab === "reports" && (
                  <ReportsView 
                    tasks={tasks}
                    members={members}
                  />
                )}
              </div>
            </>
          )}

          {sidebarTab === "profile" && (
            <ProfileView 
              user={activeUser}
              tasks={tasks}
              workspaces={workspaces}
              isDemo={isDemo}
            />
          )}

          {sidebarTab === "settings" && (
            <SettingsView 
              workspaces={workspaces}
              projects={projects}
              activeWorkspaceId={activeWorkspaceId}
              setActiveWorkspaceId={setActiveWorkspaceId}
              activeProjectId={activeProjectId}
              setActiveProjectId={setActiveProjectId}
              isDemo={isDemo}
              setLocalWorkspaces={setLocalWorkspaces}
              setLocalProjects={setLocalProjects}
              setLocalTasks={setLocalTasks}
              addNotification={addNotification}
            />
          )}

          <section className="grid gap-4 lg:grid-cols-3">
            <ActivityFeed notifications={notifications} />
            <Card className="p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold">Keyboard shortcuts</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {["Ctrl + K Command palette", "Esc Close overlays", "Drag Move task"].map(item => (
                  <div key={item} className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </main>
      </div>

      <CommandPalette createTask={() => setCreateTaskOpen(true)} />
      
      <TaskDrawer 
        members={members} 
        addNotification={addNotification}
        isDemo={isDemo}
        setLocalTasks={setLocalTasks}
      />

      {/* Dialog Modals */}
      <AnimatePresence>
        {createTaskOpen && activeWorkspaceId && activeProjectId && (
          <CreateTaskDialog
            workspaceId={activeWorkspaceId}
            projectId={activeProjectId}
            members={members}
            defaultStatus={activeTab === "backlog" ? "BACKLOG" : "TODO"}
            onClose={() => setCreateTaskOpen(false)}
            addNotification={addNotification}
            isDemo={isDemo}
            setLocalTasks={setLocalTasks}
          />
        )}

        {createWorkspaceOpen && (
          <CreateWorkspaceDialog 
            onClose={() => setCreateWorkspaceOpen(false)} 
            addNotification={addNotification}
            isDemo={isDemo}
            setLocalWorkspaces={setLocalWorkspaces}
          />
        )}

        {createProjectOpen && activeWorkspaceId && (
          <CreateProjectDialog 
            workspaceId={activeWorkspaceId} 
            onClose={() => setCreateProjectOpen(false)} 
            addNotification={addNotification} 
            isDemo={isDemo}
            setLocalProjects={setLocalProjects}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function KanbanColumn({ id, label, tasks }: { id: TaskStatus; label: string; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <section
      ref={setNodeRef}
      className={cn(
        "w-80 shrink-0 min-h-[560px] rounded-2xl border border-border bg-muted/40 p-3 transition flex flex-col",
        isOver && "border-primary bg-primary/5"
      )}
    >
      <div className="mb-4 flex items-center justify-between px-1 shrink-0">
        <h3 className="text-sm font-semibold">{label}</h3>
        <span className="rounded-full bg-background px-2.5 py-1 text-xs text-muted-foreground">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px]">
        <AnimatePresence>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

function TaskCard({ task, isOverlay }: { task: Task; isOverlay?: boolean }) {
  const { setNodeRef, listeners, attributes, transform, isDragging } = useDraggable({ 
    id: task.id,
    disabled: isOverlay 
  });
  const { setSelectedTask } = useUiStore();
  
  const style = transform && !isOverlay
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  // Placeholder when dragging
  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        className="h-32 rounded-2xl border-2 border-dashed border-primary/20 bg-muted/20"
      />
    );
  }

  return (
    <motion.article
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      layout={!isOverlay}
      initial={isOverlay ? undefined : { opacity: 0, y: 8 }}
      animate={isOverlay ? undefined : { opacity: 1, y: 0 }}
      exit={isOverlay ? undefined : { opacity: 0, scale: 0.98 }}
      onClick={() => setSelectedTask(task)}
      className={cn(
        "cursor-grab rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift",
        isOverlay && "cursor-grabbing shadow-lift border-primary scale-[1.02] z-50"
      )}
      {...(isOverlay ? {} : listeners)}
      {...(isOverlay ? {} : attributes)}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", priorityTone[task.priority])}>
          {task.priority}
        </span>
        <div className="flex items-center gap-2">
          {task.storyPoints && (
            <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-semibold text-muted-foreground">
              {task.storyPoints} pts
            </span>
          )}
          <span className="text-xs text-muted-foreground">{task.dueDate ?? "No date"}</span>
        </div>
      </div>
      <h4 className="text-base font-semibold leading-6">{task.title}</h4>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{task.description}</p>
      <div className="mt-5 flex items-center justify-between">
        <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
          {task.projectName}
        </span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-zinc-950 text-xs font-semibold text-white dark:bg-white dark:text-zinc-950">
          {(task.assigneeName ?? "U").slice(0, 1)}
        </span>
      </div>
    </motion.article>
  );
}

function TaskDrawer({ 
  members,
  addNotification,
  isDemo,
  setLocalTasks
}: { 
  members: WorkspaceMember[];
  addNotification: (msg: string) => void;
  isDemo?: boolean;
  setLocalTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
}) {
  const queryClient = useQueryClient();
  const { selectedTask, setSelectedTask } = useUiStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [storyPoints, setStoryPoints] = useState<number | "">("");

  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title);
      setDescription(selectedTask.description ?? "");
      setStatus(selectedTask.status);
      setPriority(selectedTask.priority);
      setDueDate(selectedTask.dueDate ?? "");
      setAssigneeId(selectedTask.assigneeId ?? "");
      setStoryPoints(selectedTask.storyPoints ?? "");
    }
  }, [selectedTask]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTask) return;
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        dueDate: dueDate || null,
        projectId: selectedTask.projectId,
        assigneeId: assigneeId || null,
        storyPoints: storyPoints === "" ? null : Number(storyPoints)
      };

      if (isDemo && setLocalTasks) {
        const assignee = members.find(m => m.userId === assigneeId);
        const updated: Task = {
          ...selectedTask,
          title: payload.title,
          description: payload.description || undefined,
          status: payload.status,
          priority: payload.priority,
          dueDate: payload.dueDate || undefined,
          assigneeId: payload.assigneeId || undefined,
          assigneeName: assignee ? assignee.name : undefined,
          storyPoints: payload.storyPoints || undefined,
          updatedAt: new Date().toISOString()
        };
        setLocalTasks(prev => prev.map(t => t.id === selectedTask.id ? updated : t));
        return updated;
      }

      const response = await api.put<Task>(`/api/tasks/${selectedTask.id}`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      if (!isDemo) {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
      addNotification(`Updated task "${title}".`);
      if (data) setSelectedTask(data);
    },
    onError: () => addNotification("Error: Could not save task changes.")
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTask) return;
      if (isDemo && setLocalTasks) {
        setLocalTasks(prev => prev.filter(t => t.id !== selectedTask.id));
      } else {
        await api.delete(`/api/tasks/${selectedTask.id}`);
      }
    },
    onSuccess: () => {
      if (!isDemo) {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
      addNotification(`Deleted task "${title}".`);
      setSelectedTask(undefined);
    },
    onError: () => addNotification("Error: Could not delete task.")
  });

  return (
    <AnimatePresence>
      {selectedTask && (
        <motion.aside
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-zinc-950/20 backdrop-blur-sm"
          onClick={() => setSelectedTask(undefined)}
        >
          <motion.div
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="ml-auto h-full w-full max-w-xl overflow-y-auto border-l border-border bg-background p-6 shadow-lift flex flex-col justify-between"
            onClick={event => event.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className={cn("rounded-full px-3 py-1 text-xs font-medium", priorityTone[selectedTask.priority])}>
                  {selectedTask.priority}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this task?")) {
                        deleteMutation.mutate();
                      }
                    }}
                    title="Delete task"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedTask(undefined)}>
                    <X size={18} />
                  </Button>
                </div>
              </div>

              {/* Title input */}
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="mt-8 text-4xl font-semibold tracking-normal bg-transparent border-none outline-none w-full border-b border-transparent focus:border-border"
                placeholder="Task title"
              />

              {/* Description input */}
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="mt-4 leading-7 text-muted-foreground bg-transparent border-none outline-none w-full resize-none min-h-24 border-b border-transparent focus:border-border"
                placeholder="Task description..."
              />

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {/* Status selection */}
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as TaskStatus)}
                    className="w-full bg-transparent border-none outline-none font-semibold text-sm cursor-pointer"
                  >
                    <option value="BACKLOG">Backlog</option>
                    <option value="TODO">Todo</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="IN_REVIEW">In review</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                {/* Priority selection */}
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground mb-1">Priority</p>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as TaskPriority)}
                    className="w-full bg-transparent border-none outline-none font-semibold text-sm cursor-pointer"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                {/* Assignee selection */}
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground mb-1">Assignee</p>
                  <select
                    value={assigneeId}
                    onChange={e => setAssigneeId(e.target.value)}
                    className="w-full bg-transparent border-none outline-none font-semibold text-sm cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {members.map(member => (
                      <option key={member.userId} value={member.userId}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date selection */}
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full bg-transparent border-none outline-none font-semibold text-sm cursor-pointer"
                  />
                </div>

                {/* Story Points selection */}
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground mb-1">Estimate (Story Points)</p>
                  <select
                    value={storyPoints}
                    onChange={e => setStoryPoints(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full bg-transparent border-none outline-none font-semibold text-sm cursor-pointer"
                  >
                    <option value="">Unestimated</option>
                    <option value="1">1 pt</option>
                    <option value="2">2 pts</option>
                    <option value="3">3 pts</option>
                    <option value="5">5 pt</option>
                    <option value="8">8 pts</option>
                    <option value="13">13 pts</option>
                  </select>
                </div>
              </div>

              {/* Static details */}
              <div className="mt-8 space-y-2 text-xs text-muted-foreground">
                <p>Reporter: {selectedTask.reporterName}</p>
                <p>Created: {new Date(selectedTask.createdAt).toLocaleString()}</p>
                <p>Updated: {new Date(selectedTask.updatedAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-8 border-t border-border pt-4 flex gap-3">
              <Button
                variant="indigo"
                className="flex-1"
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setSelectedTask(undefined)}>
                Close
              </Button>
            </div>
          </motion.div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function ActivityFeed({ notifications }: { notifications: string[] }) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold mb-4">Recent activity</h3>
      <div className="space-y-4 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
        {notifications.map((act, index) => (
          <div key={index} className="flex gap-3 text-sm animate-fade-in">
            <CheckCircle2 className="mt-0.5 text-primary shrink-0" size={16} />
            <span className="leading-6 text-muted-foreground">{act}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CommandPalette({ createTask }: { createTask: () => void }) {
  const { commandOpen, setCommandOpen, toggleDarkMode } = useUiStore();

  return (
    <AnimatePresence>
      {commandOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-start bg-zinc-950/20 px-4 pt-24 backdrop-blur-sm"
          onClick={() => setCommandOpen(false)}
        >
          <Command
            className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-lift"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center border-b border-border px-4">
              <Search size={18} className="text-muted-foreground" />
              <Command.Input
                className="h-14 flex-1 bg-transparent px-3 text-sm outline-none"
                placeholder="Search commands..."
              />
            </div>
            <Command.List className="p-2">
              <Command.Empty className="px-3 py-8 text-center text-sm text-muted-foreground">
                No command found.
              </Command.Empty>
              <Command.Item
                className="rounded-xl px-3 py-3 text-sm aria-selected:bg-muted"
                onSelect={() => {
                  createTask();
                  setCommandOpen(false);
                }}
              >
                <Plus className="mr-2 inline" size={16} /> Create task
              </Command.Item>
              <Command.Item
                className="rounded-xl px-3 py-3 text-sm aria-selected:bg-muted"
                onSelect={() => {
                  toggleDarkMode();
                  setCommandOpen(false);
                }}
              >
                <Moon className="mr-2 inline" size={16} /> Toggle dark mode
              </Command.Item>
              <Command.Item className="rounded-xl px-3 py-3 text-sm aria-selected:bg-muted" onSelect={() => setCommandOpen(false)}>
                <Users className="mr-2 inline" size={16} /> Close commands
              </Command.Item>
            </Command.List>
          </Command>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CreateTaskDialog({
  workspaceId,
  projectId,
  members,
  defaultStatus,
  onClose,
  addNotification,
  isDemo,
  setLocalTasks
}: {
  workspaceId: string;
  projectId: string;
  members: WorkspaceMember[];
  defaultStatus: TaskStatus;
  onClose: () => void;
  addNotification: (msg: string) => void;
  isDemo?: boolean;
  setLocalTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [storyPoints, setStoryPoints] = useState<number | "">("");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        status: status,
        priority,
        dueDate: dueDate || null,
        projectId,
        assigneeId: assigneeId || null,
        storyPoints: storyPoints === "" ? null : Number(storyPoints)
      };

      if (isDemo && setLocalTasks) {
        const assignee = members.find(m => m.userId === assigneeId);
        const newTask: Task = {
          id: `t-mock-${Math.random().toString(36).substr(2, 9)}`,
          title: payload.title,
          description: payload.description || undefined,
          status: payload.status,
          priority: payload.priority,
          dueDate: payload.dueDate || undefined,
          projectId: payload.projectId,
          projectName: "Apollo Dashboard Project",
          assigneeId: payload.assigneeId || undefined,
          assigneeName: assignee ? assignee.name : undefined,
          reporterId: "user-1",
          reporterName: "Avery Stone (You)",
          storyPoints: payload.storyPoints || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setLocalTasks(prev => [newTask, ...prev]);
        return;
      }

      await api.post("/api/tasks", payload);
    },
    onSuccess: () => {
      if (!isDemo) {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
      addNotification(`Created task "${title}" with status ${status.toLowerCase()}.`);
      onClose();
    },
    onError: () => addNotification("Error: Could not create task.")
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/20 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 24, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 24, scale: 0.98 }}
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-lift"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <h3 className="text-lg font-semibold">Create New Task</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <div className="space-y-4">
          <Input placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} />
          <textarea
            placeholder="Task description..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full rounded-xl border border-border bg-transparent p-3 text-sm outline-none resize-none min-h-24"
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <select
              value={status}
              onChange={e => setStatus(e.target.value as TaskStatus)}
              className="rounded-xl border border-border bg-transparent p-3 text-sm outline-none w-full cursor-pointer"
            >
              <option value="BACKLOG">Backlog</option>
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="IN_REVIEW">In review</option>
              <option value="DONE">Done</option>
            </select>

            <select
              value={priority}
              onChange={e => setPriority(e.target.value as TaskPriority)}
              className="rounded-xl border border-border bg-transparent p-3 text-sm outline-none w-full cursor-pointer"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>

            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={assigneeId}
              onChange={e => setAssigneeId(e.target.value)}
              className="rounded-xl border border-border bg-transparent p-3 text-sm outline-none w-full cursor-pointer"
            >
              <option value="">Unassigned</option>
              {members.map(member => (
                <option key={member.userId} value={member.userId}>
                  {member.name}
                </option>
              ))}
            </select>

            <select
              value={storyPoints}
              onChange={e => setStoryPoints(e.target.value === "" ? "" : Number(e.target.value))}
              className="rounded-xl border border-border bg-transparent p-3 text-sm outline-none w-full cursor-pointer"
            >
              <option value="">Estimate (Story Points)</option>
              <option value="1">1 pt</option>
              <option value="2">2 pts</option>
              <option value="3">3 pts</option>
              <option value="5">5 pts</option>
              <option value="8">8 pts</option>
              <option value="13">13 pts</option>
            </select>
          </div>

          <Button
            variant="indigo"
            className="w-full"
            onClick={() => mutation.mutate()}
            disabled={!title.trim() || mutation.isPending}
          >
            {mutation.isPending ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CreateWorkspaceDialog({ 
  onClose,
  addNotification,
  isDemo,
  setLocalWorkspaces
}: { 
  onClose: () => void;
  addNotification: (msg: string) => void;
  isDemo?: boolean;
  setLocalWorkspaces?: React.Dispatch<React.SetStateAction<Workspace[]>>;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        description: description.trim() || null
      };

      if (isDemo && setLocalWorkspaces) {
        const newWs: Workspace = {
          id: `ws-mock-${Math.random().toString(36).substr(2, 9)}`,
          name: payload.name,
          description: payload.description || undefined,
          ownerId: "user-1",
          createdAt: new Date().toISOString()
        };
        setLocalWorkspaces(prev => [...prev, newWs]);
        return;
      }

      await api.post("/api/workspaces", payload);
    },
    onSuccess: () => {
      if (!isDemo) {
        queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      }
      addNotification(`Created new workspace "${name}".`);
      onClose();
    },
    onError: () => addNotification("Error: Could not create workspace.")
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/20 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 24, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 24, scale: 0.98 }}
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-lift"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <h3 className="text-lg font-semibold">Create Workspace</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <div className="space-y-4">
          <Input placeholder="Workspace name" value={name} onChange={e => setName(e.target.value)} />
          <textarea
            placeholder="Workspace description..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full rounded-xl border border-border bg-transparent p-3 text-sm outline-none resize-none min-h-24"
          />
          <Button
            variant="indigo"
            className="w-full"
            onClick={() => mutation.mutate()}
            disabled={!name.trim() || mutation.isPending}
          >
            {mutation.isPending ? "Creating..." : "Create Workspace"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CreateProjectDialog({
  workspaceId,
  onClose,
  addNotification,
  isDemo,
  setLocalProjects
}: {
  workspaceId: string;
  onClose: () => void;
  addNotification: (msg: string) => void;
  isDemo?: boolean;
  setLocalProjects?: React.Dispatch<React.SetStateAction<Project[]>>;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        workspaceId
      };

      if (isDemo && setLocalProjects) {
        const newProj: Project = {
          id: `proj-mock-${Math.random().toString(36).substr(2, 9)}`,
          name: payload.name,
          description: payload.description || undefined,
          workspaceId: payload.workspaceId,
          createdAt: new Date().toISOString()
        };
        setLocalProjects(prev => [...prev, newProj]);
        return;
      }

      await api.post("/api/projects", payload);
    },
    onSuccess: () => {
      if (!isDemo) {
        queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      }
      addNotification(`Created new project "${name}".`);
      onClose();
    },
    onError: () => addNotification("Error: Could not create project.")
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/20 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 24, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 24, scale: 0.98 }}
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-lift"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <h3 className="text-lg font-semibold">Create Project</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <div className="space-y-4">
          <Input placeholder="Project name" value={name} onChange={e => setName(e.target.value)} />
          <textarea
            placeholder="Project description..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full rounded-xl border border-border bg-transparent p-3 text-sm outline-none resize-none min-h-24"
          />
          <Button
            variant="indigo"
            className="w-full"
            onClick={() => mutation.mutate()}
            disabled={!name.trim() || mutation.isPending}
          >
            {mutation.isPending ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ----------------------------------------------------
// BACKLOG VIEW COMPONENT
// ----------------------------------------------------
function BacklogView({
  tasks,
  members,
  addNotification,
  onCreateClick,
  isDemo,
  setLocalTasks
}: {
  tasks: Task[];
  members: WorkspaceMember[];
  addNotification: (msg: string) => void;
  onCreateClick: () => void;
  isDemo?: boolean;
  setLocalTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
}) {
  const queryClient = useQueryClient();
  const { setSelectedTask } = useUiStore();

  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);

  const moveToBoardMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isDemo && setLocalTasks) {
        setLocalTasks(prev => prev.map(t => t.id === id ? { ...t, status: "TODO", updatedAt: new Date().toISOString() } : t));
        return;
      }
      await api.patch(`/api/tasks/${id}/status`, { status: "TODO" });
    },
    onSuccess: (_, id) => {
      if (!isDemo) {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
      const t = tasks.find(task => task.id === id);
      addNotification(`Moved "${t?.title}" from Backlog to Todo board.`);
    }
  });

  const updatePointsMutation = useMutation({
    mutationFn: async ({ id, points, task }: { id: string; points: number | null; task: Task }) => {
      if (isDemo && setLocalTasks) {
        setLocalTasks(prev => prev.map(t => t.id === id ? { ...t, storyPoints: points || undefined, updatedAt: new Date().toISOString() } : t));
        return;
      }
      const payload = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        projectId: task.projectId,
        assigneeId: task.assigneeId,
        storyPoints: points
      };
      await api.put(`/api/tasks/${id}`, payload);
    },
    onSuccess: () => {
      if (!isDemo) {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
      addNotification("Story points estimation updated.");
    }
  });

  return (
    <div className="space-y-6">
      <Card className="glass p-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Backlog Holding Space</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Refine scope, prioritize features, and estimate difficulty before pushing tasks to the active board.
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Estimated points</p>
            <p className="text-lg font-bold text-primary">{totalPoints} pts</p>
          </div>
          <Button variant="indigo" onClick={onCreateClick}>
            <Plus size={16} /> Add to Backlog
          </Button>
        </div>
      </Card>

      <Card className="border-border">
        {tasks.length > 0 ? (
          <div className="divide-y divide-border">
            {tasks.map(task => (
              <div 
                key={task.id} 
                className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-muted/20 transition cursor-pointer"
                onClick={() => setSelectedTask(task)}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", priorityTone[task.priority])}>
                      {task.priority}
                    </span>
                    <h4 className="text-sm font-semibold hover:underline">{task.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{task.description ?? "No description provided."}</p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto" onClick={e => e.stopPropagation()}>
                  {/* Story Points estimation drop-down */}
                  <select
                    value={task.storyPoints ?? ""}
                    onChange={e => {
                      const pts = e.target.value === "" ? null : Number(e.target.value);
                      updatePointsMutation.mutate({ id: task.id, points: pts, task });
                    }}
                    className="border border-border rounded-xl px-2.5 py-1 text-xs font-semibold bg-background outline-none cursor-pointer"
                  >
                    <option value="">Estimate (SP)</option>
                    <option value="1">1 SP</option>
                    <option value="2">2 SP</option>
                    <option value="3">3 SP</option>
                    <option value="5">5 SP</option>
                    <option value="8">8 SP</option>
                    <option value="13">13 SP</option>
                  </select>

                  <span className="text-xs text-muted-foreground shrink-0">
                    {task.assigneeName ? `Assignee: ${task.assigneeName}` : "Unassigned"}
                  </span>

                  <Button 
                    variant="outline" 
                    className="gap-1.5 text-xs text-indigo-600 border-indigo-200 dark:text-indigo-400 dark:border-indigo-950 px-3 py-1.5 h-auto rounded-xl"
                    onClick={() => moveToBoardMutation.mutate(task.id)}
                    disabled={moveToBoardMutation.isPending}
                  >
                    Move to Board <ArrowRight size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <Inbox size={48} className="mx-auto text-muted-foreground/50" />
            <h4 className="font-semibold text-sm">Your Backlog is empty</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Any tasks that need design refinement, scope adjustments, or estimation should be held in the backlog first.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

// ----------------------------------------------------
// REPORTS VIEW COMPONENT
// ----------------------------------------------------
function ReportsView({
  tasks,
  members
}: {
  tasks: Task[];
  members: WorkspaceMember[];
}) {
  
  // A. VELOCITY BY TEAM MEMBER
  const velocityData = useMemo(() => {
    return members.map(m => {
      // Find tasks assigned to this member
      const memberTasks = tasks.filter(t => t.assigneeId === m.userId);
      const planned = memberTasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
      const completed = memberTasks
        .filter(t => t.status === "DONE")
        .reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);

      return {
        name: m.name.split(" ")[0], // Short name
        planned,
        completed
      };
    });
  }, [tasks, members]);

  // Find max value in velocityData to scale the bar chart
  const maxVelocityValue = useMemo(() => {
    let max = 5; // Fallback
    velocityData.forEach(d => {
      if (d.planned > max) max = d.planned;
      if (d.completed > max) max = d.completed;
    });
    return max + 2; // Add padding
  }, [velocityData]);

  // B. CUMULATIVE FLOW DIAGRAM (CFD) RECONSTRUCTION
  const cfdData = useMemo(() => {
    const days = [];
    const now = new Date();
    
    // Generate data for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(23, 59, 59, 999);
      const timestamp = date.getTime();
      
      let backlog = 0;
      let todo = 0;
      let inProgress = 0;
      let inReview = 0;
      let done = 0;
      
      tasks.forEach(task => {
        const createdTime = new Date(task.createdAt).getTime();
        if (createdTime > timestamp) {
          // Task was not created yet on this day
          return;
        }
        
        // Approximate status on this day
        const updatedTime = new Date(task.updatedAt).getTime();
        
        if (task.status === "DONE") {
          if (updatedTime <= timestamp) {
            done++;
          } else {
            // Revert status prior to update
            inProgress++;
          }
        } else if (task.status === "IN_REVIEW") {
          if (updatedTime <= timestamp) {
            inReview++;
          } else {
            todo++;
          }
        } else if (task.status === "IN_PROGRESS") {
          if (updatedTime <= timestamp) {
            inProgress++;
          } else {
            todo++;
          }
        } else if (task.status === "TODO") {
          todo++;
        } else if (task.status === "BACKLOG") {
          backlog++;
        }
      });
      
      days.push({
        label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        backlog,
        todo,
        inProgress,
        inReview,
        done
      });
    }
    return days;
  }, [tasks]);

  // Max task count for CFD scaling
  const maxCfdValue = useMemo(() => {
    let max = 5;
    cfdData.forEach(d => {
      const total = d.backlog + d.todo + d.inProgress + d.inReview + d.done;
      if (total > max) max = total;
    });
    return max + 1;
  }, [cfdData]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* 1. Velocity Chart Card */}
      <Card className="p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold">Velocity by Team Member</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Story Points estimated vs completed. Tracks individual output capacity in the active workspace.
          </p>
        </div>

        {/* Dynamic SVG Bar Chart */}
        <div className="mt-8 flex justify-center items-end h-60 w-full relative border-b border-l border-border px-4 pb-2">
          {velocityData.map((d, index) => {
            const plannedHeight = (d.planned / maxVelocityValue) * 100;
            const completedHeight = (d.completed / maxVelocityValue) * 100;

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Visual Bars Container */}
                <div className="w-full flex justify-center items-end gap-2 h-44">
                  {/* Planned Bar */}
                  <div 
                    style={{ height: `${plannedHeight}%` }} 
                    className="w-4 bg-indigo-500/20 dark:bg-indigo-500/10 border-t-2 border-indigo-500 rounded-t transition-all duration-300"
                    title={`Planned: ${d.planned} pts`}
                  />
                  {/* Completed Bar */}
                  <div 
                    style={{ height: `${completedHeight}%` }} 
                    className="w-4 bg-emerald-500/20 dark:bg-emerald-500/10 border-t-2 border-emerald-500 rounded-t transition-all duration-300 animate-pulse"
                    title={`Completed: ${d.completed} pts`}
                  />
                </div>
                {/* Label */}
                <span className="text-[10px] font-semibold text-muted-foreground truncate max-w-16 mt-2">{d.name}</span>

                {/* Tooltip Overlay */}
                <div className="absolute bottom-16 bg-zinc-950 text-white text-[10px] rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lift z-10 space-y-0.5">
                  <p className="font-semibold">{d.name}</p>
                  <p>Planned: {d.planned} pts</p>
                  <p className="text-emerald-400">Completed: {d.completed} pts</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 justify-center text-xs mt-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-500/20 border border-indigo-500 block" />
            <span className="text-muted-foreground font-medium">Planned Story Points</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500 block animate-pulse" />
            <span className="text-muted-foreground font-medium">Completed Story Points</span>
          </div>
        </div>
      </Card>

      {/* 2. Cumulative Flow Diagram Card */}
      <Card className="p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold">Cumulative Flow Diagram (CFD)</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Historical task statuses progression. Widening bands indicate bottlenecks or work pileup.
          </p>
        </div>

        {/* SVG Stacked Area Chart */}
        <div className="mt-8 relative h-60 w-full">
          <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
            {/* Generate stacked area layers */}
            {(() => {
              const totalDays = cfdData.length;
              const width = 500;
              const height = 200;
              const stepX = width / (totalDays - 1);

              // Stack calculations for each day
              // Points arrays for paths
              const donePts: string[] = [];
              const inReviewPts: string[] = [];
              const inProgressPts: string[] = [];
              const todoPts: string[] = [];
              const backlogPts: string[] = [];

              cfdData.forEach((day, i) => {
                const x = i * stepX;
                
                // Cumulative heights
                const valDone = day.done;
                const valReview = valDone + day.inReview;
                const valProgress = valReview + day.inProgress;
                const valTodo = valProgress + day.todo;
                const valBacklog = valTodo + day.backlog;

                // Map to Y coords (inverted since SVG 0 is top)
                const yDone = height - (valDone / maxCfdValue) * height;
                const yReview = height - (valReview / maxCfdValue) * height;
                const yProgress = height - (valProgress / maxCfdValue) * height;
                const yTodo = height - (valTodo / maxCfdValue) * height;
                const yBacklog = height - (valBacklog / maxCfdValue) * height;

                donePts.push(`${x},${yDone}`);
                inReviewPts.push(`${x},${yReview}`);
                inProgressPts.push(`${x},${yProgress}`);
                todoPts.push(`${x},${yTodo}`);
                backlogPts.push(`${x},${yBacklog}`);
              });

              // Construct closed polygons for area shading
              const backlogPoly = `${backlogPts.join(" ")} 500,200 0,200`;
              const todoPoly = `${todoPts.join(" ")} 500,200 0,200`;
              const progressPoly = `${inProgressPts.join(" ")} 500,200 0,200`;
              const reviewPoly = `${inReviewPts.join(" ")} 500,200 0,200`;
              const donePoly = `${donePts.join(" ")} 500,200 0,200`;

              return (
                <>
                  {/* Layer 5: Backlog */}
                  <polygon points={backlogPoly} className="fill-amber-500/10 stroke-amber-500/40 stroke-1" />
                  {/* Layer 4: Todo */}
                  <polygon points={todoPoly} className="fill-zinc-500/15 stroke-zinc-500/40 stroke-1" />
                  {/* Layer 3: In Progress */}
                  <polygon points={progressPoly} className="fill-indigo-500/20 stroke-indigo-500/40 stroke-1" />
                  {/* Layer 2: In Review */}
                  <polygon points={reviewPoly} className="fill-orange-500/20 stroke-orange-500/40 stroke-1" />
                  {/* Layer 1: Done */}
                  <polygon points={donePoly} className="fill-emerald-500/30 stroke-emerald-500/70 stroke-1" />
                </>
              );
            })()}
          </svg>

          {/* Day X-Axis Labels */}
          <div className="flex justify-between text-[9px] font-semibold text-muted-foreground mt-2 px-1">
            {cfdData.map((d, i) => (
              <span key={i}>{d.label}</span>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-center text-[10px] mt-4">
          {[
            ["Done", "bg-emerald-500/30 border-emerald-500"],
            ["In Review", "bg-orange-500/20 border-orange-500"],
            ["In Progress", "bg-indigo-500/20 border-indigo-500"],
            ["Todo", "bg-zinc-500/15 border-zinc-500"],
            ["Backlog", "bg-amber-500/10 border-amber-500"]
          ].map(([label, cls]) => (
            <div key={label} className="flex items-center gap-1">
              <span className={cn("w-2.5 h-2.5 rounded border block", cls)} />
              <span className="text-muted-foreground font-medium">{label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ----------------------------------------------------
// USER PROFILE VIEW COMPONENT
// ----------------------------------------------------
function ProfileView({ 
  user, 
  tasks,
  workspaces,
  isDemo
}: { 
  user: any; 
  tasks: Task[];
  workspaces: Workspace[];
  isDemo?: boolean;
}) {
  const myTasks = useMemo(() => tasks.filter(t => t.assigneeId === user.id), [tasks, user]);
  const myCompleted = useMemo(() => myTasks.filter(t => t.status === "DONE").length, [myTasks]);

  return (
    <div className="space-y-6">
      <Card className="glass p-8 flex flex-col md:flex-row gap-6 items-center md:items-start border-border bg-card shadow-soft">
        <div className="grid h-24 w-24 place-items-center rounded-3xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-4xl font-semibold shadow-lift shrink-0">
          {(user.name ?? "U").slice(0, 1)}
        </div>
        <div className="space-y-2 text-center md:text-left flex-1">
          <h2 className="text-3xl font-semibold tracking-normal">{user.name}</h2>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase bg-primary/10 text-primary mt-1">
            {user.role}
          </span>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Credentials Card */}
        <Card className="p-6 border-border bg-card shadow-soft space-y-4">
          <h3 className="text-base font-semibold">Security & Credentials</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">User ID (UUID)</span>
              <span className="font-mono text-xs">{user.id}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Email Address</span>
              <span>{user.email}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Security Role</span>
              <span>{user.role}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Session Status</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {isDemo ? "Active Demo Sandbox" : "Active JWT Token"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Device Session</span>
              <span className="truncate max-w-64 text-xs text-muted-foreground" title={navigator.userAgent}>
                {navigator.userAgent.split(" ")[0]}
              </span>
            </div>
          </div>
        </Card>

        {/* Task Workload Stats */}
        <Card className="p-6 border-border bg-card shadow-soft space-y-4">
          <h3 className="text-base font-semibold">Your Assigned Load</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/40 p-4 rounded-2xl text-center">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Total Assigned</p>
              <p className="text-2xl font-bold mt-1">{myTasks.length}</p>
            </div>
            <div className="bg-muted/40 p-4 rounded-2xl text-center">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Completed</p>
              <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{myCompleted}</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Current Task List</p>
            {myTasks.length > 0 ? (
              <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                {myTasks.map(t => (
                  <div key={t.id} className="flex justify-between items-center bg-background border border-border p-2 rounded-xl text-xs">
                    <span className="truncate max-w-48 font-medium">{t.title}</span>
                    <span className="text-muted-foreground uppercase text-[10px]">{t.status.replace("_", " ")}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No tasks currently assigned to you.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// SETTINGS VIEW COMPONENT
// ----------------------------------------------------
function SettingsView({
  workspaces,
  projects,
  activeWorkspaceId,
  setActiveWorkspaceId,
  activeProjectId,
  setActiveProjectId,
  isDemo,
  setLocalWorkspaces,
  setLocalProjects,
  setLocalTasks,
  addNotification
}: {
  workspaces: Workspace[];
  projects: Project[];
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: React.Dispatch<React.SetStateAction<string | null>>;
  activeProjectId: string | null;
  setActiveProjectId: React.Dispatch<React.SetStateAction<string | null>>;
  isDemo: boolean;
  setLocalWorkspaces?: React.Dispatch<React.SetStateAction<Workspace[]>>;
  setLocalProjects?: React.Dispatch<React.SetStateAction<Project[]>>;
  setLocalTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  addNotification: (msg: string) => void;
}) {
  const queryClient = useQueryClient();
  const { darkMode, toggleDarkMode } = useUiStore();

  const updateWorkspaceMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const payload = { name };
      if (isDemo && setLocalWorkspaces) {
        setLocalWorkspaces(prev => prev.map(w => w.id === id ? { ...w, name } : w));
        return { id, name };
      } else {
        const response = await api.put(`/api/workspaces/${id}`, payload);
        return response.data;
      }
    },
    onSuccess: (data: any) => {
      if (!isDemo) {
        queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      }
      addNotification(`Workspace renamed to "${data.name}".`);
    },
    onError: () => addNotification("Error: Could not rename workspace.")
  });

  const deleteWorkspaceMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isDemo && setLocalWorkspaces && setLocalProjects && setLocalTasks) {
        setLocalWorkspaces(prev => prev.filter(w => w.id !== id));
        const projIds = projects.filter(p => p.workspaceId === id).map(p => p.id);
        setLocalProjects(prev => prev.filter(p => p.workspaceId !== id));
        setLocalTasks(prev => prev.filter(t => !projIds.includes(t.projectId)));
      } else {
        await api.delete(`/api/workspaces/${id}`);
      }
    },
    onSuccess: (_, id) => {
      if (!isDemo) {
        queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      }
      const ws = workspaces.find(w => w.id === id);
      addNotification(`Workspace "${ws?.name}" deleted successfully.`);
      const remaining = workspaces.filter(w => w.id !== id);
      if (remaining.length > 0) {
        setActiveWorkspaceId(remaining[0].id);
      } else {
        setActiveWorkspaceId(null);
      }
      setActiveProjectId(null);
    },
    onError: () => addNotification("Error: Could not delete workspace.")
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const payload = { name, workspaceId: activeWorkspaceId };
      if (isDemo && setLocalProjects) {
        setLocalProjects(prev => prev.map(p => p.id === id ? { ...p, name } : p));
        return { id, name };
      } else {
        const response = await api.put(`/api/projects/${id}`, payload);
        return response.data;
      }
    },
    onSuccess: (data: any) => {
      if (!isDemo) {
        queryClient.invalidateQueries({ queryKey: ["projects", activeWorkspaceId] });
      }
      addNotification(`Project renamed to "${data.name}".`);
    },
    onError: () => addNotification("Error: Could not rename project.")
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isDemo && setLocalProjects && setLocalTasks) {
        setLocalProjects(prev => prev.filter(p => p.id !== id));
        setLocalTasks(prev => prev.filter(t => t.projectId !== id));
      } else {
        await api.delete(`/api/projects/${id}`);
      }
    },
    onSuccess: (_, id) => {
      if (!isDemo) {
        queryClient.invalidateQueries({ queryKey: ["projects", activeWorkspaceId] });
      }
      const proj = projects.find(p => p.id === id);
      addNotification(`Project "${proj?.name}" deleted successfully.`);
      const remaining = projects.filter(p => p.id !== id);
      if (remaining.length > 0) {
        setActiveProjectId(remaining[0].id);
      } else {
        setActiveProjectId(null);
      }
    },
    onError: () => addNotification("Error: Could not delete project.")
  });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 1. Theme and Preferences */}
      <Card className="p-6 border-border bg-card shadow-soft">
        <h3 className="text-base font-semibold mb-4">Personal Preferences</h3>
        <div className="space-y-4 divide-y divide-border text-sm">
          <div className="flex items-center justify-between pb-4">
            <div>
              <p className="font-semibold">Dark Interface Mode</p>
              <p className="text-xs text-muted-foreground">Toggles color theme from light to high-contrast dark layout.</p>
            </div>
            <Button variant="outline" className="rounded-xl h-9" onClick={toggleDarkMode}>
              {darkMode ? "Disable Dark" : "Enable Dark"}
            </Button>
          </div>
          <div className="flex items-center justify-between pt-4 pb-4">
            <div>
              <p className="font-semibold">Agile Estimation Scale</p>
              <p className="text-xs text-muted-foreground">Default sizing strategy for story points estimation.</p>
            </div>
            <span className="font-semibold text-xs border border-border bg-background px-3 py-1.5 rounded-xl">Fibonacci (1-13)</span>
          </div>
        </div>
      </Card>

      {/* 2. Workspace Management Card */}
      <Card className="p-6 border-border bg-card shadow-soft">
        <div className="mb-4">
          <h3 className="text-base font-semibold">Workspace Settings</h3>
          <p className="text-xs text-muted-foreground mt-1">
            List, update/rename, and delete workspaces available in your account.
          </p>
        </div>

        <div className="space-y-3">
          {workspaces.length > 0 ? (
            workspaces.map(ws => (
              <WorkspaceRow
                key={ws.id}
                workspace={ws}
                onUpdate={(id, name) => updateWorkspaceMutation.mutate({ id, name })}
                onDelete={(id) => {
                  if (window.confirm(`Are you sure you want to delete workspace "${ws.name}"? This will delete all projects and tasks inside it.`)) {
                    deleteWorkspaceMutation.mutate(id);
                  }
                }}
                isPending={updateWorkspaceMutation.isPending || deleteWorkspaceMutation.isPending}
              />
            ))
          ) : (
            <p className="text-xs text-muted-foreground italic">No workspaces found.</p>
          )}
        </div>
      </Card>

      {/* 3. Project Management Card */}
      {activeWorkspaceId && (
        <Card className="p-6 border-border bg-card shadow-soft">
          <div className="mb-4">
            <h3 className="text-base font-semibold">
              Project Settings (Workspace: {workspaces.find(w => w.id === activeWorkspaceId)?.name})
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              List, rename, and delete projects inside the active workspace.
            </p>
          </div>

          <div className="space-y-3">
            {projects.length > 0 ? (
              projects.map(proj => (
                <ProjectRow
                  key={proj.id}
                  project={proj}
                  onUpdate={(id, name) => updateProjectMutation.mutate({ id, name })}
                  onDelete={(id) => {
                    if (window.confirm(`Are you sure you want to delete project "${proj.name}"? This will delete all tasks inside it.`)) {
                      deleteProjectMutation.mutate(id);
                    }
                  }}
                  isPending={updateProjectMutation.isPending || deleteProjectMutation.isPending}
                />
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic">No projects found inside this workspace.</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

function WorkspaceRow({
  workspace,
  onUpdate,
  onDelete,
  isPending
}: {
  workspace: Workspace;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState(workspace.name);

  useEffect(() => {
    setName(workspace.name);
  }, [workspace.name]);

  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      <Input
        value={name}
        onChange={e => setName(e.target.value)}
        className="flex-1 bg-background text-sm py-1 h-9 rounded-xl"
        placeholder="Workspace name"
      />
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 border-indigo-200 dark:border-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0"
        onClick={() => {
          if (name.trim() && name.trim() !== workspace.name) {
            onUpdate(workspace.id, name.trim());
          }
        }}
        disabled={isPending || !name.trim() || name.trim() === workspace.name}
        title="Save workspace name"
      >
        <CheckCircle2 size={16} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-950 shrink-0"
        onClick={() => onDelete(workspace.id)}
        disabled={isPending}
        title="Delete workspace"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}

function ProjectRow({
  project,
  onUpdate,
  onDelete,
  isPending
}: {
  project: Project;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState(project.name);

  useEffect(() => {
    setName(project.name);
  }, [project.name]);

  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      <Input
        value={name}
        onChange={e => setName(e.target.value)}
        className="flex-1 bg-background text-sm py-1 h-9 rounded-xl"
        placeholder="Project name"
      />
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 border-indigo-200 dark:border-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0"
        onClick={() => {
          if (name.trim() && name.trim() !== project.name) {
            onUpdate(project.id, name.trim());
          }
        }}
        disabled={isPending || !name.trim() || name.trim() === project.name}
        title="Save project name"
      >
        <CheckCircle2 size={16} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-950 shrink-0"
        onClick={() => onDelete(project.id)}
        disabled={isPending}
        title="Delete project"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}
