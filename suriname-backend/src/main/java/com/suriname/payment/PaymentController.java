package com.suriname.payment;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/virtual/{requestId}")
    public ResponseEntity<PaymentResponseDto> issueVbank(
            @PathVariable Long requestId,
            @RequestParam int amount) {
        return ResponseEntity.ok(paymentService.createVirtualAccount(requestId, amount));
    }
}