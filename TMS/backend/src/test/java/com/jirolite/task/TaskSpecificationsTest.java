package com.jirolite.task;

import static org.assertj.core.api.Assertions.assertThat;

import com.jirolite.task.entity.TaskPriority;
import com.jirolite.task.entity.TaskStatus;
import com.jirolite.task.service.TaskSpecifications;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class TaskSpecificationsTest {
    @Test
    void buildsCombinedSpecification() {
        var spec = TaskSpecifications.filtered(List.of(UUID.randomUUID()), "jwt", TaskStatus.TODO, TaskPriority.HIGH, null, null, null, null);

        assertThat(spec).isNotNull();
    }
}
