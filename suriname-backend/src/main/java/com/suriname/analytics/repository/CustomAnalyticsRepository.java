package com.suriname.analytics.repository;

import com.suriname.analytics.entity.RequestStatus;
import com.suriname.analytics.entity.TempRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CustomAnalyticsRepository extends JpaRepository<TempRequest, Long> {

    int countByCreatedAtAfter(LocalDateTime start);

    int countByStatus(RequestStatus status);

    int countByStatusIn(List<RequestStatus> statuses);

    @Query("SELECT COUNT(r) FROM TempRequest r")
    int countAll();
}