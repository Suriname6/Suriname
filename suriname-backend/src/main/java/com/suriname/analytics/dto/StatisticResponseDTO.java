package com.suriname.analytics.dto;

public record StatisticResponseDTO(

        long totalRequestCount,
        long todayRequestCount,
        long uncompletedCount,
        double completedRatio,
        long totalRevenue,
        double averageRepairCost

) {}