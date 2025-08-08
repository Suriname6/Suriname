package com.suriname.prediction.service;

import com.suriname.prediction.entity.Prediction;
import com.suriname.prediction.entity.PredictionResult;
import com.suriname.prediction.repository.PredictionRepository;
import com.suriname.prediction.repository.PredictionResultRepository;
import com.suriname.prediction.ml.WekaModelManager;
import com.suriname.delivery.entity.Delivery;
import com.suriname.employee.entity.Employee;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

/**
 * 배송 지연 위험도 예측 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class DeliveryRiskPredictionService {

    private final PredictionRepository predictionRepository;
    private final PredictionResultRepository predictionResultRepository;
    private final WekaModelManager wekaModelManager;
    
    private final Random random = new Random();

    /**
     * 배송 지연 위험도 예측
     */
    public Map<String, Object> predictDeliveryRisk(Map<String, Object> requestData, Employee currentEmployee) {
        log.info("배송 지연 위험도 예측 시작");

        try {
            // 입력 데이터 파싱
            String deliveryAddress = (String) requestData.getOrDefault("deliveryAddress", "");
            String productType = (String) requestData.getOrDefault("productType", "기타");
            Double productWeight = parseDouble(requestData.get("productWeight"), 10.0);
            String carrierName = (String) requestData.getOrDefault("carrierName", "일반택배");
            
            // 배송 거리 추정 (주소 기반)
            double deliveryDistance = estimateDeliveryDistance(deliveryAddress);
            
            // 날씨 조건 추정 (현재 시즌 기반)
            int weatherCondition = estimateWeatherCondition();
            
            // 교통 상황 추정 (지역 기반)
            int trafficCondition = estimateTrafficCondition(deliveryAddress);
            
            // 배송업체 신뢰도
            int carrierReliability = estimateCarrierReliability(carrierName);
            
            // ML 모델로 위험도 예측
            double riskScore = wekaModelManager.predictDeliveryRisk(
                deliveryDistance, weatherCondition, trafficCondition, 
                carrierReliability, productWeight
            );
            
            // 예상 배송일 계산
            LocalDate expectedDeliveryDate = calculateExpectedDeliveryDate(riskScore);
            
            // 신뢰도 계산
            double confidence = calculateConfidence(deliveryDistance, weatherCondition, 
                                                 trafficCondition, carrierReliability);
            
            // 예측 결과 저장
            savePredictionResult(requestData, riskScore, confidence, currentEmployee);
            
            // 설명 생성
            String explanation = generateExplanation(deliveryAddress, riskScore, 
                                                   expectedDeliveryDate, carrierName);
            
            log.info("배송 지연 위험도 예측 완료: 위험도={}, 예상배송일={}", riskScore, expectedDeliveryDate);
            
            return Map.of(
                "riskScore", Math.round(riskScore * 100) / 100.0,
                "riskLevel", getRiskLevel(riskScore),
                "expectedDeliveryDate", expectedDeliveryDate.toString(),
                "confidence", Math.round(confidence * 100) / 100.0,
                "explanation", explanation,
                "recommendations", generateRecommendations(riskScore),
                "factors", Map.of(
                    "distance", deliveryDistance,
                    "weather", weatherCondition,
                    "traffic", trafficCondition,
                    "carrier", carrierReliability,
                    "weight", productWeight
                )
            );
            
        } catch (Exception e) {
            log.error("배송 지연 위험도 예측 실패", e);
            return getDefaultPrediction();
        }
    }

    /**
     * 배송 거리 추정
     */
    private double estimateDeliveryDistance(String address) {
        if (address == null || address.trim().isEmpty()) {
            return 50.0; // 기본값
        }
        
        // 서울, 수도권 지역 판별
        if (address.contains("서울") || address.contains("인천") || address.contains("경기")) {
            return 20 + random.nextDouble() * 40; // 20-60km
        } else if (address.contains("부산") || address.contains("대구") || 
                  address.contains("대전") || address.contains("광주")) {
            return 200 + random.nextDouble() * 100; // 200-300km
        } else {
            return 100 + random.nextDouble() * 200; // 100-300km
        }
    }

    /**
     * 날씨 조건 추정 (1-5, 5가 최악)
     */
    private int estimateWeatherCondition() {
        int month = LocalDate.now().getMonthValue();
        
        // 겨울철 (12,1,2월)
        if (month == 12 || month <= 2) {
            return 4; // 눈, 추위로 배송 어려움
        }
        // 여름철 장마 (6,7,8월)
        else if (month >= 6 && month <= 8) {
            return 3; // 비, 태풍 가능성
        }
        // 봄, 가을
        else {
            return 2; // 좋은 날씨
        }
    }

    /**
     * 교통 상황 추정 (1-5, 5가 최악)
     */
    private int estimateTrafficCondition(String address) {
        if (address == null) {
            return 3;
        }
        
        if (address.contains("서울") || address.contains("경기")) {
            return 4; // 수도권 교통 혼잡
        } else if (address.contains("부산") || address.contains("대구")) {
            return 3; // 중간 정도
        } else {
            return 2; // 지방은 교통이 원활
        }
    }

    /**
     * 배송업체 신뢰도 추정 (1-5, 5가 최고)
     */
    private int estimateCarrierReliability(String carrierName) {
        if (carrierName == null) {
            return 3;
        }
        
        switch (carrierName.toLowerCase()) {
            case "cj대한통운":
            case "한진택배":
                return 5; // 높은 신뢰도
            case "롯데택배":
            case "우체국택배":
                return 4; // 양호한 신뢰도
            case "로젠택배":
                return 3; // 보통
            default:
                return 3; // 기본값
        }
    }

    /**
     * 예상 배송일 계산
     */
    private LocalDate calculateExpectedDeliveryDate(double riskScore) {
        LocalDate today = LocalDate.now();
        
        if (riskScore < 0.3) {
            return today.plusDays(1); // 다음날 배송
        } else if (riskScore < 0.5) {
            return today.plusDays(2); // 2일 후 배송
        } else if (riskScore < 0.7) {
            return today.plusDays(3); // 3일 후 배송
        } else {
            return today.plusDays(4 + random.nextInt(3)); // 4-6일 후 배송
        }
    }

    /**
     * 신뢰도 계산
     */
    private double calculateConfidence(double distance, int weather, int traffic, int reliability) {
        double confidence = 0.7; // 기본 신뢰도
        
        // 거리가 가까우면 신뢰도 증가
        if (distance < 50) {
            confidence += 0.1;
        }
        
        // 좋은 날씨면 신뢰도 증가
        if (weather <= 2) {
            confidence += 0.1;
        }
        
        // 교통이 좋으면 신뢰도 증가
        if (traffic <= 2) {
            confidence += 0.05;
        }
        
        // 신뢰할 만한 업체면 신뢰도 증가
        if (reliability >= 4) {
            confidence += 0.05;
        }
        
        return Math.min(confidence, 0.95);
    }

    /**
     * 위험도 레벨 분류
     */
    private String getRiskLevel(double riskScore) {
        if (riskScore < 0.3) {
            return "LOW";
        } else if (riskScore < 0.6) {
            return "MEDIUM";
        } else {
            return "HIGH";
        }
    }

    /**
     * 설명 생성
     */
    private String generateExplanation(String address, double riskScore, 
                                     LocalDate expectedDate, String carrier) {
        String riskLevel = getRiskLevel(riskScore);
        
        switch (riskLevel) {
            case "LOW":
                return String.format("%s 지역으로 %s를 통한 배송 예정입니다. " +
                                   "양호한 조건으로 %s 정시 배송 예상됩니다.",
                                   address, carrier, expectedDate);
            case "MEDIUM":
                return String.format("%s 지역으로 %s를 통한 배송 예정입니다. " +
                                   "보통 수준의 지연 위험이 있어 %s 배송 예상됩니다.",
                                   address, carrier, expectedDate);
            default:
                return String.format("%s 지역으로 %s를 통한 배송 예정입니다. " +
                                   "날씨나 교통 등의 요인으로 %s 이후 배송될 수 있습니다.",
                                   address, carrier, expectedDate);
        }
    }

    /**
     * 개선 방안 제안
     */
    private String[] generateRecommendations(double riskScore) {
        if (riskScore < 0.3) {
            return new String[]{
                "현재 배송 조건이 양호합니다",
                "정시 배송이 예상됩니다"
            };
        } else if (riskScore < 0.6) {
            return new String[]{
                "배송 전 고객에게 예상 일정을 안내하세요",
                "대안 배송업체를 검토해보세요"
            };
        } else {
            return new String[]{
                "고객에게 지연 가능성을 사전 안내하세요",
                "더 신뢰할 수 있는 배송업체로 변경을 고려하세요",
                "배송 추적 서비스를 적극 활용하세요"
            };
        }
    }

    /**
     * 예측 결과 저장
     */
    private void savePredictionResult(Map<String, Object> requestData, double riskScore, 
                                    double confidence, Employee currentEmployee) {
        try {
            // Prediction 엔티티 저장
            Prediction prediction = Prediction.builder()
                    .predictionType(Prediction.PredictionType.DELIVERY_RISK)
                    .inputData(createInputDataJson(requestData))
                    .createdBy(currentEmployee)
                    .build();

            prediction = predictionRepository.save(prediction);

            // PredictionResult 저장
            PredictionResult result = PredictionResult.builder()
                    .prediction(prediction)
                    .predictedValue(BigDecimal.valueOf(riskScore))
                    .confidenceScore(BigDecimal.valueOf(confidence))
                    .modelVersion("WEKA_LR_v1.0")
                    .build();

            predictionResultRepository.save(result);
            
        } catch (Exception e) {
            log.error("배송 위험도 예측 결과 저장 실패", e);
        }
    }

    /**
     * 입력 데이터 JSON 생성
     */
    private String createInputDataJson(Map<String, Object> requestData) {
        return String.format(
                "{\"deliveryAddress\":\"%s\",\"productType\":\"%s\",\"productWeight\":%s,\"carrierName\":\"%s\"}",
                requestData.getOrDefault("deliveryAddress", ""),
                requestData.getOrDefault("productType", "기타"),
                requestData.getOrDefault("productWeight", 10.0),
                requestData.getOrDefault("carrierName", "일반택배")
        );
    }

    /**
     * 기본 예측 결과 (오류 시)
     */
    private Map<String, Object> getDefaultPrediction() {
        return Map.of(
            "riskScore", 0.3,
            "riskLevel", "MEDIUM",
            "expectedDeliveryDate", LocalDate.now().plusDays(2).toString(),
            "confidence", 0.6,
            "explanation", "시스템 오류로 인해 기본 예측값을 제공합니다.",
            "recommendations", new String[]{"고객 서비스팀에 문의하세요"}
        );
    }

    /**
     * Double 파싱 헬퍼
     */
    private Double parseDouble(Object value, Double defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        
        try {
            if (value instanceof Number) {
                return ((Number) value).doubleValue();
            } else {
                return Double.parseDouble(value.toString());
            }
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}