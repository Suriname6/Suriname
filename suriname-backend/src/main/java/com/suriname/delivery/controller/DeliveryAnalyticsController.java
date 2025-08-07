package com.suriname.delivery.controller;

import com.suriname.delivery.service.DeliveryAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 배송 분석 및 통계 API Controller
 */
@RestController
@RequestMapping("/api/delivery/analytics")
@RequiredArgsConstructor
@Slf4j
public class DeliveryAnalyticsController {

    private final DeliveryAnalyticsService analyticsService;

    /**
     * 배송 대시보드 데이터 조회
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDeliveryDashboard() {
        try {
            log.info("배송 대시보드 데이터 요청");
            
            Map<String, Object> dashboard = analyticsService.getDeliveryDashboard();
            
            return ResponseEntity.ok(Map.of(
                "status", 200,
                "data", dashboard,
                "message", "대시보드 데이터 조회 성공"
            ));
            
        } catch (Exception e) {
            log.error("배송 대시보드 조회 실패", e);
            return ResponseEntity.status(500).body(Map.of(
                "status", 500,
                "message", "대시보드 데이터 조회에 실패했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 택배사별 성과 분석
     */
    @GetMapping("/carriers/performance")
    public ResponseEntity<?> getCarrierPerformance() {
        try {
            log.info("택배사 성과 분석 요청");
            
            Map<String, Object> performance = analyticsService.getCarrierPerformanceAnalysis();
            
            return ResponseEntity.ok(Map.of(
                "status", 200,
                "data", performance,
                "message", "택배사 성과 분석 완료"
            ));
            
        } catch (Exception e) {
            log.error("택배사 성과 분석 실패", e);
            return ResponseEntity.status(500).body(Map.of(
                "status", 500,
                "message", "택배사 성과 분석에 실패했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 월별 배송 트렌드
     */
    @GetMapping("/trends/monthly")
    public ResponseEntity<?> getMonthlyTrends() {
        try {
            log.info("월별 트렌드 분석 요청");
            
            Map<String, Object> trends = analyticsService.getMonthlyTrends();
            
            return ResponseEntity.ok(Map.of(
                "status", 200,
                "data", trends,
                "message", "월별 트렌드 분석 완료"
            ));
            
        } catch (Exception e) {
            log.error("월별 트렌드 분석 실패", e);
            return ResponseEntity.status(500).body(Map.of(
                "status", 500,
                "message", "월별 트렌드 분석에 실패했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 배송 성과 요약 (간단한 지표)
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getDeliverySummary() {
        try {
            log.info("배송 성과 요약 요청");
            
            Map<String, Object> dashboard = analyticsService.getDeliveryDashboard();
            
            // 핵심 지표만 추출
            Map<String, Object> summary = Map.of(
                "totalDeliveries", dashboard.get("totalDeliveries"),
                "completionRate", ((Map<String, Object>) dashboard.get("performanceMetrics")).get("completionRate"),
                "averageDeliveryTime", ((Map<String, Object>) dashboard.get("performanceMetrics")).get("averageDeliveryTime"),
                "topCarrier", ((Map<String, Object>) ((Map<String, Object>) dashboard.get("carrierStats"))).get("topCarrier"),
                "pendingCount", dashboard.get("pendingCount"),
                "deliveredCount", dashboard.get("deliveredCount")
            );
            
            return ResponseEntity.ok(Map.of(
                "status", 200,
                "data", summary,
                "message", "배송 성과 요약 조회 완료"
            ));
            
        } catch (Exception e) {
            log.error("배송 성과 요약 조회 실패", e);
            return ResponseEntity.status(500).body(Map.of(
                "status", 500,
                "message", "배송 성과 요약 조회에 실패했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 실시간 배송 현황 (WebSocket에서도 사용)
     */
    @GetMapping("/realtime")
    public ResponseEntity<?> getRealtimeStatus() {
        try {
            log.info("실시간 배송 현황 요청");
            
            Map<String, Object> dashboard = analyticsService.getDeliveryDashboard();
            
            // 실시간 현황 데이터 추출
            Map<String, Object> realtime = Map.of(
                "timestamp", System.currentTimeMillis(),
                "pendingCount", dashboard.get("pendingCount"),
                "shippedCount", dashboard.get("shippedCount"),
                "deliveredCount", dashboard.get("deliveredCount"),
                "recentDeliveries", dashboard.get("recentDeliveries"),
                "dailyStats", dashboard.get("dailyStats")
            );
            
            return ResponseEntity.ok(Map.of(
                "status", 200,
                "data", realtime,
                "message", "실시간 현황 조회 완료"
            ));
            
        } catch (Exception e) {
            log.error("실시간 현황 조회 실패", e);
            return ResponseEntity.status(500).body(Map.of(
                "status", 500,
                "message", "실시간 현황 조회에 실패했습니다: " + e.getMessage()
            ));
        }
    }
}