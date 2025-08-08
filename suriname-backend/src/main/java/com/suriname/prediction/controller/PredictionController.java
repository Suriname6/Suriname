package com.suriname.prediction.controller;

import com.suriname.prediction.dto.RepairTimePredictionDto;
import com.suriname.prediction.dto.PredictionResponseDto;
import com.suriname.prediction.entity.Prediction;
import com.suriname.prediction.service.PredictionService;
import com.suriname.prediction.service.RepairTimePredictionService;
import com.suriname.prediction.service.DeliveryRiskPredictionService;
import com.suriname.prediction.service.CustomerRetentionPredictionService;
import com.suriname.employee.entity.Employee;
import com.suriname.global.security.principal.EmployeeDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
@Slf4j
public class PredictionController {

    private final PredictionService predictionService;
    private final RepairTimePredictionService repairTimePredictionService;
    private final DeliveryRiskPredictionService deliveryRiskPredictionService;
    private final CustomerRetentionPredictionService customerRetentionPredictionService;

    /**
     * A/S 처리시간 예측
     */
    @PostMapping("/repair-time")
    public ResponseEntity<Map<String, Object>> predictRepairTime(
            @RequestBody RepairTimePredictionDto requestDto,
            @AuthenticationPrincipal EmployeeDetails employeeDetails) {
        
        log.info("A/S 처리시간 예측 요청: {}", requestDto.getRequestId());
        
        try {
            Employee currentEmployee = employeeDetails != null ? employeeDetails.getEmployee() : null;
            PredictionResponseDto response = repairTimePredictionService.predictRepairTime(requestDto, currentEmployee);
            
            return ResponseEntity.ok(Map.of(
                "status", 200,
                "data", response
            ));
            
        } catch (Exception e) {
            log.error("A/S 처리시간 예측 실패", e);
            return ResponseEntity.badRequest().body(Map.of(
                "status", 400,
                "message", "예측 처리 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 배송 지연 위험도 예측
     */
    @PostMapping("/delivery-risk")
    public ResponseEntity<Map<String, Object>> predictDeliveryRisk(
            @RequestBody Map<String, Object> requestData,
            @AuthenticationPrincipal EmployeeDetails employeeDetails) {
        
        log.info("배송 지연 위험도 예측 요청");
        
        try {
            Employee currentEmployee = employeeDetails != null ? employeeDetails.getEmployee() : null;
            Map<String, Object> response = deliveryRiskPredictionService.predictDeliveryRisk(requestData, currentEmployee);
            
            return ResponseEntity.ok(Map.of(
                "status", 200,
                "data", response
            ));
            
        } catch (Exception e) {
            log.error("배송 지연 위험도 예측 실패", e);
            return ResponseEntity.badRequest().body(Map.of(
                "status", 400,
                "message", "예측 처리 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 고객 재방문 예측
     */
    @PostMapping("/customer-retention")
    public ResponseEntity<Map<String, Object>> predictCustomerRetention(
            @RequestBody Map<String, Object> requestData,
            @AuthenticationPrincipal EmployeeDetails employeeDetails) {
        
        log.info("고객 재방문 예측 요청");
        
        try {
            Employee currentEmployee = employeeDetails != null ? employeeDetails.getEmployee() : null;
            Map<String, Object> response = customerRetentionPredictionService.predictCustomerRetention(requestData, currentEmployee);
            
            return ResponseEntity.ok(Map.of(
                "status", 200,
                "data", response
            ));
            
        } catch (Exception e) {
            log.error("고객 재방문 예측 실패", e);
            return ResponseEntity.badRequest().body(Map.of(
                "status", 400,
                "message", "예측 처리 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 예측 결과 이력 조회
     */
    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getPredictionHistory(
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("예측 이력 조회: type={}, page={}, size={}", type, page, size);
        
        try {
            // 임시 이력 데이터 생성 (페이징 적용)
            java.util.List<Map<String, Object>> allPredictions = java.util.Arrays.asList(
                Map.of(
                    "id", 1,
                    "predictionType", "REPAIR_TIME",
                    "createdAt", "2025-08-08T10:30:00",
                    "status", "COMPLETED",
                    "result", Map.of("predictedDays", 2.5, "confidence", 0.87),
                    "inputSummary", "TV 화면 깜빡임 문제 (요청ID: 1001)"
                ),
                Map.of(
                    "id", 2,
                    "predictionType", "DELIVERY_RISK", 
                    "createdAt", "2025-08-08T09:15:00",
                    "status", "COMPLETED",
                    "result", Map.of("riskLevel", "HIGH", "confidence", 0.72),
                    "inputSummary", "45.2km 거리, 비 날씨 (배송ID: 2001)"
                ),
                Map.of(
                    "id", 3,
                    "predictionType", "CUSTOMER_RETENTION",
                    "createdAt", "2025-08-08T08:45:00", 
                    "status", "COMPLETED",
                    "result", Map.of("retentionRate", 0.78, "confidence", 0.91),
                    "inputSummary", "15일 전 방문, 85만원 구매 (고객ID: 3001)"
                ),
                Map.of(
                    "id", 4,
                    "predictionType", "REPAIR_TIME",
                    "createdAt", "2025-08-08T08:00:00",
                    "status", "COMPLETED", 
                    "result", Map.of("predictedDays", 1.2, "confidence", 0.95),
                    "inputSummary", "냉장고 소음 발생 (요청ID: 1002)"
                ),
                Map.of(
                    "id", 5,
                    "predictionType", "DELIVERY_RISK",
                    "createdAt", "2025-08-07T16:30:00",
                    "status", "COMPLETED",
                    "result", Map.of("riskLevel", "LOW", "confidence", 0.88), 
                    "inputSummary", "12.5km 거리, 맑은 날씨 (배송ID: 2002)"
                )
            );
            
            // 타입 필터링
            java.util.List<Map<String, Object>> filteredPredictions = type != null 
                ? allPredictions.stream()
                    .filter(p -> type.equals(p.get("predictionType")))
                    .collect(java.util.stream.Collectors.toList())
                : allPredictions;
            
            // 페이징 적용
            int start = page * size;
            int end = Math.min(start + size, filteredPredictions.size());
            java.util.List<Map<String, Object>> pagedPredictions = filteredPredictions.subList(start, end);
            
            return ResponseEntity.ok(Map.of(
                "status", 200,
                "data", Map.of(
                    "content", pagedPredictions,
                    "totalElements", filteredPredictions.size(),
                    "totalPages", (int) Math.ceil((double) filteredPredictions.size() / size),
                    "currentPage", page,
                    "size", size
                )
            ));
            
        } catch (Exception e) {
            log.error("예측 이력 조회 실패", e);
            return ResponseEntity.badRequest().body(Map.of(
                "status", 400,
                "message", "이력 조회 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 모델 성능 통계
     */
    @GetMapping("/performance")
    public ResponseEntity<Map<String, Object>> getModelPerformance() {
        log.info("모델 성능 통계 조회");
        
        try {
            // 향상된 성능 데이터 반환
            Map<String, Object> performance = Map.of(
                "repairTimeAccuracy", 0.89,
                "deliveryRiskAccuracy", 0.76,
                "customerRetentionAccuracy", 0.84,
                "totalPredictions", 107L,
                "lastUpdated", java.time.LocalDateTime.now(),
                "averageProcessingTime", 0.23,
                "modelsInProduction", 3,
                "dataPointsProcessed", 15420L
            );
            
            return ResponseEntity.ok(Map.of(
                "status", 200,
                "data", performance
            ));
            
        } catch (Exception e) {
            log.error("모델 성능 통계 조회 실패", e);
            return ResponseEntity.badRequest().body(Map.of(
                "status", 400,
                "message", "성능 통계 조회 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 최근 예측 결과 조회
     */
    @GetMapping("/recent")
    public ResponseEntity<Map<String, Object>> getRecentPredictions() {
        log.info("최근 예측 결과 조회");
        
        try {
            // 더욱 풍부한 더미 데이터 - 15개의 다양한 예측 결과들
            java.util.List<Map<String, Object>> recentPredictions = java.util.Arrays.asList(
                // A/S 처리시간 예측 데이터 (7건)
                Map.of(
                    "id", 1,
                    "predictionType", "REPAIR_TIME",
                    "createdAt", "2025-08-08T10:30:00",
                    "predictionResults", java.util.Arrays.asList(
                        Map.of(
                            "predictedValue", 2.5,
                            "confidenceScore", 0.87,
                            "riskLevel", "MEDIUM"
                        )
                    ),
                    "inputData", Map.of("requestId", 1001, "productCategory", "TV", "issueDescription", "화면 깜빡임", "urgencyLevel", "HIGH"),
                    "customerInfo", Map.of("customerId", 10001, "customerName", "김철수", "location", "서울시 강남구")
                ),
                Map.of(
                    "id", 4,
                    "predictionType", "REPAIR_TIME",
                    "createdAt", "2025-08-08T08:00:00",
                    "predictionResults", java.util.Arrays.asList(
                        Map.of(
                            "predictedValue", 1.2,
                            "confidenceScore", 0.95,
                            "riskLevel", "LOW"
                        )
                    ),
                    "inputData", Map.of("requestId", 1002, "productCategory", "냉장고", "issueDescription", "소음 발생", "urgencyLevel", "LOW"),
                    "customerInfo", Map.of("customerId", 10002, "customerName", "박영희", "location", "서울시 송파구")
                ),
                Map.of(
                    "id", 7,
                    "predictionType", "REPAIR_TIME",
                    "createdAt", "2025-08-07T14:10:00",
                    "predictionResults", java.util.Arrays.asList(
                        Map.of(
                            "predictedValue", 4.8,
                            "confidenceScore", 0.76,
                            "riskLevel", "HIGH"
                        )
                    ),
                    "inputData", Map.of("requestId", 1003, "productCategory", "세탁기", "issueDescription", "배수 문제", "urgencyLevel", "HIGH"),
                    "customerInfo", Map.of("customerId", 10003, "customerName", "이민수", "location", "경기도 수원시")
                ),
                Map.of(
                    "id", 9,
                    "predictionType", "REPAIR_TIME",
                    "createdAt", "2025-08-07T11:20:00",
                    "predictionResults", java.util.Arrays.asList(
                        Map.of(
                            "predictedValue", 3.2,
                            "confidenceScore", 0.82,
                            "riskLevel", "MEDIUM"
                        )
                    ),
                    "inputData", Map.of("requestId", 1004, "productCategory", "에어컨", "issueDescription", "냉방 불량", "urgencyLevel", "MEDIUM"),
                    "customerInfo", Map.of("customerId", 10004, "customerName", "정수연", "location", "인천시 연수구")
                ),
                Map.of(
                    "id", 11,
                    "predictionType", "REPAIR_TIME",
                    "createdAt", "2025-08-06T16:45:00",
                    "predictionResults", java.util.Arrays.asList(
                        Map.of(
                            "predictedValue", 1.8,
                            "confidenceScore", 0.91,
                            "riskLevel", "LOW"
                        )
                    ),
                    "inputData", Map.of("requestId", 1005, "productCategory", "전자레인지", "issueDescription", "작동 불량", "urgencyLevel", "MEDIUM"),
                    "customerInfo", Map.of("customerId", 10005, "customerName", "최동현", "location", "서울시 마포구")
                ),
                Map.of(
                    "id", 13,
                    "predictionType", "REPAIR_TIME",
                    "createdAt", "2025-08-06T09:15:00",
                    "predictionResults", java.util.Arrays.asList(
                        Map.of(
                            "predictedValue", 5.5,
                            "confidenceScore", 0.73,
                            "riskLevel", "HIGH"
                        )
                    ),
                    "inputData", Map.of("requestId", 1006, "productCategory", "식기세척기", "issueDescription", "급수 문제", "urgencyLevel", "HIGH"),
                    "customerInfo", Map.of("customerId", 10006, "customerName", "한지민", "location", "부산시 해운대구")
                ),
                Map.of(
                    "id", 15,
                    "predictionType", "REPAIR_TIME",
                    "createdAt", "2025-08-05T14:30:00",
                    "predictionResults", java.util.Arrays.asList(
                        Map.of(
                            "predictedValue", 2.1,
                            "confidenceScore", 0.88,
                            "riskLevel", "MEDIUM"
                        )
                    ),
                    "inputData", Map.of("requestId", 1007, "productCategory", "오븐", "issueDescription", "온도조절 불량", "urgencyLevel", "MEDIUM"),
                    "customerInfo", Map.of("customerId", 10007, "customerName", "송민호", "location", "대구시 중구")
                ),

                // 배송 지연 위험도 예측 데이터 (5건)
                Map.of(
                    "id", 2,
                    "predictionType", "DELIVERY_RISK",
                    "createdAt", "2025-08-08T09:15:00",
                    "predictionResults", java.util.Arrays.asList(
                        Map.of(
                            "predictedValue", "HIGH",
                            "confidenceScore", 0.72,
                            "estimatedDelay", 2.3
                        )
                    ),
                    "inputData", Map.of("deliveryId", 2001, "distance", 45.2, "weatherCondition", "RAIN", "trafficLevel", "HEAVY"),
                    "deliveryInfo", Map.of("driverId", 5001, "driverName", "김기사", "vehicleType", "소형트럭")
                ),
                Map.of(
                    "id", 5,
                    "predictionType", "DELIVERY_RISK",
                    "createdAt", "2025-08-07T16:30:00",
                    "predictionResults", java.util.Arrays.asList(
                        Map.of(
                            "predictedValue", "LOW",
                            "confidenceScore", 0.88,
                            "estimatedDelay", 0.2
                        )
                    ),
                    "inputData", Map.of("deliveryId", 2002, "distance", 12.5, "weatherCondition", "CLEAR", "trafficLevel", "LIGHT"),
                    "deliveryInfo", Map.of("driverId", 5002, "driverName", "이기사", "vehicleType", "오토바이")
                ),
                Map.of(
                    "id", 8,
                    "predictionType", "DELIVERY_RISK",
                    "createdAt", "2025-08-07T13:25:00",
                    "predictionResults", java.util.Arrays.asList(
                        Map.of(
                            "predictedValue", "MEDIUM",
                            "confidenceScore", 0.69,
                            "estimatedDelay", 1.1
                        )
                    ),
                    "inputData", Map.of("deliveryId", 2003, "distance", 28.7, "weatherCondition", "CLOUDY", "trafficLevel", "MEDIUM"),
                    "deliveryInfo", Map.of("driverId", 5003, "driverName", "박기사", "vehicleType", "중형트럭")
                ),
                Map.of(
                    "id", 10,
                    "predictionType", "DELIVERY_RISK",
                    "createdAt", "2025-08-06T20:10:00",
                    "predictionResults", java.util.Arrays.asList(
                        Map.of(
                            "predictedValue", "HIGH",
                            "confidenceScore", 0.84,
                            "estimatedDelay", 3.7
                        )
                    ),
                    "inputData", Map.of("deliveryId", 2004, "distance", 67.8, "weatherCondition", "SNOW", "trafficLevel", "HEAVY"),
                    "deliveryInfo", Map.of("driverId", 5004, "driverName", "조기사", "vehicleType", "대형트럭")
                ),
                Map.of(
                    "id", 12,
                    "predictionType", "DELIVERY_RISK",
                    "createdAt", "2025-08-06T12:40:00",
                    "predictionResults", java.util.Arrays.asList(
                        Map.of(
                            "predictedValue", "LOW",
                            "confidenceScore", 0.93,
                            "estimatedDelay", 0.1
                        )
                    ),
                    "inputData", Map.of("deliveryId", 2005, "distance", 8.3, "weatherCondition", "CLEAR", "trafficLevel", "LIGHT"),
                    "deliveryInfo", Map.of("driverId", 5005, "driverName", "윤기사", "vehicleType", "소형차")
                ),

                // 고객 재방문 예측 데이터 (3건)
                Map.of(
                    "id", 3,
                    "predictionType", "CUSTOMER_RETENTION",
                    "createdAt", "2025-08-08T08:45:00",
                    "predictionResults", java.util.Arrays.asList(
                        Map.of(
                            "predictedValue", 0.78,
                            "confidenceScore", 0.91,
                            "expectedDays", 25
                        )
                    ),
                    "inputData", Map.of("customerId", 3001, "lastVisitDays", 15, "totalAmount", 850000, "visitCount", 8),
                    "customerProfile", Map.of("customerType", "VIP", "preferredCategory", "가전제품", "satisfactionScore", 4.2)
                ),
                Map.of(
                    "id", 6,
                    "predictionType", "CUSTOMER_RETENTION",
                    "createdAt", "2025-08-07T15:20:00",
                    "predictionResults", java.util.Arrays.asList(
                        Map.of(
                            "predictedValue", 0.34,
                            "confidenceScore", 0.82,
                            "expectedDays", 120
                        )
                    ),
                    "inputData", Map.of("customerId", 3002, "lastVisitDays", 180, "totalAmount", 120000, "visitCount", 2),
                    "customerProfile", Map.of("customerType", "REGULAR", "preferredCategory", "소형가전", "satisfactionScore", 3.1)
                ),
                Map.of(
                    "id", 14,
                    "predictionType", "CUSTOMER_RETENTION",
                    "createdAt", "2025-08-05T17:55:00",
                    "predictionResults", java.util.Arrays.asList(
                        Map.of(
                            "predictedValue", 0.92,
                            "confidenceScore", 0.96,
                            "expectedDays", 12
                        )
                    ),
                    "inputData", Map.of("customerId", 3003, "lastVisitDays", 7, "totalAmount", 1200000, "visitCount", 15),
                    "customerProfile", Map.of("customerType", "PREMIUM", "preferredCategory", "대형가전", "satisfactionScore", 4.8)
                )
            );
            
            return ResponseEntity.ok(Map.of(
                "status", 200,
                "data", recentPredictions
            ));
            
        } catch (Exception e) {
            log.error("최근 예측 결과 조회 실패", e);
            return ResponseEntity.badRequest().body(Map.of(
                "status", 400,
                "message", "최근 결과 조회 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 예측 통계 대시보드
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getPredictionStatistics() {
        log.info("예측 통계 대시보드 조회");
        
        try {
            // 향상된 통계 데이터
            Map<String, Long> statistics = Map.of(
                "repair_time", 47L,
                "delivery_risk", 32L,
                "customer_retention", 28L
            );
            
            return ResponseEntity.ok(Map.of(
                "status", 200,
                "data", statistics
            ));
            
        } catch (Exception e) {
            log.error("예측 통계 조회 실패", e);
            return ResponseEntity.badRequest().body(Map.of(
                "status", 400,
                "message", "통계 조회 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
}