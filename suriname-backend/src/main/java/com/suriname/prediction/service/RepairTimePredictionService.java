package com.suriname.prediction.service;

import com.suriname.prediction.dto.RepairTimePredictionDto;
import com.suriname.prediction.dto.PredictionResponseDto;
import com.suriname.prediction.entity.Prediction;
import com.suriname.prediction.entity.PredictionResult;
import com.suriname.prediction.repository.PredictionRepository;
import com.suriname.prediction.repository.PredictionResultRepository;
import com.suriname.request.entity.Request;
import com.suriname.request.entity.RequestRepository;
import com.suriname.employee.entity.Employee;
import com.suriname.prediction.ml.WekaModelManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class RepairTimePredictionService {

    private final PredictionRepository predictionRepository;
    private final PredictionResultRepository predictionResultRepository;
    private final RequestRepository requestRepository;
    private final WekaModelManager wekaModelManager;

    /**
     * A/S 처리시간 예측
     */
    public PredictionResponseDto predictRepairTime(RepairTimePredictionDto requestDto, Employee currentEmployee) {
        log.info("A/S 처리시간 예측 시작: requestId={}", requestDto.getRequestId());

        try {
            // Request 엔티티 조회
            Request request = requestRepository.findById(requestDto.getRequestId())
                    .orElseThrow(() -> new RuntimeException("Request not found: " + requestDto.getRequestId()));

            // Weka 기반 ML 예측
            BigDecimal predictedDays = calculateRepairTimeWithML(requestDto);
            BigDecimal confidence = calculateConfidenceWithML(requestDto);

            // Prediction 엔티티 저장
            Prediction prediction = Prediction.builder()
                    .predictionType(Prediction.PredictionType.REPAIR_TIME)
                    .request(request)
                    .customer(request.getCustomer())
                    .inputData(createInputDataJson(requestDto))
                    .createdBy(currentEmployee)
                    .build();

            prediction = predictionRepository.save(prediction);

            // PredictionResult 저장
            PredictionResult result = PredictionResult.builder()
                    .prediction(prediction)
                    .predictedValue(predictedDays)
                    .confidenceScore(confidence)
                    .modelVersion("WEKA_RF_v2.0")
                    .build();

            predictionResultRepository.save(result);

            log.info("A/S 처리시간 예측 완료: {}일 (신뢰도: {})", predictedDays, confidence);

            return PredictionResponseDto.builder()
                    .predictionId(prediction.getPredictionId())
                    .predictionType("REPAIR_TIME")
                    .predictedValue(predictedDays)
                    .confidence(confidence)
                    .modelVersion("WEKA_RF_v2.0")
                    .explanation(generateExplanation(requestDto, predictedDays))
                    .predictionTime(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            log.error("A/S 처리시간 예측 중 오류 발생", e);
            throw new RuntimeException("예측 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * Weka ML 모델 기반 처리시간 계산
     */
    private BigDecimal calculateRepairTimeWithML(RepairTimePredictionDto dto) {
        try {
            // 입력 데이터 검증 및 기본값 설정
            String productCategory = dto.getProductCategory() != null ? dto.getProductCategory() : "기타";
            String employeeExperience = dto.getEmployeeExperience() != null ? dto.getEmployeeExperience() : "INTERMEDIATE";
            int currentWorkload = dto.getCurrentWorkload() != null ? dto.getCurrentWorkload() : 10;
            
            // 문제 복잡도 추정 (이슈 설명 기반)
            int issueComplexity = estimateIssueComplexity(dto.getIssueDescription());
            
            // 부품 가용성 추정 (제품 카테고리 기반)
            int partsAvailability = estimatePartsAvailability(productCategory);
            
            // Weka 모델로 예측
            double prediction = wekaModelManager.predictRepairTime(
                productCategory, employeeExperience, currentWorkload, 
                issueComplexity, partsAvailability
            );
            
            return BigDecimal.valueOf(prediction).setScale(1, BigDecimal.ROUND_HALF_UP);
        } catch (Exception e) {
            log.error("ML 모델 예측 실패, 폴백 로직 사용", e);
            return calculateRepairTimeFallback(dto);
        }
    }

    /**
     * 폴백용 규칙 기반 처리시간 계산
     */
    private BigDecimal calculateRepairTimeFallback(RepairTimePredictionDto dto) {
        BigDecimal baseDays = new BigDecimal("3.0");

        if ("TV".equals(dto.getProductCategory())) {
            baseDays = baseDays.add(new BigDecimal("1.0"));
        } else if ("냉장고".equals(dto.getProductCategory())) {
            baseDays = baseDays.add(new BigDecimal("2.0"));
        }

        if ("BEGINNER".equals(dto.getEmployeeExperience())) {
            baseDays = baseDays.add(new BigDecimal("1.5"));
        } else if ("EXPERT".equals(dto.getEmployeeExperience())) {
            baseDays = baseDays.subtract(new BigDecimal("1.0"));
        }

        if (dto.getCurrentWorkload() != null && dto.getCurrentWorkload() > 10) {
            baseDays = baseDays.add(new BigDecimal("0.5"));
        }

        return baseDays.max(new BigDecimal("1.0"));
    }

    /**
     * ML 모델 기반 신뢰도 계산
     */
    private BigDecimal calculateConfidenceWithML(RepairTimePredictionDto dto) {
        try {
            // 모델 정확도 기반 신뢰도
            double modelAccuracy = wekaModelManager.getModelAccuracy("REPAIR_TIME");
            
            // 데이터 완성도 기반 가중치
            double dataCompleteness = calculateDataCompleteness(dto);
            
            // 최종 신뢰도 계산
            double confidence = modelAccuracy * dataCompleteness;
            
            return BigDecimal.valueOf(confidence).setScale(3, BigDecimal.ROUND_HALF_UP);
        } catch (Exception e) {
            log.error("ML 신뢰도 계산 실패, 기본 신뢰도 사용", e);
            return new BigDecimal("0.75");
        }
    }

    /**
     * 데이터 완성도 계산
     */
    private double calculateDataCompleteness(RepairTimePredictionDto dto) {
        double completeness = 0.6; // 기본 완성도
        
        if (dto.getProductCategory() != null && !dto.getProductCategory().isEmpty()) {
            completeness += 0.1;
        }
        if (dto.getEmployeeExperience() != null && !dto.getEmployeeExperience().isEmpty()) {
            completeness += 0.1;
        }
        if (dto.getCurrentWorkload() != null) {
            completeness += 0.1;
        }
        if (dto.getIssueDescription() != null && dto.getIssueDescription().length() > 10) {
            completeness += 0.1;
        }
        
        return Math.min(completeness, 1.0);
    }

    /**
     * 문제 복잡도 추정
     */
    private int estimateIssueComplexity(String issueDescription) {
        if (issueDescription == null || issueDescription.trim().isEmpty()) {
            return 3; // 기본값
        }
        
        String desc = issueDescription.toLowerCase();
        int complexity = 2; // 기본 복잡도
        
        // 복잡한 문제 키워드
        if (desc.contains("회로") || desc.contains("기판") || desc.contains("전원")) {
            complexity += 2;
        }
        if (desc.contains("소음") || desc.contains("진동") || desc.contains("냄새")) {
            complexity += 1;
        }
        if (desc.contains("간헐적") || desc.contains("가끔") || desc.contains("때때로")) {
            complexity += 1;
        }
        
        // 간단한 문제 키워드
        if (desc.contains("청소") || desc.contains("필터") || desc.contains("리모컨")) {
            complexity -= 1;
        }
        
        return Math.max(1, Math.min(5, complexity));
    }

    /**
     * 부품 가용성 추정
     */
    private int estimatePartsAvailability(String productCategory) {
        switch (productCategory) {
            case "TV":
                return 4; // TV 부품은 비교적 구하기 쉬움
            case "냉장고":
                return 3; // 냉장고 부품은 보통
            case "세탁기":
                return 4;
            case "에어컨":
                return 3;
            default:
                return 3; // 기본값
        }
    }

    /**
     * 입력 데이터 JSON 생성
     */
    private String createInputDataJson(RepairTimePredictionDto dto) {
        return String.format(
                "{\"productCategory\":\"%s\",\"issueDescription\":\"%s\",\"employeeExperience\":\"%s\",\"currentWorkload\":%d}",
                dto.getProductCategory(),
                dto.getIssueDescription(),
                dto.getEmployeeExperience(),
                dto.getCurrentWorkload()
        );
    }

    /**
     * 예측 설명 생성
     */
    private String generateExplanation(RepairTimePredictionDto dto, BigDecimal predictedDays) {
        return String.format(
                "%s 제품의 %s 문제로 AI 모델 분석 결과 예상 처리시간은 %.1f일입니다. " +
                "담당자 경험도(%s)와 현재 업무량(%d건)을 ML 알고리즘으로 종합 분석했습니다.",
                dto.getProductCategory(),
                dto.getIssueDescription(),
                predictedDays.doubleValue(),
                dto.getEmployeeExperience(),
                dto.getCurrentWorkload()
        );
    }
}