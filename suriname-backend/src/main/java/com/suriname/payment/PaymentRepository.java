package com.suriname.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByRequest_RequestId(Long requestId);
    Optional<Payment> findByMerchantUid(String merchantUid);
}
