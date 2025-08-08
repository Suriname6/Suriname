package com.suriname.prediction.repository;

import com.suriname.prediction.entity.Prediction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Long> {

    // 예측 유형별 조회
    Page<Prediction> findByPredictionTypeOrderByCreatedAtDesc(
            Prediction.PredictionType predictionType, Pageable pageable);

    // 특정 요청에 대한 예측 조회
    List<Prediction> findByRequestRequestIdOrderByCreatedAtDesc(Long requestId);

    // 특정 배송에 대한 예측 조회  
    List<Prediction> findByDeliveryDeliveryIdOrderByCreatedAtDesc(Long deliveryId);

    // 특정 고객에 대한 예측 조회
    List<Prediction> findByCustomerCustomerIdOrderByCreatedAtDesc(Long customerId);

    // 날짜 범위별 예측 통계
    @Query("SELECT p.predictionType, COUNT(p) FROM Prediction p " +
           "WHERE p.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY p.predictionType")
    List<Object[]> countByPredictionTypeAndDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // 직원별 예측 건수
    @Query("SELECT p.createdBy.employeeId, p.createdBy.name, COUNT(p) FROM Prediction p " +
           "WHERE p.createdAt >= :startDate " +
           "GROUP BY p.createdBy.employeeId, p.createdBy.name " +
           "ORDER BY COUNT(p) DESC")
    List<Object[]> countByEmployeeAfterDate(@Param("startDate") LocalDateTime startDate);

    // 최근 예측 조회
    List<Prediction> findTop10ByOrderByCreatedAtDesc();
}