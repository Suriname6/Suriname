package com.suriname.admin;

import com.suriname.request.entity.Request;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MainRepository extends Repository<Request, Long> {
	   
	// 이번주 신규 접수
	@Query(value = """
		    SELECT COUNT(*) 
		    FROM request r
		    WHERE r.created_at >= :start AND r.created_at < :end
		    """, nativeQuery = true)
		long countNewRequestsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // 이번주 미배정
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
		    long countUnassignedBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);


    // 이번주 진행 중
	@Query(value = """
		    SELECT COUNT(*)
		    FROM request r
		    WHERE r.created_at >= :start AND r.created_at < :end
		      AND r.status IN ('REPAIRING','WAITING_FOR_PAYMENT','WAITING_FOR_DELIVERY')
		    """, nativeQuery = true)
		long countInProgressBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);


    // 이번주 완료 (completed_at)
	@Query(value = """
		    SELECT COUNT(*)
		    FROM request r
		    WHERE r.completed_at IS NOT NULL
		      AND r.completed_at >= :start AND r.completed_at < :end
		    """, nativeQuery = true)
		long countCompletedBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // 오늘 접수 목록 (최신 ACCEPTED 배정자 이름 포함)
	@Query(value = """
			SELECT
			    r.request_id      AS id,
			    r.request_no      AS requestNo,
			    c.name            AS customer,
			    p.product_name    AS product,
			    r.status          AS status,
			    COALESCE(e_acc.name, e_req.name) AS engineer,
			    r.created_at      AS createdAt,
			    last_any.status   AS assignStatus        -- ★ 추가
			FROM request r
			JOIN customer c ON c.customer_id = r.customer_id
			JOIN customer_product cp ON cp.customer_product_id = r.customer_product_id
			JOIN product p ON p.product_id = cp.product_id
			LEFT JOIN employee e_req ON e_req.employee_id = r.employee_id
			LEFT JOIN (
			    SELECT l.request_id, l.employee_id
			    FROM request_assignment_log l
			    JOIN (
			        SELECT request_id, MAX(assigned_at) AS mx
			        FROM request_assignment_log
			        WHERE status = 'ACCEPTED'
			        GROUP BY request_id
			    ) last ON last.request_id = l.request_id AND last.mx = l.assigned_at
			    WHERE l.status = 'ACCEPTED'
			) acc ON acc.request_id = r.request_id
			LEFT JOIN employee e_acc ON e_acc.employee_id = acc.employee_id
			LEFT JOIN (
			    SELECT l1.request_id, l1.status
			    FROM request_assignment_log l1
			    JOIN (
			        SELECT request_id,
			               MAX(COALESCE(status_changed_at, assigned_at)) AS mx
			        FROM request_assignment_log
			        GROUP BY request_id
			    ) last2 ON last2.request_id = l1.request_id
			           AND last2.mx = COALESCE(l1.status_changed_at, l1.assigned_at)
			) last_any ON last_any.request_id = r.request_id
			WHERE r.created_at >= :start AND r.created_at < :end
			ORDER BY r.created_at DESC
			""", nativeQuery = true)
			List<TodayRowProjection> findTodayRows(@Param("start") LocalDateTime start,
			                                       @Param("end") LocalDateTime end);
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