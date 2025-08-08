package com.suriname.prediction.service;

import com.suriname.prediction.entity.Prediction;
import com.suriname.prediction.entity.PredictionResult;
import com.suriname.prediction.repository.PredictionRepository;
import com.suriname.prediction.repository.PredictionResultRepository;
import com.suriname.prediction.ml.WekaModelManager;
import com.suriname.customer.entity.Customer;
import com.suriname.customer.repository.CustomerRepository;
import com.suriname.employee.entity.Employee;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.Map;
import java.util.Random;

/**
 * 고객 재방문 확률 예측 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CustomerRetentionPredictionService {

    private final PredictionRepository predictionRepository;
    private final PredictionResultRepository predictionResultRepository;
    private final CustomerRepository customerRepository;
    private final WekaModelManager wekaModelManager;
    
    private final Random random = new Random();

    /**
     * 고객 재방문 확률 예측
     */
    public Map<String, Object> predictCustomerRetention(Map<String, Object> requestData, Employee currentEmployee) {
        log.info("고객 재방문 확률 예측 시작");

        try {
            // 고객 ID 파싱
            Long customerId = parseLong(requestData.get("customerId"), null);
            
            if (customerId == null) {
                return getDefaultPrediction();
            }
            
            // 고객 정보 조회
            Customer customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found: " + customerId));
            
            // 고객 데이터 분석
            int customerAge = calculateCustomerAge(customer.getBirth());
            int previousServices = estimatePreviousServices(customerId);
            int satisfactionScore = estimateCustomerSatisfaction(customerId);
            int daysSinceLastService = estimateDaysSinceLastService(customerId);
            double totalServiceCost = estimateTotalServiceCost(customerId);
            
            // ML 모델로 재방문 확률 예측
            double returnProbability = wekaModelManager.predictCustomerRetention(
                customerAge, previousServices, satisfactionScore, 
                daysSinceLastService, totalServiceCost
            );
            
            // 예상 재방문 일수 계산
            int nextVisitDays = calculateNextVisitDays(returnProbability, daysSinceLastService);
            
            // 신뢰도 계산
            double confidence = calculateConfidence(previousServices, satisfactionScore, daysSinceLastService);
            
            // 예측 결과 저장
            savePredictionResult(customerId, returnProbability, confidence, currentEmployee);
            
            // 설명 생성
            String explanation = generateExplanation(customer, returnProbability, 
                                                   previousServices, satisfactionScore);
            
            log.info("고객 재방문 확률 예측 완료: customerId={}, probability={}", 
                    customerId, returnProbability);
            
            return Map.of(
                "customerId", customerId,
                "customerName", customer.getName(),
                "returnProbability", Math.round(returnProbability * 100) / 100.0,
                "retentionLevel", getRetentionLevel(returnProbability),
                "nextVisitDays", nextVisitDays,
                "confidence", Math.round(confidence * 100) / 100.0,
                "explanation", explanation,
                "strategies", generateRetentionStrategies(returnProbability),
                "customerProfile", Map.of(
                    "age", customerAge,
                    "previousServices", previousServices,
                    "satisfactionScore", satisfactionScore,
                    "daysSinceLastService", daysSinceLastService,
                    "totalServiceCost", totalServiceCost
                )
            );
            
        } catch (Exception e) {
            log.error("고객 재방문 확률 예측 실패", e);
            return getDefaultPrediction();
        }
    }

    /**
     * 고객 나이 계산
     */
    private int calculateCustomerAge(LocalDate birthDate) {
        if (birthDate == null) {
            return 40; // 기본값
        }
        
        return Period.between(birthDate, LocalDate.now()).getYears();
    }

    /**
     * 과거 서비스 횟수 추정
     */
    private int estimatePreviousServices(Long customerId) {
        // 실제로는 Request 엔티티에서 조회해야 함
        // 현재는 시뮬레이션 데이터
        return 1 + random.nextInt(8); // 1-8회
    }

    /**
     * 고객 만족도 추정
     */
    private int estimateCustomerSatisfaction(Long customerId) {
        // 실제로는 Satisfaction 엔티티에서 조회해야 함
        // 현재는 시뮬레이션 데이터
        int baseScore = 3 + random.nextInt(3); // 3-5점
        
        // 나이가 많은 고객일수록 만족도가 높다고 가정
        if (random.nextDouble() > 0.3) {
            return Math.min(5, baseScore + 1);
        }
        
        return baseScore;
    }

    /**
     * 마지막 서비스 후 경과 일수 추정
     */
    private int estimateDaysSinceLastService(Long customerId) {
        // 실제로는 최근 Request 날짜에서 계산해야 함
        // 현재는 시뮬레이션 데이터
        return 30 + random.nextInt(300); // 30-330일
    }

    /**
     * 총 서비스 비용 추정
     */
    private double estimateTotalServiceCost(Long customerId) {
        // 실제로는 Payment 엔티티에서 합계를 조회해야 함
        // 현재는 시뮬레이션 데이터
        return 50000 + random.nextDouble() * 450000; // 5만원 - 50만원
    }

    /**
     * 예상 재방문 일수 계산
     */
    private int calculateNextVisitDays(double returnProbability, int daysSinceLastService) {
        if (returnProbability > 0.8) {
            return 30 + random.nextInt(30); // 30-60일 후
        } else if (returnProbability > 0.6) {
            return 60 + random.nextInt(60); // 60-120일 후
        } else if (returnProbability > 0.4) {
            return 120 + random.nextInt(120); // 120-240일 후
        } else {
            return 240 + random.nextInt(125); // 240-365일 후
        }
    }

    /**
     * 신뢰도 계산
     */
    private double calculateConfidence(int previousServices, int satisfactionScore, int daysSinceLastService) {
        double confidence = 0.65; // 기본 신뢰도
        
        // 서비스 횟수가 많을수록 신뢰도 증가
        if (previousServices >= 5) {
            confidence += 0.15;
        } else if (previousServices >= 3) {
            confidence += 0.1;
        }
        
        // 만족도가 높을수록 신뢰도 증가
        if (satisfactionScore >= 4) {
            confidence += 0.1;
        }
        
        // 최근 서비스를 받았다면 신뢰도 증가
        if (daysSinceLastService < 90) {
            confidence += 0.05;
        }
        
        return Math.min(confidence, 0.95);
    }

    /**
     * 재방문 레벨 분류
     */
    private String getRetentionLevel(double returnProbability) {
        if (returnProbability > 0.7) {
            return "HIGH";
        } else if (returnProbability > 0.4) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }

    /**
     * 설명 생성
     */
    private String generateExplanation(Customer customer, double returnProbability, 
                                     int previousServices, int satisfactionScore) {
        String level = getRetentionLevel(returnProbability);
        
        switch (level) {
            case "HIGH":
                return String.format("%s 고객님은 과거 %d회 서비스를 이용하시고 만족도가 %d점으로 " +
                                   "재방문 확률이 %.0f%%로 매우 높습니다. 충성 고객으로 분류됩니다.",
                                   customer.getName(), previousServices, 
                                   satisfactionScore, returnProbability * 100);
            case "MEDIUM":
                return String.format("%s 고객님은 과거 %d회 서비스를 이용하시고 만족도가 %d점으로 " +
                                   "재방문 확률이 %.0f%%입니다. 적절한 관리가 필요합니다.",
                                   customer.getName(), previousServices, 
                                   satisfactionScore, returnProbability * 100);
            default:
                return String.format("%s 고객님의 재방문 확률이 %.0f%%로 낮습니다. " +
                                   "고객 관계 개선을 위한 적극적인 노력이 필요합니다.",
                                   customer.getName(), returnProbability * 100);
        }
    }

    /**
     * 고객 유지 전략 제안
     */
    private String[] generateRetentionStrategies(double returnProbability) {
        if (returnProbability > 0.7) {
            return new String[]{
                "VIP 고객 프로그램에 초대하세요",
                "정기적인 서비스 안내를 발송하세요",
                "특별 할인 혜택을 제공하세요"
            };
        } else if (returnProbability > 0.4) {
            return new String[]{
                "개인화된 서비스 추천을 제공하세요",
                "고객 만족도 조사를 실시하세요",
                "리워드 프로그램 참여를 유도하세요"
            };
        } else {
            return new String[]{
                "고객 불만 사항을 적극적으로 해결하세요",
                "특별 프로모션을 통해 재방문을 유도하세요",
                "고객과의 직접 소통을 늘려보세요",
                "서비스 품질 개선에 집중하세요"
            };
        }
    }

    /**
     * 예측 결과 저장
     */
    private void savePredictionResult(Long customerId, double returnProbability, 
                                    double confidence, Employee currentEmployee) {
        try {
            Customer customer = customerRepository.findById(customerId).orElse(null);
            
            // Prediction 엔티티 저장
            Prediction prediction = Prediction.builder()
                    .predictionType(Prediction.PredictionType.CUSTOMER_RETENTION)
                    .customer(customer)
                    .inputData(createInputDataJson(customerId))
                    .createdBy(currentEmployee)
                    .build();

            prediction = predictionRepository.save(prediction);

            // PredictionResult 저장
            PredictionResult result = PredictionResult.builder()
                    .prediction(prediction)
                    .predictedValue(BigDecimal.valueOf(returnProbability))
                    .confidenceScore(BigDecimal.valueOf(confidence))
                    .modelVersion("WEKA_RF_v1.0")
                    .build();

            predictionResultRepository.save(result);
            
        } catch (Exception e) {
            log.error("고객 재방문 예측 결과 저장 실패", e);
        }
    }

    /**
     * 입력 데이터 JSON 생성
     */
    private String createInputDataJson(Long customerId) {
        return String.format("{\"customerId\":%d}", customerId);
    }

    /**
     * 기본 예측 결과 (오류 시)
     */
    private Map<String, Object> getDefaultPrediction() {
        return Map.of(
            "returnProbability", 0.5,
            "retentionLevel", "MEDIUM",
            "nextVisitDays", 90,
            "confidence", 0.6,
            "explanation", "시스템 오류로 인해 기본 예측값을 제공합니다.",
            "strategies", new String[]{"고객 서비스팀에 문의하세요"}
        );
    }

    /**
     * Long 파싱 헬퍼
     */
    private Long parseLong(Object value, Long defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        
        try {
            if (value instanceof Number) {
                return ((Number) value).longValue();
            } else {
                return Long.parseLong(value.toString());
            }
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}