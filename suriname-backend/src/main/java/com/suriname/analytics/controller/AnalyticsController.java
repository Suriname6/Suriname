package com.suriname.analytics.controller;

import com.suriname.analytics.dto.*;
import com.suriname.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    @GetMapping("/statistics")
    public ResponseEntity<StatisticResponseDTO> getTodayRequestCount() {
        return ResponseEntity.ok(analyticsService.getStatistic());
    }

    @GetMapping("/status-count")
    public StatusCountDTO getStatusCount() {
        return analyticsService.getStatusCount();
    }

    /**
     * 카테고리별 A/S 건수 조회
     */
//    @GetMapping("/as-count-by-category")
//    public List<CategoryCountDTO> getAsCountByCategory() {
//        return analyticsService.getAsCountByCategory();
//    }

    @GetMapping("/employees")
    public List<EmployeeStatsDTO> getEmployeeStats() {
        return analyticsService.getEmployeeStats();
    }
}
