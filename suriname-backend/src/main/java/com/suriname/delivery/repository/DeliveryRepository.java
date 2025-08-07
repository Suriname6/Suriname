package com.suriname.delivery.repository;

import com.suriname.delivery.entity.Delivery;
import com.suriname.request.entity.Request;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    // Request ID로 배송 정보 조회
    Optional<Delivery> findByRequest(Request request);

    // 상태별 배송 목록 조회 (페이지네이션)
    Page<Delivery> findByStatusOrderByCreatedAtDesc(Delivery.Status status, Pageable pageable);

    // 전체 배송 목록 조회 (페이지네이션)
    Page<Delivery> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // 송장번호로 배송 정보 조회
    Optional<Delivery> findByTrackingNo(String trackingNo);

    // 배송업체별 배송 목록 조회
    Page<Delivery> findByCarrierNameOrderByCreatedAtDesc(String carrierName, Pageable pageable);

    // 고객 정보로 배송 목록 조회 (Request와 조인)
    @Query("SELECT d FROM Delivery d JOIN d.request r WHERE r.customer.name LIKE %:customerName%")
    Page<Delivery> findByCustomerNameContaining(@Param("customerName") String customerName, Pageable pageable);

    // 전화번호로 배송 정보 조회
    Optional<Delivery> findByPhone(String phone);

    // 특정 상태 목록에 해당하는 배송 조회 (스케줄러용)
    List<Delivery> findByStatusIn(List<Delivery.Status> statuses);

    // 배송 지연 건 조회 (N일 이상 경과한 배송 중 항목)
    @Query("SELECT d FROM Delivery d WHERE d.status IN ('PENDING', 'SHIPPED') AND d.createdAt < :cutoffDate")
    List<Delivery> findDelayedDeliveries(@Param("cutoffDate") LocalDateTime cutoffDate);

    // 배송 지연 건 조회 (일 수로 지정)
    default List<Delivery> findDelayedDeliveries(int days) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(days);
        return findDelayedDeliveries(cutoffDate);
    }
}