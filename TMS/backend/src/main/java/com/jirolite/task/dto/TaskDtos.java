package com.jirolite.task.dto;

import com.jirolite.task.entity.TaskPriority;
import com.jirolite.task.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public final class TaskDtos {
    private TaskDtos() {}

    public record TaskRequest(
            @NotBlank String title,
            String description,
            TaskStatus status,
            TaskPriority priority,
            LocalDate dueDate,
            @NotNull UUID projectId,
            UUID assigneeId,
            Integer storyPoints
    ) {}

    public record TaskResponse(
            UUID id,
            String title,
            String description,
            TaskStatus status,
            TaskPriority priority,
            LocalDate dueDate,
            UUID projectId,
            String projectName,
            UUID assigneeId,
            String assigneeName,
            UUID reporterId,
            String reporterName,
            Integer storyPoints,
            Instant createdAt,
            Instant updatedAt
    ) {}

    public record AssignTaskRequest(UUID assigneeId) {}
    public record UpdateStatusRequest(@NotNull TaskStatus status) {}
    public record UpdatePriorityRequest(@NotNull TaskPriority priority) {}
}
