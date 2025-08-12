package com.suriname.admin;

import com.suriname.request.entity.Request;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MainRepository extends Repository<Request, Long> {
	   // 오늘 신규 접수 (created_at)
    @Query(value = """
        SELECT COUNT(*) 
        FROM request r
        WHERE r.created_at >= :start AND r.created_at < :end
        """, nativeQuery = true)
    long countNewRequests(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // 오늘 미배정: 최신 배정 이력이 ACCEPTED가 아닌 건
    @Query(value = """
        WITH last_assign AS (
            SELECT l.request_id, l.status
            FROM request_assignment_log l
            JOIN (
                SELECT request_id, MAX(assigned_at) AS max_at
                FROM request_assignment_log
                GROUP BY request_id
            ) t ON t.request_id = l.request_id AND t.max_at = l.assigned_at
        )
        SELECT COUNT(*)
        FROM request r
        LEFT JOIN last_assign la ON la.request_id = r.request_id
        WHERE r.created_at >= :start AND r.created_at < :end
          AND (la.status IS NULL OR la.status <> 'ACCEPTED')
        """, nativeQuery = true)
    long countUnassigned(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // 오늘 진행 중
    @Query(value = """
        SELECT COUNT(*)
        FROM request r
        WHERE r.created_at >= :start AND r.created_at < :end
          AND r.status IN ('REPAIRING','WAITING_FOR_PAYMENT','WAITING_FOR_DELIVERY')
        """, nativeQuery = true)
    long countInProgress(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // 오늘 완료 (completed_at)
    @Query(value = """
        SELECT COUNT(*)
        FROM request r
        WHERE r.completed_at IS NOT NULL
          AND r.completed_at >= :start AND r.completed_at < :end
        """, nativeQuery = true)
    long countCompleted(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // 오늘 지연: 상태가 DELAYED
    @Query(value = """
        SELECT COUNT(*)
        FROM request r
        WHERE r.created_at >= :start AND r.created_at < :end
          AND r.status = 'RECEIVED' /* 기본값 가정 */
          AND 1=0
        """, nativeQuery = true)
    long stubCountDelayed(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    // ↑ 스키마엔 DELAYED ENUM이 없어서 기본은 0 처리 예정(서비스에서 0 반환).
    // SLA 기반 지연 로직을 쓰고 싶다면 여기 WHERE 조건을 바꾸세요(예: due_at < NOW() AND status <> 'COMPLETED')

    // 오늘 접수 목록 (최신 ACCEPTED 배정자 이름 포함)
    @Query(value = """
        WITH last_acc AS (
            SELECT l.request_id, l.employee_id
            FROM request_assignment_log l
            JOIN (
                SELECT request_id, MAX(assigned_at) AS max_at
                FROM request_assignment_log
                GROUP BY request_id
            ) t ON t.request_id = l.request_id AND t.max_at = l.assigned_at
            WHERE l.status = 'ACCEPTED'
        )
        SELECT 
           r.request_id               AS id,
           r.request_no               AS requestNo,
           COALESCE(c.name, '-')      AS customer,
           COALESCE(p.product_name,'-') AS product,
           r.status                   AS status,
           COALESCE(e.name, '-')      AS engineer,
           r.created_at               AS createdAt
        FROM request r
        LEFT JOIN customer c ON c.customer_id = r.customer_id
        LEFT JOIN customer_product cp ON cp.customer_product_id = r.customer_product_id
        LEFT JOIN product p ON p.product_id = cp.product_id
        LEFT JOIN last_acc la ON la.request_id = r.request_id
        LEFT JOIN employee e ON e.employee_id = la.employee_id
        WHERE r.created_at >= :start AND r.created_at < :end
        ORDER BY r.created_at ASC
        """, nativeQuery = true)
    List<TodayRowProjection> findTodayRows(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // 이번 주 일자별(created_at) 카운트
    @Query(value = """
        SELECT DATE(r.created_at) AS ymd, COUNT(*) AS cnt
        FROM request r
        WHERE r.created_at >= :start AND r.created_at < :end
        GROUP BY DATE(r.created_at)
        ORDER BY ymd
        """, nativeQuery = true)
    List<WeekDayCountProjection> countByDayThisWeek(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // 이번 주 총합
    @Query(value = """
        SELECT COUNT(*)
        FROM request r
        WHERE r.created_at >= :start AND r.created_at < :end
        """, nativeQuery = true)
    int totalThisWeek(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // 이번 주 기사 TOP5: 완료 기준 + 최신 ACCEPTED 배정자
    @Query(value = """
        WITH last_acc AS (
            SELECT l.request_id, l.employee_id
            FROM request_assignment_log l
            JOIN (
                SELECT request_id, MAX(assigned_at) AS max_at
                FROM request_assignment_log
                GROUP BY request_id
            ) t ON t.request_id = l.request_id AND t.max_at = l.assigned_at
            WHERE l.status = 'ACCEPTED'
        )
        SELECT e.name AS name, COUNT(*) AS cnt
        FROM request r
        JOIN last_acc la ON la.request_id = r.request_id
        JOIN employee e ON e.employee_id = la.employee_id
        WHERE r.completed_at IS NOT NULL
          AND r.completed_at >= :start AND r.completed_at < :end
        GROUP BY e.name
        ORDER BY cnt DESC
        LIMIT 5
        """, nativeQuery = true)
    List<WeekTopEngineerProjection> topEngineersThisWeek(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}