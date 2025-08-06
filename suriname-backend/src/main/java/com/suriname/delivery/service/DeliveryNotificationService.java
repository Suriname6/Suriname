package com.suriname.delivery.service;

import com.suriname.delivery.entity.Delivery;
import com.suriname.notification.entity.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryNotificationService {

    private final RestTemplate restTemplate;

    // SMS API 설정 (실제 환경에서는 application.yml에서 관리)
    @Value("${sms.api.url:https://api.coolsms.co.kr/sms/4/send}")
    private String smsApiUrl;

    @Value("${sms.api.key:dummy-key}")
    private String smsApiKey;

    @Value("${sms.api.secret:dummy-secret}")
    private String smsApiSecret;

    @Value("${sms.sender.phone:1588-0000}")
    private String senderPhone;

    /**
     * 배송 시작 SMS 발송
     */
    public void sendDeliveryStartNotification(Delivery delivery) {
        try {
            String message = String.format(
                "[서비스센터] %s님의 A/S 제품이 배송 시작되었습니다.\n" +
                "접수번호: %s\n" +
                "택배사: %s\n" +
                "송장번호: %s\n" +
                "배송조회: https://example.com/tracking/%s",
                delivery.getRequest().getCustomer().getName(),
                delivery.getRequest().getRequestNo(),
                delivery.getCarrierName(),
                delivery.getTrackingNo(),
                delivery.getTrackingNo()
            );

            sendSms(delivery.getPhone(), message);
            
            log.info("배송 시작 SMS 발송 완료 - 접수번호: {}, 연락처: {}", 
                delivery.getRequest().getRequestNo(), delivery.getPhone());

        } catch (Exception e) {
            log.error("배송 시작 SMS 발송 실패 - 배송 ID: {}", delivery.getDeliveryId(), e);
        }
    }

    /**
     * 배송 완료 SMS 발송
     */
    public void sendDeliveryCompletionNotification(Delivery delivery) {
        try {
            String message = String.format(
                "[서비스센터] %s님의 A/S 제품이 배송 완료되었습니다.\n" +
                "접수번호: %s\n" +
                "배송완료일: %s\n" +
                "문의사항이 있으시면 고객센터(1588-0000)로 연락주세요.",
                delivery.getRequest().getCustomer().getName(),
                delivery.getRequest().getRequestNo(),
                java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
            );

            sendSms(delivery.getPhone(), message);
            
            log.info("배송 완료 SMS 발송 완료 - 접수번호: {}, 연락처: {}", 
                delivery.getRequest().getRequestNo(), delivery.getPhone());

        } catch (Exception e) {
            log.error("배송 완료 SMS 발송 실패 - 배송 ID: {}", delivery.getDeliveryId(), e);
        }
    }

    /**
     * 배송 지연 SMS 발송 (관리자용)
     */
    public void sendDeliveryDelayNotification(Delivery delivery, String adminPhone) {
        try {
            String message = String.format(
                "[관리자 알림] 배송 지연 발생\n" +
                "접수번호: %s\n" +
                "고객명: %s\n" +
                "택배사: %s\n" +
                "송장번호: %s\n" +
                "등록일: %s\n" +
                "확인 및 조치가 필요합니다.",
                delivery.getRequest().getRequestNo(),
                delivery.getRequest().getCustomer().getName(),
                delivery.getCarrierName(),
                delivery.getTrackingNo(),
                delivery.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd"))
            );

            sendSms(adminPhone, message);
            
            log.info("배송 지연 관리자 SMS 발송 완료 - 접수번호: {}, 관리자 연락처: {}", 
                delivery.getRequest().getRequestNo(), adminPhone);

        } catch (Exception e) {
            log.error("배송 지연 관리자 SMS 발송 실패 - 배송 ID: {}", delivery.getDeliveryId(), e);
        }
    }

    /**
     * SMS 발송 공통 메서드
     */
    private void sendSms(String toPhone, String message) {
        try {
            // SMS API 요청 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "HMAC-SHA256 ApiKey=" + smsApiKey + ", Date=" + 
                java.time.Instant.now().toString() + ", Salt=" + generateSalt() + 
                ", Signature=" + generateSignature());

            // SMS API 요청 바디 설정
            Map<String, Object> requestBody = Map.of(
                "message", Map.of(
                    "to", formatPhoneNumber(toPhone),
                    "from", senderPhone,
                    "text", message,
                    "type", "SMS"
                )
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // 실제 환경에서는 SMS API 호출
            // ResponseEntity<Map> response = restTemplate.exchange(smsApiUrl, HttpMethod.POST, entity, Map.class);
            
            // 개발 환경에서는 로그로 대체
            log.info("SMS 발송 시뮬레이션 - 수신번호: {}, 메시지: {}", toPhone, message);
            
        } catch (Exception e) {
            log.error("SMS 발송 실패 - 수신번호: {}", toPhone, e);
            throw new RuntimeException("SMS 발송에 실패했습니다.", e);
        }
    }

    /**
     * 전화번호 형식 정규화
     */
    private String formatPhoneNumber(String phone) {
        if (phone == null) return null;
        
        // 하이픈 제거 후 01x-xxxx-xxxx 형식으로 변환
        String cleanPhone = phone.replaceAll("[^0-9]", "");
        if (cleanPhone.startsWith("010") && cleanPhone.length() == 11) {
            return cleanPhone.substring(0, 3) + "-" + cleanPhone.substring(3, 7) + "-" + cleanPhone.substring(7);
        }
        return phone; // 형식이 맞지 않으면 원본 반환
    }

    /**
     * SMS API 인증을 위한 Salt 생성
     */
    private String generateSalt() {
        return String.valueOf(System.currentTimeMillis());
    }

    /**
     * SMS API 인증을 위한 Signature 생성
     */
    private String generateSignature() {
        // TODO: 실제 SMS API 제공업체의 인증 방식에 맞게 구현
        return "dummy-signature";
    }

    /**
     * 배송 상태별 알림 메시지 템플릿
     */
    public String getNotificationTemplate(Delivery.Status status, Delivery delivery) {
        switch (status) {
            case PENDING:
                return String.format(
                    "[서비스센터] %s님의 A/S 제품 배송이 접수되었습니다.\n접수번호: %s",
                    delivery.getRequest().getCustomer().getName(),
                    delivery.getRequest().getRequestNo()
                );
            case SHIPPED:
                return String.format(
                    "[서비스센터] %s님의 A/S 제품이 배송 중입니다.\n송장번호: %s",
                    delivery.getRequest().getCustomer().getName(),
                    delivery.getTrackingNo()
                );
            case DELIVERED:
                return String.format(
                    "[서비스센터] %s님의 A/S 제품이 배송 완료되었습니다.\n접수번호: %s",
                    delivery.getRequest().getCustomer().getName(),
                    delivery.getRequest().getRequestNo()
                );
            default:
                return "배송 상태가 업데이트되었습니다.";
        }
    }
}