package com.suriname.payment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment,Long> {
    Optional<Payment> findByMerchantUid(String merchantUid);
    
    @Query("SELECT p FROM Payment p JOIN p.request r JOIN r.customer c " +
           "WHERE (:customerName IS NULL OR c.name LIKE %:customerName%) " +
           "AND (:receptionNumber IS NULL OR r.requestNo LIKE %:receptionNumber%) " +
           "AND (:bankName IS NULL OR p.bank LIKE %:bankName%) " +
           "AND (:paymentAmount IS NULL OR p.cost = :paymentAmount) " +
           "AND (:status IS NULL OR " +
           "     (:status = '입금완료' AND p.status = 'SUCCESS') OR " +
           "     (:status = '입금대기' AND p.status = 'PENDING') OR " +
           "     (:status = '입금실패' AND p.status = 'FAILED')) " +
           "AND (:startDate IS NULL OR p.confirmedAt >= :startDate) " +
           "AND (:endDate IS NULL OR p.confirmedAt <= :endDate)")
    Page<Payment> findWithFilters(@Param("customerName") String customerName,
                                 @Param("receptionNumber") String receptionNumber,
                                 @Param("bankName") String bankName,
                                 @Param("paymentAmount") Integer paymentAmount,
                                 @Param("status") String status,
                                 @Param("startDate") LocalDateTime startDate,
                                 @Param("endDate") LocalDateTime endDate,
                                 Pageable pageable);
}
