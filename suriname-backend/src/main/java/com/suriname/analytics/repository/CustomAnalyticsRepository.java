package com.suriname.analytics.repository;

import com.suriname.analytics.entity.RequestStatus;
import com.suriname.analytics.entity.TempRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query(value = """
        SELECT DATE_FORMAT(r.created_at, :format) AS label,
               COUNT(*) AS count
        FROM request r
        GROUP BY label
        ORDER BY label
        """, nativeQuery = true)
    List<Object[]> findRequestTrend(@Param("format") String format);

    @Query(value = """
        SELECT parent.name AS parent_category,
           child.name AS sub_category,
           COUNT(*) AS count
        FROM request r
        JOIN customer_product cp ON r.customer_product_id = cp.customer_product_id
        JOIN product p ON cp.product_id = p.product_id
        JOIN category child ON p.category_id = child.category_id
        LEFT JOIN category parent ON child.parent_id = parent.category_id
        GROUP BY parent.name, child.name
        ORDER BY count DESC;
        """, nativeQuery = true)
    List<Object[]> countRequestsByCategory();

    @Query(value = """
        SELECT 
          e.employee_id AS employeeId,
          e.name AS employeeName,
          COUNT(r.request_id) AS assignedCount,
          SUM(CASE WHEN r.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completedCount,
          CASE 
            WHEN COUNT(r.request_id) = 0 THEN 0
            ELSE ROUND(SUM(CASE WHEN r.status = 'COMPLETED' THEN 1 ELSE 0 END) * 1.0 / COUNT(r.request_id), 2)
          END AS completionRate,
          ROUND(AVG(s.rating), 2) AS averageRating
        FROM employee e
        LEFT JOIN request r ON e.employee_id = r.employee_id
        LEFT JOIN satisfaction s ON r.request_id = s.request_id
        GROUP BY e.employee_id, e.name
        ORDER BY assignedCount DESC
        """, nativeQuery = true)
    List<Object[]> getEmployeeStatsRaw();
}