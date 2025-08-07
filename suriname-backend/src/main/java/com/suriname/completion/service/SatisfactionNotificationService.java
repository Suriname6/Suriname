package com.suriname.completion.service;

import com.suriname.completion.entity.Completion;
import com.suriname.completion.repository.CompletionRepository;
import com.suriname.delivery.service.DeliveryNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 만족도 설문 발송 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SatisfactionNotificationService {

    private final CompletionRepository completionRepository;

    @Value("${app.frontend.url:http://localhost:3001}")
    private String frontendUrl;

    /**
     * 완료 처리 후 만족도 설문 자동 발송
     */
    @Transactional
    public void sendSatisfactionSurvey(Completion completion) {
        try {
            // 이미 설문 요청이 발송된 경우 중복 방지
            if (completion.getSatisfactionRequested()) {
                log.warn("이미 만족도 설문이 발송된 건입니다. 완료 ID: {}", completion.getCompletionId());
                return;
            }

            // 설문 링크 생성
            String surveyUrl = generateSurveyUrl(completion);
            
            // SMS 메시지 생성
            String message = createSurveyMessage(completion, surveyUrl);
            
            // SMS 발송 (시뮬레이션)
            sendSurveySms(completion, message);
            
            // 설문 요청 상태 업데이트
            completion.markSatisfactionRequested();
            completion.setSatisfactionSentDate(LocalDateTime.now());
            completionRepository.save(completion);
            
            log.info("만족도 설문 발송 완료 - 접수번호: {}, 고객: {}", 
                completion.getRequest().getRequestNo(), 
                completion.getRequest().getCustomer().getName());

        } catch (Exception e) {
            log.error("만족도 설문 발송 실패 - 완료 ID: {}", completion.getCompletionId(), e);
        }
    }

    /**
     * 설문 URL 생성
     */
    private String generateSurveyUrl(Completion completion) {
        return String.format("%s/survey?requestNo=%s&completionId=%d",
            frontendUrl,
            completion.getRequest().getRequestNo(),
            completion.getCompletionId());
    }

    /**
     * 설문 SMS 메시지 생성
     */
    private String createSurveyMessage(Completion completion, String surveyUrl) {
        return String.format(
            "[서비스센터] %s님, A/S 서비스가 완료되었습니다.\n" +
            "서비스 만족도 조사에 참여해주세요.\n" +
            "접수번호: %s\n" +
            "설문링크: %s\n" +
            "감사합니다.",
            completion.getRequest().getCustomer().getName(),
            completion.getRequest().getRequestNo(),
            surveyUrl
        );
    }

    /**
     * 설문 SMS 발송
     */
    private void sendSurveySms(Completion completion, String message) {
        String customerPhone = completion.getRequest().getCustomer().getPhone();
        
        // 실제 SMS 발송 로직 (현재는 로그로 시뮬레이션)
        log.info("만족도 설문 SMS 발송 시뮬레이션");
        log.info("수신번호: {}", customerPhone);
        log.info("메시지: {}", message);
        
        // TODO: 실제 SMS API 연동 시 구현
        // smsService.send(customerPhone, message);
    }

    /**
     * 고객 수령 확인 후 설문 발송 (수동 트리거)
     */
    @Transactional
    public void confirmCustomerReceiptAndSendSurvey(Long completionId) {
        Completion completion = completionRepository.findById(completionId)
                .orElseThrow(() -> new RuntimeException("완료 처리 정보를 찾을 수 없습니다."));

        // 고객 수령 확인
        completion.confirmCustomerReceipt(LocalDateTime.now());
        
        // 만족도 설문 발송
        sendSatisfactionSurvey(completion);
        
        log.info("고객 수령 확인 및 만족도 설문 발송 - 접수번호: {}", 
            completion.getRequest().getRequestNo());
    }
}