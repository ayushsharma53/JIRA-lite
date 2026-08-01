package com.jirolite.task.dto;

import com.jirolite.auth.entity.User;
import com.jirolite.project.entity.Project;
import com.jirolite.task.dto.TaskDtos.TaskResponse;
import com.jirolite.task.entity.Task;
import java.util.UUID;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface TaskMapper {
    @Mapping(source = "project.id", target = "projectId")
    @Mapping(source = "project.name", target = "projectName")
    @Mapping(source = "assignee.id", target = "assigneeId")
    @Mapping(source = "assignee.name", target = "assigneeName")
    @Mapping(source = "reporter.id", target = "reporterId")
    @Mapping(source = "reporter.name", target = "reporterName")
    TaskResponse toResponse(Task task);

    @Named("projectId")
    default UUID projectId(Project project) {
        return project == null ? null : project.getId();
    }

    @Named("userId")
    default UUID userId(User user) {
        return user == null ? null : user.getId();
    }
}
