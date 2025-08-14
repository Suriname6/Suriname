package com.suriname.satisfaction.repository;

import com.suriname.completion.entity.Completion;
import com.suriname.customer.entity.Customer;
import com.suriname.request.entity.Request;
import com.suriname.satisfaction.entity.Satisfaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SatisfactionRepository extends JpaRepository<Satisfaction, Long> {

    // Request로 만족도 조회
    Optional<Satisfaction> findByRequest(Request request);

    // Completion으로 만족도 조회
    Optional<Satisfaction> findByCompletion(Completion completion);

    // Customer로 만족도 목록 조회
    Page<Satisfaction> findByCustomerOrderByCreatedAtDesc(Customer customer, Pageable pageable);

    // 전체 만족도 목록 조회 (최신순)
    Page<Satisfaction> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // 설문 방법별 조회
    Page<Satisfaction> findBySurveyMethodOrderByCreatedAtDesc(Satisfaction.SurveyMethod surveyMethod, Pageable pageable);

    // 고만족 고객 조회 (평균 4점 이상)
    @Query("SELECT s FROM Satisfaction s WHERE " +
           "(s.overallRating + s.serviceQualityRating + s.responseTimeRating + s.deliveryRating + s.staffKindnessRating) / 5.0 >= 4.0")
    Page<Satisfaction> findHighSatisfactionCustomers(Pageable pageable);

    // 저만족 고객 조회 (평균 2점 이하)
    @Query("SELECT s FROM Satisfaction s WHERE " +
           "(s.overallRating + s.serviceQualityRating + s.responseTimeRating + s.deliveryRating + s.staffKindnessRating) / 5.0 <= 2.0")
    Page<Satisfaction> findLowSatisfactionCustomers(Pageable pageable);

    // 추천 의향이 있는 고객 조회
    Page<Satisfaction> findByRecommendToOthersOrderByCreatedAtDesc(Boolean recommendToOthers, Pageable pageable);

    // 기간별 만족도 조회
    @Query("SELECT s FROM Satisfaction s WHERE s.createdAt BETWEEN :startDate AND :endDate ORDER BY s.createdAt DESC")
    Page<Satisfaction> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                     @Param("endDate") LocalDateTime endDate, 
                                     Pageable pageable);

    // 평균 만족도 계산
    @Query("SELECT AVG((s.overallRating + s.serviceQualityRating + s.responseTimeRating + s.deliveryRating + s.staffKindnessRating) / 5.0) FROM Satisfaction s")
    Double getAverageRating();

    // 기간별 평균 만족도 계산
    @Query("SELECT AVG((s.overallRating + s.serviceQualityRating + s.responseTimeRating + s.deliveryRating + s.staffKindnessRating) / 5.0) " +
           "FROM Satisfaction s WHERE s.createdAt BETWEEN :startDate AND :endDate")
    Double getAverageRatingByDateRange(@Param("startDate") LocalDateTime startDate, 
                                     @Param("endDate") LocalDateTime endDate);

    // 만족도 분포 조회
    @Query("SELECT " +
           "SUM(CASE WHEN (s.overallRating + s.serviceQualityRating + s.responseTimeRating + s.deliveryRating + s.staffKindnessRating) / 5.0 >= 4.5 THEN 1 ELSE 0 END) as excellent, " +
           "SUM(CASE WHEN (s.overallRating + s.serviceQualityRating + s.responseTimeRating + s.deliveryRating + s.staffKindnessRating) / 5.0 >= 3.5 AND (s.overallRating + s.serviceQualityRating + s.responseTimeRating + s.deliveryRating + s.staffKindnessRating) / 5.0 < 4.5 THEN 1 ELSE 0 END) as good, " +
           "SUM(CASE WHEN (s.overallRating + s.serviceQualityRating + s.responseTimeRating + s.deliveryRating + s.staffKindnessRating) / 5.0 >= 2.5 AND (s.overallRating + s.serviceQualityRating + s.responseTimeRating + s.deliveryRating + s.staffKindnessRating) / 5.0 < 3.5 THEN 1 ELSE 0 END) as average, " +
           "SUM(CASE WHEN (s.overallRating + s.serviceQualityRating + s.responseTimeRating + s.deliveryRating + s.staffKindnessRating) / 5.0 >= 1.5 AND (s.overallRating + s.serviceQualityRating + s.responseTimeRating + s.deliveryRating + s.staffKindnessRating) / 5.0 < 2.5 THEN 1 ELSE 0 END) as poor, " +
           "SUM(CASE WHEN (s.overallRating + s.serviceQualityRating + s.responseTimeRating + s.deliveryRating + s.staffKindnessRating) / 5.0 < 1.5 THEN 1 ELSE 0 END) as very_poor " +
           "FROM Satisfaction s")
    Object[] getSatisfactionDistribution();

    // 고객명으로 만족도 검색
    @Query("SELECT s FROM Satisfaction s JOIN s.customer c WHERE c.name LIKE %:customerName%")
    Page<Satisfaction> findByCustomerNameContaining(@Param("customerName") String customerName, Pageable pageable);

    // 접수번호로 만족도 검색
    @Query("SELECT s FROM Satisfaction s JOIN s.request r WHERE r.requestNo LIKE %:requestNo%")
    Page<Satisfaction> findByRequestNoContaining(@Param("requestNo") String requestNo, Pageable pageable);

    // 월별 만족도 통계
    @Query("SELECT " +
           "YEAR(s.createdAt) as year, " +
           "MONTH(s.createdAt) as month, " +
           "COUNT(s) as count, " +
           "AVG((s.overallRating + s.serviceQualityRating + s.responseTimeRating + s.deliveryRating + s.staffKindnessRating) / 5.0) as avgRating " +
           "FROM Satisfaction s " +
           "WHERE s.createdAt >= :startDate " +
           "GROUP BY YEAR(s.createdAt), MONTH(s.createdAt) " +
           "ORDER BY year DESC, month DESC")
    List<Object[]> getMonthlySatisfactionStats(@Param("startDate") LocalDateTime startDate);

    //모델별 평균 평점
    @Query("""
        SELECT p.productName,
               AVG((s.overallRating + s.serviceQualityRating + s.responseTimeRating + s.deliveryRating + s.staffKindnessRating) / 5.0)
        FROM Satisfaction s
        JOIN s.request r
        JOIN r.customerProduct cp
        JOIN cp.product p
        GROUP BY p.productName
    """)
    List<Object[]> avgRatingByModel();
}