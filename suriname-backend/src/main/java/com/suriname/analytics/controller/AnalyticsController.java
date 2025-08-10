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

    // 카드 통계
    @GetMapping("/statistics")
    public ResponseEntity<StatisticResponseDTO> getTodayRequestCount() {
        return ResponseEntity.ok(analyticsService.getStatistic());
    }

    // 처리 단계별 현황
    @GetMapping("/status-count")
    public StatusCountDTO getStatusCount() {
        return analyticsService.getStatusCount();
    }

    // 제품별 A/S 건수 (TOP 6)
   @GetMapping("/category-as-count")
   public List<CategoryAsCountDTO> getCategoryAsCount() {
       return analyticsService.getCategoryAsCount();
   }

    @GetMapping("/employees")
    public List<EmployeeStatsDTO> getEmployeeStats() {
        return analyticsService.getEmployeeStats();
    }
}
