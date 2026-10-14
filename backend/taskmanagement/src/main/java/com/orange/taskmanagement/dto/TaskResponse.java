
package com.orange.taskmanagement.dto;

import com.orange.taskmanagement.enums.TaskPriority;
import com.orange.taskmanagement.enums.TaskStatus;

import java.time.LocalDate;

public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskPriority priority,
        TaskStatus status,
        LocalDate dueDate,
        Long projectId,
        String projectName,
        Long categoryId,
        String categoryName
) {
}