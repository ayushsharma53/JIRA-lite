package com.jirolite.workspace.dto;

import com.jirolite.workspace.entity.WorkspaceRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.UUID;

public final class WorkspaceDtos {
    private WorkspaceDtos() {}

    public record WorkspaceRequest(@NotBlank String name, String description) {}
    public record InviteMemberRequest(@Email @NotBlank String email, WorkspaceRole role) {}
    public record WorkspaceResponse(UUID id, String name, String description, UUID ownerId, Instant createdAt) {}
    public record WorkspaceMemberResponse(UUID id, UUID userId, String name, String email, WorkspaceRole role) {}
}
