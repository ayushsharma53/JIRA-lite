package com.jirolite.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

public final class ProjectDtos {
    private ProjectDtos() {}

    public record ProjectRequest(@NotBlank String name, String description, @NotNull UUID workspaceId) {}
    public record ProjectResponse(UUID id, String name, String description, UUID workspaceId, Instant createdAt) {}
}
