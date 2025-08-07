package com.suriname.request.repository;

import com.suriname.request.entity.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {
    
    // 접수번호로 Request 조회
    Optional<Request> findByRequestNo(String requestNo);
}