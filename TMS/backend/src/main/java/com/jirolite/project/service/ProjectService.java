package com.jirolite.project.service;

import com.jirolite.common.exception.ProjectNotFoundException;
import com.jirolite.project.dto.ProjectDtos.ProjectRequest;
import com.jirolite.project.dto.ProjectDtos.ProjectResponse;
import com.jirolite.project.entity.Project;
import com.jirolite.project.repository.ProjectRepository;
import com.jirolite.workspace.entity.Workspace;
import com.jirolite.workspace.service.WorkspaceService;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final WorkspaceService workspaceService;

    public ProjectService(ProjectRepository projectRepository, WorkspaceService workspaceService) {
        this.projectRepository = projectRepository;
        this.workspaceService = workspaceService;
    }

    @Transactional
    public ProjectResponse create(ProjectRequest request, String email) {
        Workspace workspace = workspaceService.getWorkspace(request.workspaceId());
        workspaceService.requireMember(workspace, email);
        return toResponse(projectRepository.save(Project.builder()
                .name(request.name())
                .description(request.description())
                .workspace(workspace)
                .build()));
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> byWorkspace(UUID workspaceId, String email) {
        Workspace workspace = workspaceService.getWorkspace(workspaceId);
        workspaceService.requireMember(workspace, email);
        return projectRepository.findByWorkspaceId(workspaceId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public ProjectResponse update(UUID id, ProjectRequest request, String email) {
        Project project = getProject(id);
        workspaceService.requireMember(project.getWorkspace(), email);
        project.setName(request.name());
        project.setDescription(request.description());
        return toResponse(projectRepository.save(project));
    }

    @Transactional
    public void delete(UUID id, String email) {
        Project project = getProject(id);
        workspaceService.requireMember(project.getWorkspace(), email);
        projectRepository.delete(project);
    }

    public Project getProject(UUID id) {
        return projectRepository.findById(id).orElseThrow(ProjectNotFoundException::new);
    }

    private ProjectResponse toResponse(Project project) {
        return new ProjectResponse(project.getId(), project.getName(), project.getDescription(), project.getWorkspace().getId(), project.getCreatedAt());
    }
}
