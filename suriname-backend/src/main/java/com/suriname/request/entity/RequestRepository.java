package com.suriname.request.entity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {
    
    // 접수번호로 Request 조회
    Optional<Request> findByRequestNo(String requestNo);
    
    // 상태별 Request 조회
    Page<Request> findByStatus(Request.Status status, Pageable pageable);
}
