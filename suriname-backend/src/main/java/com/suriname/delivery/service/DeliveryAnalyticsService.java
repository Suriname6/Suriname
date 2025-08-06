package com.suriname.delivery.service;

import com.suriname.delivery.entity.Delivery;
import com.suriname.delivery.repository.DeliveryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 배송 분석 및 통계 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryAnalyticsService {

    private final DeliveryRepository deliveryRepository;

    /**
     * 배송 대시보드 전체 통계
     */
    public Map<String, Object> getDeliveryDashboard() {
        try {
            log.info("배송 대시보드 데이터 조회 시작");
            
            // 전체 배송 데이터 조회
            List<Delivery> allDeliveries = deliveryRepository.findAll();
            
            // 최근 30일 데이터
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            List<Delivery> recentDeliveries = allDeliveries.stream()
                    .filter(d -> d.getCreatedAt().isAfter(thirtyDaysAgo))
                    .collect(Collectors.toList());

            Map<String, Object> dashboard = new HashMap<>();
            
            // 1. 기본 통계
            dashboard.put("totalDeliveries", allDeliveries.size());
            dashboard.put("recentDeliveries", recentDeliveries.size());
            dashboard.put("pendingCount", countByStatus(allDeliveries, "PENDING"));
            dashboard.put("shippedCount", countByStatus(allDeliveries, "SHIPPED"));
            dashboard.put("deliveredCount", countByStatus(allDeliveries, "DELIVERED"));
            
            // 2. 택배사별 통계
            dashboard.put("carrierStats", getCarrierStatistics(allDeliveries));
            
            // 3. 일별 배송 현황 (최근 7일)
            dashboard.put("dailyStats", getDailyStatistics(recentDeliveries));
            
            // 4. 성과 지표
            dashboard.put("performanceMetrics", getPerformanceMetrics(allDeliveries));
            
            // 5. 지역별 통계 (상위 10개)
            dashboard.put("regionStats", getRegionStatistics(allDeliveries));

            log.info("배송 대시보드 데이터 조회 완료: 총 {}건", allDeliveries.size());
            return dashboard;
            
        } catch (Exception e) {
            log.error("배송 대시보드 조회 실패", e);
            throw new RuntimeException("대시보드 데이터 조회에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 택배사별 성과 분석
     */
    public Map<String, Object> getCarrierPerformanceAnalysis() {
        try {
            log.info("택배사 성과 분석 시작");
            
            List<Delivery> allDeliveries = deliveryRepository.findAll();
            Map<String, List<Delivery>> carrierGroups = allDeliveries.stream()
                    .filter(d -> d.getCarrierName() != null)
                    .collect(Collectors.groupingBy(Delivery::getCarrierName));

            Map<String, Object> analysis = new HashMap<>();
            
            for (Map.Entry<String, List<Delivery>> entry : carrierGroups.entrySet()) {
                String carrier = entry.getKey();
                List<Delivery> deliveries = entry.getValue();
                
                Map<String, Object> carrierData = new HashMap<>();
                carrierData.put("totalCount", deliveries.size());
                carrierData.put("deliveredCount", countByStatus(deliveries, "DELIVERED"));
                carrierData.put("averageDeliveryTime", calculateAverageDeliveryTime(deliveries));
                carrierData.put("successRate", calculateSuccessRate(deliveries));
                
                analysis.put(carrier, carrierData);
            }
            
            log.info("택배사 성과 분석 완료: {}개 택배사", analysis.size());
            return analysis;
            
        } catch (Exception e) {
            log.error("택배사 성과 분석 실패", e);
            throw new RuntimeException("택배사 성과 분석에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 월별 배송 트렌드 분석
     */
    public Map<String, Object> getMonthlyTrends() {
        try {
            log.info("월별 트렌드 분석 시작");
            
            // 최근 12개월 데이터
            LocalDateTime twelveMonthsAgo = LocalDateTime.now().minusMonths(12);
            List<Delivery> deliveries = deliveryRepository.findAll().stream()
                    .filter(d -> d.getCreatedAt().isAfter(twelveMonthsAgo))
                    .collect(Collectors.toList());

            // 월별 그룹핑
            Map<String, List<Delivery>> monthlyGroups = deliveries.stream()
                    .collect(Collectors.groupingBy(d -> 
                        d.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM"))
                    ));

            Map<String, Object> trends = new HashMap<>();
            
            for (Map.Entry<String, List<Delivery>> entry : monthlyGroups.entrySet()) {
                String month = entry.getKey();
                List<Delivery> monthlyDeliveries = entry.getValue();
                
                Map<String, Object> monthData = new HashMap<>();
                monthData.put("totalCount", monthlyDeliveries.size());
                monthData.put("deliveredCount", countByStatus(monthlyDeliveries, "DELIVERED"));
                monthData.put("avgDeliveryTime", calculateAverageDeliveryTime(monthlyDeliveries));
                
                trends.put(month, monthData);
            }
            
            log.info("월별 트렌드 분석 완료: {}개월 데이터", trends.size());
            return trends;
            
        } catch (Exception e) {
            log.error("월별 트렌드 분석 실패", e);
            throw new RuntimeException("월별 트렌드 분석에 실패했습니다: " + e.getMessage());
        }
    }

    // === 내부 유틸리티 메서드들 ===
    
    private long countByStatus(List<Delivery> deliveries, String status) {
        return deliveries.stream()
                .filter(d -> status.equals(d.getStatus().name()))
                .count();
    }

    private Map<String, Object> getCarrierStatistics(List<Delivery> deliveries) {
        Map<String, Long> carrierCounts = deliveries.stream()
                .filter(d -> d.getCarrierName() != null)
                .collect(Collectors.groupingBy(
                    Delivery::getCarrierName, 
                    Collectors.counting()
                ));
        
        return Map.of(
            "distribution", carrierCounts,
            "topCarrier", getTopCarrier(carrierCounts)
        );
    }

    private Map<String, Object> getDailyStatistics(List<Delivery> deliveries) {
        Map<String, Long> dailyCounts = deliveries.stream()
                .collect(Collectors.groupingBy(
                    d -> d.getCreatedAt().format(DateTimeFormatter.ofPattern("MM-dd")),
                    Collectors.counting()
                ));
        
        return Map.of(
            "dailyCounts", dailyCounts,
            "averagePerDay", deliveries.size() / Math.max(1, dailyCounts.size())
        );
    }

    private Map<String, Object> getPerformanceMetrics(List<Delivery> deliveries) {
        long totalDeliveries = deliveries.size();
        long completedDeliveries = countByStatus(deliveries, "DELIVERED");
        
        return Map.of(
            "completionRate", totalDeliveries > 0 ? (double) completedDeliveries / totalDeliveries * 100 : 0,
            "averageDeliveryTime", calculateAverageDeliveryTime(deliveries),
            "onTimeDeliveryRate", calculateOnTimeRate(deliveries)
        );
    }

    private Map<String, Long> getRegionStatistics(List<Delivery> deliveries) {
        return deliveries.stream()
                .filter(d -> d.getAddress() != null)
                .collect(Collectors.groupingBy(
                    d -> extractRegion(d.getAddress()),
                    Collectors.counting()
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .collect(Collectors.toMap(
                    Map.Entry::getKey,
                    Map.Entry::getValue,
                    (e1, e2) -> e1,
                    LinkedHashMap::new
                ));
    }

    private String getTopCarrier(Map<String, Long> carrierCounts) {
        return carrierCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");
    }

    private double calculateAverageDeliveryTime(List<Delivery> deliveries) {
        List<Delivery> completedDeliveries = deliveries.stream()
                .filter(d -> d.getStatus() == Delivery.Status.DELIVERED && d.getCompletedDate() != null)
                .collect(Collectors.toList());
        
        if (completedDeliveries.isEmpty()) return 0.0;
        
        double totalHours = completedDeliveries.stream()
                .mapToDouble(d -> java.time.Duration.between(d.getCreatedAt(), d.getCompletedDate()).toHours())
                .sum();
        
        return totalHours / completedDeliveries.size();
    }

    private double calculateSuccessRate(List<Delivery> deliveries) {
        if (deliveries.isEmpty()) return 0.0;
        
        long successCount = countByStatus(deliveries, "DELIVERED");
        return (double) successCount / deliveries.size() * 100;
    }

    private double calculateOnTimeRate(List<Delivery> deliveries) {
        // 3일 이내 배송을 정시 배송으로 간주
        List<Delivery> completedDeliveries = deliveries.stream()
                .filter(d -> d.getStatus() == Delivery.Status.DELIVERED && d.getCompletedDate() != null)
                .collect(Collectors.toList());
        
        if (completedDeliveries.isEmpty()) return 0.0;
        
        long onTimeCount = completedDeliveries.stream()
                .filter(d -> java.time.Duration.between(d.getCreatedAt(), d.getCompletedDate()).toDays() <= 3)
                .count();
        
        return (double) onTimeCount / completedDeliveries.size() * 100;
    }

    private String extractRegion(String address) {
        // 주소에서 시/도 추출 (간단한 로직)
        if (address.contains("서울")) return "서울";
        if (address.contains("부산")) return "부산";
        if (address.contains("대구")) return "대구";
        if (address.contains("인천")) return "인천";
        if (address.contains("광주")) return "광주";
        if (address.contains("대전")) return "대전";
        if (address.contains("울산")) return "울산";
        if (address.contains("경기")) return "경기";
        if (address.contains("강원")) return "강원";
        if (address.contains("충북")) return "충북";
        if (address.contains("충남")) return "충남";
        if (address.contains("전북")) return "전북";
        if (address.contains("전남")) return "전남";
        if (address.contains("경북")) return "경북";
        if (address.contains("경남")) return "경남";
        if (address.contains("제주")) return "제주";
        return "기타";
    }
}