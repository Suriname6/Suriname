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
        String url = hostname + "/payments/" + merchantUid + "/virtual-account";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "PortOne " + apiSecret);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 포트원 V2 API에 맞는 요청 본문 구성
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("channelKey", "channel-key-" + System.currentTimeMillis());
        requestBody.put("orderName", "수리 서비스 결제");
        requestBody.put("totalAmount", dto.getAmount());
        requestBody.put("currency", "KRW");
        
        Map<String, Object> customer = new HashMap<>();
        customer.put("fullName", dto.getVbankHolder());
        requestBody.put("customer", customer);
        
        Map<String, Object> virtualAccount = new HashMap<>();
        virtualAccount.put("expiry", Map.of("validHours", 48)); // 48시간 후 만료
        requestBody.put("virtualAccount", virtualAccount);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = rest.postForEntity(url, entity, String.class);

        try {
            JsonNode responseNode = objectMapper.readTree(response.getBody());
            if (responseNode.has("virtualAccount")) {
                return responseNode.get("virtualAccount");
            }
            throw new RuntimeException("가상계좌 정보가 응답에 없습니다");
        } catch (Exception e) {
            throw new RuntimeException("가상계좌 발급 응답 파싱 실패: " + e.getMessage(), e);
        }
    }
}
