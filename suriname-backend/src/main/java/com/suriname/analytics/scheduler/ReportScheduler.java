package com.suriname.analytics.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.suriname.analytics.service.ReportSchedulerService;

@Component
public class ReportScheduler {
    private ReportSchedulerService reportSchedulerService;

    // 매일 오전 9시에 PDF 생성
    @Scheduled(cron = "0 0 9 * * ?")
    public void generateDailyReport() {
        reportSchedulerService.createStatisticsReportPdf();
        // 필요하다면 파일로 저장하거나 이메일로 전송하는 로직 추가
    }
}
