package com.suriname.analytics.dto;



public record SummaryResponseDTO(
        int newRequestCount,
        int inProgressCount,
        int completedCount,
        int totalRequestCount
) {}