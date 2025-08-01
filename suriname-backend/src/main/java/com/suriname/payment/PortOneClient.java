package com.suriname.payment;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class PortOneClient {
    private final RestTemplate restTemplate = new RestTemplate();
    private final PortOneConfig config;

    public PortOneVbankRes issueVirtualAccountV2(String merchantUid, int amount) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "PortOne " + config.getSecretKey());
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("merchant_uid", merchantUid);
        body.put("pay_method", "vbank");
        body.put("amount", amount);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> res = restTemplate.postForEntity(
                "https://api.portone.io/v2/payments/prepare",
                entity,
                Map.class
        );

        Map<String, Object> data = (Map<String, Object>) res.getBody().get("response");
        return new PortOneVbankRes(
                String.valueOf(data.get("vbank_code")),
                String.valueOf(data.get("vbank_num"))
        );
    }

    public record PortOneVbankRes(String bankCode, String accountNumber) {}
}
