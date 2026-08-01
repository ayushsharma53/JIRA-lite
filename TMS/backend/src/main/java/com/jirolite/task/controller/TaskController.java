package com.jirolite.task.controller;

import com.jirolite.task.dto.TaskDtos.AssignTaskRequest;
import com.jirolite.task.dto.TaskDtos.TaskRequest;
import com.jirolite.task.dto.TaskDtos.TaskResponse;
import com.jirolite.task.dto.TaskDtos.UpdatePriorityRequest;
import com.jirolite.task.dto.TaskDtos.UpdateStatusRequest;
import com.jirolite.task.entity.TaskPriority;
import com.jirolite.task.entity.TaskStatus;
import com.jirolite.task.service.TaskService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    TaskResponse create(@Valid @RequestBody TaskRequest request, Principal principal) {
        return taskService.create(request, principal.getName());
    }

    @GetMapping
    Page<TaskResponse> search(@RequestParam(required = false) String keyword,
                              @RequestParam(required = false) TaskStatus status,
                              @RequestParam(required = false) TaskPriority priority,
                              @RequestParam(required = false) UUID assigneeId,
                              @RequestParam(required = false) UUID projectId,
                              @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                              @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
                              Pageable pageable,
                              Principal principal) {
        return taskService.search(keyword, status, priority, assigneeId, projectId, from, to, pageable, principal.getName());
    }

    @PutMapping("/{id}")
    TaskResponse update(@PathVariable UUID id, @Valid @RequestBody TaskRequest request, Principal principal) {
        return taskService.update(id, request, principal.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void delete(@PathVariable UUID id, Principal principal) {
        taskService.delete(id, principal.getName());
    }

    @PatchMapping("/{id}/assign")
    TaskResponse assign(@PathVariable UUID id, @RequestBody AssignTaskRequest request, Principal principal) {
        return taskService.assign(id, request, principal.getName());
    }

    @PatchMapping("/{id}/status")
    TaskResponse updateStatus(@PathVariable UUID id, @Valid @RequestBody UpdateStatusRequest request, Principal principal) {
        return taskService.updateStatus(id, request, principal.getName());
    }

    @PatchMapping("/{id}/priority")
    TaskResponse updatePriority(@PathVariable UUID id, @Valid @RequestBody UpdatePriorityRequest request, Principal principal) {
        return taskService.updatePriority(id, request, principal.getName());
    }
}
