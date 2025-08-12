package com.suriname.analytics.scheduler;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.suriname.analytics.service.ReportSchedulerService;
import com.suriname.payment.SmsService;

@Component
@RequiredArgsConstructor
public class ReportScheduler {
    private final ReportSchedulerService reportSchedulerService;

    // 매일 오전 9시에 PDF 생성
    @Scheduled(cron = "0 0 9 * * ?")
    // 테스트용 2분 간격 스케줄링
//    @Scheduled(cron = "0 */2 * * * ?")
    public void generateDailyReport() {
        reportSchedulerService.createStatisticsReportPdf();
    }
}
