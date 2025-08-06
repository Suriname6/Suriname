package com.suriname.completion.repository;

import com.suriname.completion.entity.Completion;
import com.suriname.request.entity.Request;
import com.suriname.delivery.entity.Delivery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CompletionRepository extends JpaRepository<Completion, Long> {

    // Request로 완료 정보 조회
    Optional<Completion> findByRequest(Request request);

    // Delivery로 완료 정보 조회
    Optional<Completion> findByDelivery(Delivery delivery);

    // 완료 타입별 조회
    Page<Completion> findByCompletionTypeOrderByCreatedAtDesc(Completion.CompletionType completionType, Pageable pageable);

    // 전체 완료 목록 조회 (최신순)
    Page<Completion> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // 고객 수령 여부별 조회
    Page<Completion> findByCustomerReceivedOrderByCreatedAtDesc(Boolean customerReceived, Pageable pageable);

    // 만족도 조사 요청 여부별 조회
    Page<Completion> findBySatisfactionRequestedOrderByCreatedAtDesc(Boolean satisfactionRequested, Pageable pageable);

    // 미완료 건 조회 (고객 미수령 또는 만족도 조사 미요청)
    @Query("SELECT c FROM Completion c WHERE c.customerReceived = false OR c.satisfactionRequested = false")
    Page<Completion> findIncompleteItems(Pageable pageable);

    // 특정 직원이 완료한 건수 조회
    @Query("SELECT COUNT(c) FROM Completion c WHERE c.completedBy.employeeId = :employeeId")
    Long countByEmployeeId(@Param("employeeId") Long employeeId);

    // 기간별 완료 건수 조회
    @Query("SELECT COUNT(c) FROM Completion c WHERE c.createdAt BETWEEN :startDate AND :endDate")
    Long countByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // 만족도 조사 대상 건 조회 (배송 완료 후 24시간 경과한 건)
    @Query("SELECT c FROM Completion c WHERE c.delivery.status = 'DELIVERED' AND c.satisfactionRequested = false AND c.delivery.completedDate < :cutoffDate")
    List<Completion> findPendingSatisfactionSurveys(@Param("cutoffDate") LocalDateTime cutoffDate);

    // 고객명으로 완료 건 검색
    @Query("SELECT c FROM Completion c JOIN c.request r JOIN r.customer cu WHERE cu.name LIKE %:customerName%")
    Page<Completion> findByCustomerNameContaining(@Param("customerName") String customerName, Pageable pageable);

    // 접수번호로 완료 건 검색
    @Query("SELECT c FROM Completion c JOIN c.request r WHERE r.requestNo LIKE %:requestNo%")
    Page<Completion> findByRequestNoContaining(@Param("requestNo") String requestNo, Pageable pageable);
}