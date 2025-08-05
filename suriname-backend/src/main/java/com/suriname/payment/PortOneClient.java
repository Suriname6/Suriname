package com.suriname.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class PortOneClient {

    private final RestTemplate rest = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${portone.secret-key}")
    private String apiSecret;

    @Value("${portone.hostname}")
    private String hostname;

    public JsonNode issueVirtualAccount(String merchantUid, VirtualAccountRequestDto dto) {
        // 포트원 V2 API - 결제 수단으로 가상계좌 예약
        String url = hostname + "/payments/" + merchantUid + "/virtual-account";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "PortOne " + apiSecret);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 포트원 V2 가상계좌 예약 API 요청 본문
        Map<String, Object> requestBody = new HashMap<>();
        
        // 필수 필드
        requestBody.put("channelKey", "channel-key-" + System.currentTimeMillis()); // 실제 채널키로 변경 필요
        requestBody.put("orderName", "수리 서비스 결제 - " + dto.getVbankHolder());
        
        // 금액 정보
        Map<String, Object> totalAmount = new HashMap<>();
        totalAmount.put("value", dto.getAmount());
        totalAmount.put("currency", "KRW");
        requestBody.put("totalAmount", totalAmount);
        
        // 고객 정보
        Map<String, Object> customer = new HashMap<>();
        customer.put("fullName", dto.getVbankHolder());
        requestBody.put("customer", customer);
        
        // 가상계좌 옵션
        Map<String, Object> virtualAccount = new HashMap<>();
        Map<String, Object> expiry = new HashMap<>();
        expiry.put("dueDate", dto.getVbankDue()); // ISO 8601 형식
        virtualAccount.put("expiry", expiry);
        virtualAccount.put("accountHolder", dto.getVbankHolder());
        requestBody.put("virtualAccount", virtualAccount);

        System.out.println("포트원 V2 가상계좌 예약 요청: " + requestBody);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            ResponseEntity<String> response = rest.postForEntity(url, entity, String.class);
            System.out.println("포트원 V2 응답: " + response.getBody());
            
            JsonNode responseNode = objectMapper.readTree(response.getBody());
            
            // V2 API 응답 구조 확인
            if (responseNode.has("virtualAccount")) {
                return responseNode.get("virtualAccount");
            } else if (responseNode.has("data") && responseNode.get("data").has("virtualAccount")) {
                return responseNode.get("data").get("virtualAccount");
            } else {
                // 전체 응답 반환하여 디버깅
                System.out.println("가상계좌 정보를 찾을 수 없습니다. 전체 응답: " + responseNode.toString());
                return responseNode;
            }
        } catch (Exception e) {
            System.err.println("포트원 V2 가상계좌 예약 실패: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("가상계좌 발급 실패: " + e.getMessage(), e);
        }
    }
}
