package com.suriname.prediction.service;

import com.suriname.prediction.dto.PredictionRequestDto;
import com.suriname.prediction.dto.PredictionResponseDto;
import com.suriname.prediction.entity.Prediction;
import com.suriname.prediction.repository.PredictionRepository;
import com.suriname.prediction.repository.PredictionResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PredictionService {

    private final PredictionRepository predictionRepository;
    private final PredictionResultRepository predictionResultRepository;
    private final RepairTimePredictionService repairTimePredictionService;

    /**
     * 예측 이력 조회
     */
    @Transactional(readOnly = true)
    public Page<Prediction> getPredictionHistory(String type, Pageable pageable) {
        if (type == null || type.isEmpty()) {
            return predictionRepository.findAll(pageable);
        }
        
        Prediction.PredictionType predictionType = Prediction.PredictionType.valueOf(type.toUpperCase());
        return predictionRepository.findByPredictionTypeOrderByCreatedAtDesc(predictionType, pageable);
    }

    /**
     * 모델 성능 통계 조회
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getModelPerformance() {
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
        
        var repairTimeAccuracy = predictionResultRepository.findAverageAccuracyByTypeAndDate(
                Prediction.PredictionType.REPAIR_TIME, oneMonthAgo);
        
        var deliveryRiskAccuracy = predictionResultRepository.findAverageAccuracyByTypeAndDate(
                Prediction.PredictionType.DELIVERY_RISK, oneMonthAgo);
        
        var customerRetentionAccuracy = predictionResultRepository.findAverageAccuracyByTypeAndDate(
                Prediction.PredictionType.CUSTOMER_RETENTION, oneMonthAgo);

        return Map.of(
            "repairTimeAccuracy", repairTimeAccuracy != null ? repairTimeAccuracy : 0,
            "deliveryRiskAccuracy", deliveryRiskAccuracy != null ? deliveryRiskAccuracy : 0,
            "customerRetentionAccuracy", customerRetentionAccuracy != null ? customerRetentionAccuracy : 0,
            "totalPredictions", predictionRepository.count(),
            "lastUpdated", LocalDateTime.now()
        );
    }

    /**
     * 최근 예측 결과 조회
     */
    @Transactional(readOnly = true)
    public List<Prediction> getRecentPredictions() {
        return predictionRepository.findTop10ByOrderByCreatedAtDesc();
    }

    /**
     * 예측 유형별 통계
     */
    @Transactional(readOnly = true)
    public Map<String, Long> getPredictionStatistics() {
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
        List<Object[]> stats = predictionRepository.countByPredictionTypeAndDateRange(oneMonthAgo, LocalDateTime.now());
        
        Map<String, Long> result = new java.util.HashMap<>();
        for (Object[] stat : stats) {
            Prediction.PredictionType type = (Prediction.PredictionType) stat[0];
            Long count = (Long) stat[1];
            result.put(type.name().toLowerCase(), count);
        }
        
        return result;
    }
}