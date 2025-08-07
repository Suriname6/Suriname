package com.suriname.analytics.service;

import com.suriname.analytics.dto.CategoryCountDTO;
import com.suriname.analytics.dto.EmployeeStatsDTO;
import com.suriname.analytics.dto.RequestTrendDTO;
import com.suriname.analytics.dto.SummaryResponseDTO;
import com.suriname.analytics.entity.RequestStatus;
import com.suriname.analytics.repository.CustomAnalyticsRepository;
import com.suriname.request.entity.Request;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final CustomAnalyticsRepository customAnalyticsRepository;

    public SummaryResponseDTO getSummary(String period) {
        LocalDateTime startDate = switch (period.toUpperCase()) {
            case "WEEK" -> LocalDate.now().with(DayOfWeek.MONDAY).atStartOfDay();
            case "MONTH" -> LocalDate.now().withDayOfMonth(1).atStartOfDay();
            default -> LocalDate.now().atStartOfDay(); // TODAY
        };

        int newRequestCount = customAnalyticsRepository.countByCreatedAtAfter(startDate);
        int inProgressCount = customAnalyticsRepository.countByStatusIn(List.of(Request.Status.REPAIRING, Request.Status.WAITING_FOR_PAYMENT));
        int completedCount = customAnalyticsRepository.countByStatus(Request.Status.COMPLETED);
        int totalRequestCount = customAnalyticsRepository.countAll();


        return new SummaryResponseDTO(
                newRequestCount, inProgressCount, completedCount, totalRequestCount
        );
    }

    public List<RequestTrendDTO> getRequestTrend(String groupBy) {
        String format = switch (groupBy) {
            case "daily" -> "%Y-%m-%d";
            case "weekly" -> "%Y-%u";
            case "monthly" -> "%Y-%m";
            case "yearly" -> "%Y";
            default -> throw new IllegalArgumentException("Invalid groupBy: " + groupBy);
        };

        List<Object[]> result = customAnalyticsRepository.findRequestTrend(format);
        return result.stream()
                .map(row -> new RequestTrendDTO((String) row[0], ((Number) row[1]).longValue()))
                .toList();
    }

    public List<CategoryCountDTO> getAsCountByCategory() {
        List<Object[]> results = customAnalyticsRepository.countRequestsByCategory();
        return results.stream()
                .map(row -> new CategoryCountDTO((String) row[0], (String) row[1], ((Number) row[2]).longValue()))
                .toList();
    }

    public List<EmployeeStatsDTO> getEmployeeStats() {
        List<Object[]> rawData = customAnalyticsRepository.getEmployeeStatsRaw();

        return rawData.stream().map(row -> new EmployeeStatsDTO(
                ((Number) row[0]).longValue(),      // employeeId
                (String) row[1],                    // employeeName
                ((Number) row[2]).longValue(),      // assignedCount
                ((Number) row[3]).longValue(),      // completedCount
                ((Number) row[4]).doubleValue(),    // completionRate
                row[5] != null ? ((Number) row[5]).doubleValue() : null // averageRating
        )).toList();
    }
}
