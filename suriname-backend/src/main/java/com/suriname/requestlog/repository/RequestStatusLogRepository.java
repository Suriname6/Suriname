package com.suriname.requestlog.repository;

import com.suriname.requestlog.entity.RequestLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RequestStatusLogRepository extends JpaRepository<RequestLog, Long> {
}
