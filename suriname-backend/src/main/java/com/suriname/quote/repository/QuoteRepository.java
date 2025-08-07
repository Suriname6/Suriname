package com.suriname.quote.repository;

import com.suriname.quote.entity.Quote;
import com.suriname.request.entity.Request;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuoteRepository extends JpaRepository<Quote, Long> {
    Optional<Quote> findByRequest(Request request);
    
    List<Quote> findByIsApprovedFalse();
    List<Quote> findByIsApprovedTrue();
    
    @Query("SELECT DISTINCT q FROM Quote q " +
           "LEFT JOIN FETCH q.request r " +
           "LEFT JOIN FETCH r.customer c " +
           "LEFT JOIN FETCH r.customerProduct cp " +
           "LEFT JOIN FETCH cp.product p " +
           "LEFT JOIN FETCH q.employee e " +
           "LEFT JOIN FETCH r.payment pm " +
           "WHERE (:customerName IS NULL OR c.name LIKE %:customerName%) " +
           "AND (:requestNo IS NULL OR r.requestNo LIKE %:requestNo%) " +
           "AND (:productName IS NULL OR p.productName LIKE %:productName% OR r.inputProductName LIKE %:productName%) " +
           "AND (:serialNumber IS NULL OR p.serialNumber LIKE %:serialNumber%) " +
           "AND (:isApproved IS NULL OR q.isApproved = :isApproved) " +
           "AND (:employeeName IS NULL OR e.name LIKE %:employeeName%) " +
           "AND (:startDate IS NULL OR q.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR q.createdAt <= :endDate)")
    Page<Quote> findWithFilters(@Param("customerName") String customerName,
                               @Param("requestNo") String requestNo,
                               @Param("productName") String productName,
                               @Param("serialNumber") String serialNumber,
                               @Param("isApproved") Boolean isApproved,
                               @Param("employeeName") String employeeName,
                               @Param("startDate") LocalDateTime startDate,
                               @Param("endDate") LocalDateTime endDate,
                               Pageable pageable);
}