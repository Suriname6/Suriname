package com.suriname.request.repository;

import com.suriname.request.entity.RequestAssignmentLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RequestAssignmentLogRepository extends JpaRepository<RequestAssignmentLog,Long> {
    Optional<RequestAssignmentLog> findTopByRequestRequestIdAndStatusOrderByAssignedAtDesc(Long requestId, RequestAssignmentLog.AssignmentStatus status);

    Optional<RequestAssignmentLog> findTopByRequestRequestIdOrderByAssignedAtDesc(Long requestId);

    @Modifying
    @Transactional
    @Query("DELETE FROM RequestAssignmentLog ral WHERE ral.request.requestId IN :requestIds")
    void deleteAllByRequestRequestIdIn(@Param("requestIds") List<Long> requestIds);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        update RequestAssignmentLog l
           set l.status = :expired,
               l.statusChangedAt = :now
         where l.status = :pending
           and l.assignedAt < :threshold
    """)
    int expireAllPendingOlderThan(
            @Param("threshold") LocalDateTime threshold,
            @Param("pending") RequestAssignmentLog.AssignmentStatus pending,
            @Param("expired") RequestAssignmentLog.AssignmentStatus expired,
            @Param("now") LocalDateTime now
    );
}
