
package com.orange.taskmanagement.dto;

import com.orange.taskmanagement.enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ProjectRequest(

        @NotBlank
        @Size(max = 30)
        String projectCode,

        @NotBlank
        @Size(max = 150)
        String name,

        @Size(max = 255)
        String description,

        LocalDate startDate,

        LocalDate endDate,

        @NotNull
        ProjectStatus status
) {
}