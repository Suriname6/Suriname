package com.suriname.analytics.repository;

import com.suriname.analytics.dto.CategoryAsCountDTO;
import com.suriname.analytics.dto.RevenueDTO;
import com.suriname.analytics.dto.StatusCountResultDTO;
import com.suriname.analytics.entity.RequestStatus;
import com.suriname.request.entity.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CustomAnalyticsRepository extends JpaRepository<Request, Long> {

    Long countByStatus(Request.Status status);

    // 전체 접수 건수
    @Query(value = "SELECT COUNT(*) FROM request", nativeQuery = true)
    Long countAll();

    // 오늘 접수 건수
    @Query(value = "SELECT COUNT(*) FROM request WHERE DATE(created_at) = CURDATE()", nativeQuery = true)
    Long countTodayRequests();

    // 미완료 건수
    @Query(value = "SELECT COUNT(*) FROM request WHERE status IN ('RECEIVED', 'REPAIRING', 'WAITING_FOR_PAYMENT', 'WAITING_FOR_DELIVERY')", nativeQuery = true)
    Long countUncompleteRequests();

    // 전체 완료율 (완료 건수 / 전체 건수 * 100)
    @Query(value = "SELECT CASE WHEN COUNT(*) = 0 THEN 0.0 ELSE (COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) * 100.0 / COUNT(*)) END FROM request", nativeQuery = true)
    Double getOverallCompletionRate();

    // 총 매출액
    @Query(value = """
    SELECT COALESCE(SUM(rd.cost), 0) 
    FROM request r 
    JOIN request_detail rd ON r.request_id = rd.requests_id 
    WHERE r.status = 'COMPLETED'
    """, nativeQuery = true)
    Long getTotalRevenue();

    // 평균 수리비
    @Query(value = """
    SELECT COALESCE(AVG(cost_summary.total_cost), 0)
    FROM (
        SELECT SUM(rd.cost) as total_cost
        FROM request r
        JOIN request_detail rd ON r.request_id = rd.requests_id
        WHERE r.status = 'COMPLETED'
        GROUP BY r.request_id
    ) cost_summary
    """, nativeQuery = true)
    Double getAverageRepairCost();

    // 도넛 그래프 (처리 단계별 현황)
    @Query(value = """
    SELECT 
        status,
        COUNT(*) as count
    FROM request 
    GROUP BY status
    """, nativeQuery = true)
    List<StatusCountResultDTO> getStatusDistribution();

    // 카테고리별 A/S 건수 (TOP 6)
    @Query(value = """
    SELECT 
        c.name as categoryName,
        COUNT(r.request_id) as asCount
    FROM request r
    JOIN customer_product cp ON r.customer_product_id = cp.customer_product_id
    JOIN product p ON cp.product_id = p.product_id
    JOIN category c ON p.category_id = c.category_id
    GROUP BY c.category_id, c.name
    ORDER BY asCount DESC
    LIMIT 6
    """, nativeQuery = true)
    List<CategoryAsCountDTO> getCategoryAsCount();

    // 매출 추이 - 일별 (최근 20일)
    @Query(value = """
        SELECT 
            DAY(r.created_at) as label,
            COALESCE(SUM(rd.cost), 0) as revenue
        FROM request r
        JOIN request_detail rd ON r.request_id = rd.requests_id
        WHERE r.status = 'COMPLETED'
        
        GROUP BY DAY(r.created_at), MONTH(r.created_at), YEAR(r.created_at)
        ORDER BY YEAR(r.created_at) ASC, MONTH(r.created_at) ASC, DAY(r.created_at) ASC
        """, nativeQuery = true)
    List<RevenueDTO> getDailyRevenue();

    // 매출 추이 - 월별 (최근 12개월)
    @Query(value = """
        SELECT 
            MONTH(r.created_at) as label,
            COALESCE(SUM(rd.cost), 0) as revenue
        FROM request r
        JOIN request_detail rd ON r.request_id = rd.requests_id
        WHERE r.status = 'COMPLETED'
        
        GROUP BY YEAR(r.created_at), MONTH(r.created_at)
        ORDER BY YEAR(r.created_at) ASC, MONTH(r.created_at) ASC
        """, nativeQuery = true)
    List<RevenueDTO> getMonthlyRevenue();

    // 매출 추이 - 연별 (최근 5년)
    @Query(value = """
        SELECT 
            YEAR(r.created_at) as label,
            COALESCE(SUM(rd.cost), 0) as revenue
        FROM request r
        JOIN request_detail rd ON r.request_id = rd.requests_id
        WHERE r.status = 'COMPLETED'
        AND r.created_at >= DATE_SUB(CURDATE(), INTERVAL 5 YEAR)
        GROUP BY YEAR(r.created_at)
        ORDER BY YEAR(r.created_at)
        """, nativeQuery = true)
    List<RevenueDTO> getYearlyRevenue();

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