package com.suriname.analytics.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    public void sendReportEmail(String filePath, String toEmail) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            String reportFileName = "report_" + java.time.LocalDate.now() + ".pdf";
            helper.setTo(toEmail);
            helper.setSubject("정기 PDF 리포트");
            helper.setText("첨부파일로 리포트를 확인하세요.");
            helper.addAttachment(reportFileName, new File(filePath));
            mailSender.send(message);
            System.out.println("이메일 전송 완료");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}