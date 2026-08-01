package com.jirolite.task.service;

import com.jirolite.task.entity.Task;
import com.jirolite.task.entity.TaskPriority;
import com.jirolite.task.entity.TaskStatus;
import jakarta.persistence.criteria.JoinType;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

public final class TaskSpecifications {
    private TaskSpecifications() {}

    public static Specification<Task> filtered(List<UUID> workspaceIds, String keyword, TaskStatus status, TaskPriority priority, UUID assigneeId,
                                               UUID projectId, LocalDate from, LocalDate to) {
        return Specification.where(workspaceIn(workspaceIds))
                .and(keyword(keyword))
                .and(status(status))
                .and(priority(priority))
                .and(assignee(assigneeId))
                .and(project(projectId))
                .and(dueRange(from, to));
    }

    private static Specification<Task> workspaceIn(List<UUID> workspaceIds) {
        return (root, query, cb) -> {
            if (workspaceIds == null || workspaceIds.isEmpty()) {
                return cb.disjunction();
            }
            return root.join("project").join("workspace").get("id").in(workspaceIds);
        };
    }

    private static Specification<Task> keyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return cb.conjunction();
            }
            String value = "%" + keyword.toLowerCase() + "%";
            return cb.or(cb.like(cb.lower(root.get("title")), value), cb.like(cb.lower(root.get("description")), value));
        };
    }

    private static Specification<Task> status(TaskStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    private static Specification<Task> priority(TaskPriority priority) {
        return (root, query, cb) -> priority == null ? cb.conjunction() : cb.equal(root.get("priority"), priority);
    }

    private static Specification<Task> assignee(UUID assigneeId) {
        return (root, query, cb) -> assigneeId == null ? cb.conjunction() : cb.equal(root.join("assignee", JoinType.LEFT).get("id"), assigneeId);
    }

    private static Specification<Task> project(UUID projectId) {
        return (root, query, cb) -> projectId == null ? cb.conjunction() : cb.equal(root.join("project").get("id"), projectId);
    }

    private static Specification<Task> dueRange(LocalDate from, LocalDate to) {
        return (root, query, cb) -> {
            if (from != null && to != null) {
                return cb.between(root.get("dueDate"), from, to);
            }
            if (from != null) {
                return cb.greaterThanOrEqualTo(root.get("dueDate"), from);
            }
            if (to != null) {
                return cb.lessThanOrEqualTo(root.get("dueDate"), to);
            }
            return cb.conjunction();
        };
    }
}
