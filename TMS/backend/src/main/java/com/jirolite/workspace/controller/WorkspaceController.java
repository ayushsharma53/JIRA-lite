package com.jirolite.workspace.controller;

import com.jirolite.workspace.dto.WorkspaceDtos.InviteMemberRequest;
import com.jirolite.workspace.dto.WorkspaceDtos.WorkspaceMemberResponse;
import com.jirolite.workspace.dto.WorkspaceDtos.WorkspaceRequest;
import com.jirolite.workspace.dto.WorkspaceDtos.WorkspaceResponse;
import com.jirolite.workspace.service.WorkspaceService;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {
    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @GetMapping
    List<WorkspaceResponse> myWorkspaces(Principal principal) {
        return workspaceService.myWorkspaces(principal.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    WorkspaceResponse create(@Valid @RequestBody WorkspaceRequest request, Principal principal) {
        return workspaceService.create(request, principal.getName());
    }

    @PutMapping("/{id}")
    WorkspaceResponse update(@PathVariable UUID id, @Valid @RequestBody WorkspaceRequest request, Principal principal) {
        return workspaceService.update(id, request, principal.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void delete(@PathVariable UUID id, Principal principal) {
        workspaceService.delete(id, principal.getName());
    }

    @PostMapping("/{id}/members")
    WorkspaceMemberResponse invite(@PathVariable UUID id, @Valid @RequestBody InviteMemberRequest request, Principal principal) {
        return workspaceService.invite(id, request, principal.getName());
    }

    @GetMapping("/{id}/members")
    List<WorkspaceMemberResponse> members(@PathVariable UUID id, Principal principal) {
        return workspaceService.listMembers(id, principal.getName());
    }
}
