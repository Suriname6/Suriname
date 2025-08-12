package com.suriname.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class TossPaymentsClient {

    private final RestTemplate rest = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${toss.secret-key}")
    private String secretKey;

    private static final String TOSS_API_URL = "https://api.tosspayments.com/v1";
    private static final String API_VERSION = "2022-11-16";

    public JsonNode issueVirtualAccount(String orderId, VirtualAccountRequestDto dto) {
        String url = TOSS_API_URL + "/virtual-accounts";

        HttpHeaders headers = new HttpHeaders();
        String encodedAuth = Base64.getEncoder().encodeToString(
            (secretKey + ":").getBytes(StandardCharsets.UTF_8)
        );
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.set("TossPayments-API-Version", API_VERSION);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 토스페이먼츠 2022-11-16 API 가상계좌 발급 요청 본문
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("amount", dto.getAmount());
        requestBody.put("orderId", orderId);
        requestBody.put("orderName", "수리 서비스 결제 - " + dto.getVbankHolder());
        requestBody.put("customerName", dto.getVbankHolder());
        requestBody.put("bank", "신한"); // 가상계좌 은행 (신한, 국민, 하나, 기업, 농협, 우리 등)
        requestBody.put("validHours", 168); // 7일(168시간) 유효 (최대 720시간)
        requestBody.put("customerMobilePhone", dto.getCustomerPhone());


        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            ResponseEntity<String> response = rest.postForEntity(url, entity, String.class);
            
            JsonNode responseNode = objectMapper.readTree(response.getBody());
            return responseNode;
            
        } catch (Exception e) {
            throw new RuntimeException("가상계좌 발급 실패: " + e.getMessage(), e);
        }
    }
}