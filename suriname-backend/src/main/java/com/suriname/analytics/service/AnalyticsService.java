package com.suriname.analytics.service;

import com.suriname.analytics.dto.SummaryResponseDTO;
import com.suriname.analytics.entity.RequestStatus;
import com.suriname.analytics.repository.CustomAnalyticsRepository;
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
        int inProgressCount = customAnalyticsRepository.countByStatusIn(List.of(RequestStatus.REPAIRING, RequestStatus.WAITING_FOR_PAYMENT));
        int completedCount = customAnalyticsRepository.countByStatus(RequestStatus.COMPLETED);
        int totalRequestCount = customAnalyticsRepository.countAll();


        return new SummaryResponseDTO(
                newRequestCount, inProgressCount, completedCount, totalRequestCount
        );
    }
}
