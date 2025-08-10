package com.suriname.analytics.dto;

public record EmployeeStatsDTO(
        Long employeeId,
        String employeeName,
        Long assignedCount,
        Long completedCount,
        Double completionRate,
        Double averageCompletionHours,
        Double averageRating
) {}
