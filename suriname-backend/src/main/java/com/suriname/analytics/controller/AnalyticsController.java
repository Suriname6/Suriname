package com.suriname.analytics.controller;

import com.suriname.analytics.dto.SummaryResponseDTO;
import com.suriname.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<SummaryResponseDTO> getTodayRequestCount(
            @RequestParam(defaultValue = "TODAY") String period
    ) {
        return ResponseEntity.ok(analyticsService.getSummary(period));
    }
}
