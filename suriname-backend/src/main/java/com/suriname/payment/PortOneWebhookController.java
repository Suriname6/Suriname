package com.suriname.payment;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/webhook/portone")
public class PortOneWebhookController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<Void> handle(@RequestBody Map<String, Object> payload,
                                       @RequestHeader Map<String, String> headers) {
        String status = String.valueOf(payload.get("status"));
        String merchantUid = String.valueOf(payload.get("merchant_uid"));

        if ("paid".equalsIgnoreCase(status) && merchantUid != null) {
            paymentService.completeByMerchantUid(merchantUid);
        }

        return ResponseEntity.ok().build(); // PortOne은 200 OK를 요구함
    }
}
