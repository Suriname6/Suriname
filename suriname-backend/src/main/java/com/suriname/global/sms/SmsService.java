package com.suriname.global.sms;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SmsService {

    private final RestTemplate restTemplate = new RestTemplate();
    //private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${sms.api.url}")
    private String apiUrl;

    @Value("${sms.api.key}")
    private String apiKey;

    @Value("${sms.api.secret}")
    private String apiSecret;

    @Value("${sms.sender.phone}")
    private String senderPhone;

    public void sendVirtualAccountSms(String customerPhone, String customerName, String bank, String account, String amount) {
        try {
            String message = String.format(
                "[Suriname] %s고객님, 수리남을 이용해주셔서 감사드립니다.\n"+
                "가상계좌은행: %s\n" +
                "가상계좌번호: %s\n" +
                "입금액: %s원\n\n" +
                "7일 이내 입금 부탁드립니다.",
                customerName, bank, account, amount
            );

            sendSms(customerPhone, message);
            
        } catch (Exception e) {
        }
    }

    private void sendSms(String to, String text) {
        try {
            String salt = UUID.randomUUID().toString().replaceAll("-", "");
            String date = Instant.now().toString();
            String signature = makeSignature(date, salt);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "HMAC-SHA256 apiKey=" + apiKey + ", date=" + date + ", salt=" + salt + ", signature=" + signature);

            // Solapi v4 API 형식
            Map<String, Object> message = new HashMap<>();
            message.put("to", to);
            message.put("from", senderPhone);
            message.put("text", text);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("message", message);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);

        } catch (Exception e) {
            throw new RuntimeException("SMS 발송 실패", e);
        }
    }

    private String makeSignature(String date, String salt) throws NoSuchAlgorithmException, InvalidKeyException {
        String message = date + salt;
        
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(apiSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        
        byte[] hash = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
        
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        
        return hexString.toString();
    }
}