package com.jirolite.task.service;

import com.jirolite.auth.entity.User;
import com.jirolite.auth.repository.UserRepository;
import com.jirolite.common.exception.TaskNotFoundException;
import com.jirolite.common.exception.UserNotFoundException;
import com.jirolite.project.entity.Project;
import com.jirolite.project.service.ProjectService;
import com.jirolite.task.dto.TaskDtos.AssignTaskRequest;
import com.jirolite.task.dto.TaskDtos.TaskRequest;
import com.jirolite.task.dto.TaskDtos.TaskResponse;
import com.jirolite.task.dto.TaskDtos.UpdatePriorityRequest;
import com.jirolite.task.dto.TaskDtos.UpdateStatusRequest;
import com.jirolite.task.dto.TaskMapper;
import com.jirolite.task.entity.Task;
import com.jirolite.task.entity.TaskPriority;
import com.jirolite.task.entity.TaskStatus;
import com.jirolite.task.repository.TaskRepository;
import com.jirolite.workspace.service.WorkspaceService;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final ProjectService projectService;
    private final WorkspaceService workspaceService;
    private final UserRepository userRepository;
    private final TaskMapper taskMapper;

    public TaskService(TaskRepository taskRepository, ProjectService projectService, WorkspaceService workspaceService,
                       UserRepository userRepository, TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.projectService = projectService;
        this.workspaceService = workspaceService;
        this.userRepository = userRepository;
        this.taskMapper = taskMapper;
    }

    @Transactional
    public TaskResponse create(TaskRequest request, String email) {
        User reporter = currentUser(email);
        Project project = projectService.getProject(request.projectId());
        projectService.byWorkspace(project.getWorkspace().getId(), email);
        Task task = Task.builder()
                .title(request.title())
                .description(request.description())
                .status(request.status() == null ? TaskStatus.TODO : request.status())
                .priority(request.priority() == null ? TaskPriority.MEDIUM : request.priority())
                .dueDate(request.dueDate())
                .project(project)
                .assignee(resolveUser(request.assigneeId()))
                .reporter(reporter)
                .storyPoints(request.storyPoints())
                .build();
        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> search(String keyword, TaskStatus status, TaskPriority priority, UUID assigneeId, UUID projectId,
                                     LocalDate from, LocalDate to, Pageable pageable, String email) {
        List<UUID> workspaceIds = workspaceService.myWorkspaces(email).stream().map(workspace -> workspace.id()).toList();
        Page<Task> tasks = taskRepository.findAll(TaskSpecifications.filtered(workspaceIds, keyword, status, priority, assigneeId, projectId, from, to), pageable);
        return tasks.map(taskMapper::toResponse);
    }

    @Transactional
    public TaskResponse update(UUID id, TaskRequest request, String email) {
        Task task = getAuthorizedTask(id, email);
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(request.status() == null ? task.getStatus() : request.status());
        task.setPriority(request.priority() == null ? task.getPriority() : request.priority());
        task.setDueDate(request.dueDate());
        task.setAssignee(resolveUser(request.assigneeId()));
        task.setStoryPoints(request.storyPoints());
        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Transactional
    public void delete(UUID id, String email) {
        Task task = getAuthorizedTask(id, email);
        taskRepository.delete(task);
    }

    @Transactional
    public TaskResponse assign(UUID id, AssignTaskRequest request, String email) {
        Task task = getAuthorizedTask(id, email);
        task.setAssignee(resolveUser(request.assigneeId()));
        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateStatus(UUID id, UpdateStatusRequest request, String email) {
        Task task = getAuthorizedTask(id, email);
        task.setStatus(request.status());
        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updatePriority(UUID id, UpdatePriorityRequest request, String email) {
        Task task = getAuthorizedTask(id, email);
        task.setPriority(request.priority());
        return taskMapper.toResponse(taskRepository.save(task));
    }

    private Task getAuthorizedTask(UUID id, String email) {
        Task task = taskRepository.findById(id).orElseThrow(TaskNotFoundException::new);
        projectService.byWorkspace(task.getProject().getWorkspace().getId(), email);
        return task;
    }

    private User currentUser(String email) {
        return userRepository.findByEmailIgnoreCase(email).orElseThrow(UserNotFoundException::new);
    }

    private User resolveUser(UUID id) {
        return id == null ? null : userRepository.findById(id).orElseThrow(UserNotFoundException::new);
    }
}
