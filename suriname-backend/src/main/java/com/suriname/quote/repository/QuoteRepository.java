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
    
    @Query("SELECT q FROM Quote q " +
           "JOIN q.request r " +
           "JOIN r.customer c " +
           "LEFT JOIN q.employee e " +
            "JOIN r.customerProduct cp " +
            "JOIN cp.product p " +
            "WHERE (:customerName IS NULL OR :customerName = '' OR c.name LIKE CONCAT('%', :customerName, '%')) " +
           "AND (:requestNo IS NULL OR :requestNo = '' OR r.requestNo LIKE CONCAT('%', :requestNo, '%')) " +
           "AND (:productName IS NULL OR :productName = '' OR p.productName LIKE CONCAT('%', :productName, '%')) " +
           "AND (:serialNumber IS NULL OR :serialNumber = '') " +
           "AND (:isApproved IS NULL OR q.isApproved = :isApproved) " +
           "AND (:employeeName IS NULL OR :employeeName = '' OR e.name LIKE CONCAT('%', :employeeName, '%')) " +
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