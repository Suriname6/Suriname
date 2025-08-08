package com.suriname.prediction.repository;

import com.suriname.prediction.entity.PredictionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PredictionResultRepository extends JpaRepository<PredictionResult, Long> {

    // 특정 예측의 결과 조회
    Optional<PredictionResult> findByPredictionPredictionId(Long predictionId);

    // 모델 성능 통계 - 평균 정확도
    @Query("SELECT AVG(pr.accuracyScore) FROM PredictionResult pr " +
           "WHERE pr.prediction.predictionType = :predictionType " +
           "AND pr.accuracyScore IS NOT NULL " +
           "AND pr.createdAt >= :startDate")
    BigDecimal findAverageAccuracyByTypeAndDate(
            @Param("predictionType") com.suriname.prediction.entity.Prediction.PredictionType predictionType,
            @Param("startDate") LocalDateTime startDate);

    // 모델별 성능 통계
    @Query("SELECT pr.modelVersion, AVG(pr.accuracyScore), COUNT(pr) FROM PredictionResult pr " +
           "WHERE pr.prediction.predictionType = :predictionType " +
           "AND pr.accuracyScore IS NOT NULL " +
           "AND pr.createdAt >= :startDate " +
           "GROUP BY pr.modelVersion")
    List<Object[]> findPerformanceByModelVersionAndType(
            @Param("predictionType") com.suriname.prediction.entity.Prediction.PredictionType predictionType,
            @Param("startDate") LocalDateTime startDate);

    // 정확도가 낮은 예측 결과 (개선 필요)
    @Query("SELECT pr FROM PredictionResult pr " +
           "WHERE pr.accuracyScore < :threshold " +
           "AND pr.accuracyScore IS NOT NULL " +
           "ORDER BY pr.accuracyScore ASC")
    List<PredictionResult> findLowAccuracyResults(@Param("threshold") BigDecimal threshold);

    // 최근 예측 결과 성능
    @Query("SELECT pr FROM PredictionResult pr " +
           "WHERE pr.createdAt >= :startDate " +
           "AND pr.accuracyScore IS NOT NULL " +
           "ORDER BY pr.createdAt DESC")
    List<PredictionResult> findRecentResultsWithAccuracy(@Param("startDate") LocalDateTime startDate);
}