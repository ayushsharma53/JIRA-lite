package com.jirolite.project.controller;

import com.jirolite.project.dto.ProjectDtos.ProjectRequest;
import com.jirolite.project.dto.ProjectDtos.ProjectResponse;
import com.jirolite.project.service.ProjectService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    ProjectResponse create(@Valid @RequestBody ProjectRequest request, Principal principal) {
        return projectService.create(request, principal.getName());
    }

    @GetMapping
    List<ProjectResponse> byWorkspace(@RequestParam UUID workspaceId, Principal principal) {
        return projectService.byWorkspace(workspaceId, principal.getName());
    }

    @PutMapping("/{id}")
    ProjectResponse update(@PathVariable UUID id, @Valid @RequestBody ProjectRequest request, Principal principal) {
        return projectService.update(id, request, principal.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void delete(@PathVariable UUID id, Principal principal) {
        projectService.delete(id, principal.getName());
    }
}
