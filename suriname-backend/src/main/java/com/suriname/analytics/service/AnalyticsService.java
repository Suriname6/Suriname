package com.suriname.analytics.service;

import com.suriname.analytics.dto.*;
import com.suriname.analytics.repository.CustomAnalyticsRepository;
import com.suriname.request.entity.Request;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final CustomAnalyticsRepository customAnalyticsRepository;

    // 카드형 통계
    public StatisticResponseDTO getStatistic() {
        long totalRequestCount = customAnalyticsRepository.countAll();
        long todayRequestCount = customAnalyticsRepository.countTodayRequests();
        long uncompletedCount = customAnalyticsRepository.countUncompleteRequests();
        double completedRatio = customAnalyticsRepository.getOverallCompletionRate();
        long totalRevenue = customAnalyticsRepository.getTotalRevenue();
        double averageRepairCost = customAnalyticsRepository.getAverageRepairCost();

        return new StatisticResponseDTO(
                totalRequestCount, todayRequestCount, uncompletedCount, completedRatio,
                totalRevenue, averageRepairCost
        );
    }

    // 도넛형 그래프(처리 단계별 현황)
    public StatusCountDTO getStatusCount() {
        List<StatusCountResultDTO> statusResults = customAnalyticsRepository.getStatusDistribution();
        System.out.println("📊 getStatusDistribution() 결과: " + statusResults);
        System.out.println("📊 결과 리스트가 비어있나요? " + statusResults.isEmpty());
        System.out.println("📊 결과 리스트의 사이즈: " + statusResults.size());

        long receivedCount = 0;
        long repairingCount = 0;
        long waitingForPaymentCount = 0;
        long waitingForDeliveryCount = 0;
        long completedCount = 0;

        for (StatusCountResultDTO result : statusResults) {
            System.out.println("   -> Status: " + result.status() + ", Count: " + result.count());
            switch (result.status()) {
                case "RECEIVED":
                    receivedCount = result.count();
                    break;
                case "REPAIRING":
                    repairingCount = result.count();
                    break;
                case "WAITING_FOR_PAYMENT":
                    waitingForPaymentCount = result.count();
                    break;
                case "WAITING_FOR_DELIVERY":
                    waitingForDeliveryCount = result.count();
                    break;
                case "COMPLETED":
                    completedCount = result.count();
                    break;
                // 다른 status가 있다면 여기에 추가적으로 처리 가능
            }
        }
        System.out.println(
                "receivedCount: " + receivedCount + ", " +
                "repairingCount: " + repairingCount + ", " +
                "waitingForPaymentCount: " + waitingForPaymentCount + ", " +
                "waitingForDeliveryCount: " + waitingForDeliveryCount + ", " +
                "completedCount: " + completedCount
        );
        // 최종 DTO 생성
        return new StatusCountDTO(
                receivedCount,
                repairingCount,
                waitingForPaymentCount,
                waitingForDeliveryCount,
                completedCount
        );
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
