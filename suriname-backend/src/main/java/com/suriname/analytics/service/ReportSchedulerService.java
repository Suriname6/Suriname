package com.suriname.analytics.service;

import com.itextpdf.io.source.ByteArrayOutputStream;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.itextpdf.layout.element.Paragraph;

import java.io.FileOutputStream;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportSchedulerService {

    private final AnalyticsService analyticsService;

    public void createStatisticsReportPdf() {
        try {
            String filePath = "report_" + java.time.LocalDate.now() + ".pdf";
            PdfWriter writer = new PdfWriter(new FileOutputStream(filePath));
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // 예시: 통계 데이터 가져오기
            var stats = analyticsService.getStatistic();
            var employeeStats = analyticsService.getEmployeeStats();

            // PDF에 내용 추가
            document.add(new Paragraph("통합 통계 리포트").setBold().setFontSize(18));
            document.add(new Paragraph("총 요청: " + stats.totalRequestCount()));
            document.add(new Paragraph("오늘 요청: " + stats.todayRequestCount()));
            document.add(new Paragraph("미완료 요청: " + stats.uncompletedCount()));
            document.add(new Paragraph("완료율: " + String.format("%.1f%%", stats.completedRatio() * 100)));
            document.add(new Paragraph("총 매출: " + stats.totalRevenue()));
            document.add(new Paragraph("평균 수리비: " + stats.averageRepairCost()));

            document.add(new Paragraph("\n직원별 성과"));
            for (var emp : employeeStats) {
                document.add(new Paragraph(
                    emp.employeeName() + " - 배정: " + emp.assignedCount() +
                    ", 완료: " + emp.completedCount() +
                    ", 완료율: " + String.format("%.1f%%", emp.completionRate() * 100)
                ));
            }

            document.close();
            log.info("PDF 리포트 생성 완료: " + filePath);
        } catch (Exception e) {
            log.error("PDF 리포트 생성 중 오류 발생", e);
        }
    }
}
