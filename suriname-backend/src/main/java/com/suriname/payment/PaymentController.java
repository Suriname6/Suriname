package com.suriname.payment;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    // 결제 목록 조회
    @GetMapping
    public ResponseEntity<List<Payment>> getPayments() {
        List<Payment> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }

    // 가상계좌 발급
    @PostMapping("/virtual-account")
    public ResponseEntity<VirtualAccountResponseDto> createVAccount(@RequestBody VirtualAccountRequestDto dto) {
        VirtualAccountResponseDto res = paymentService.issueVirtualAccount(dto);
        return ResponseEntity.ok(res);
    }

    // 포트원 webhook 수신
    @PostMapping("/webhook/portone")
    public ResponseEntity<Void> portoneWebhook(@RequestBody PortOneWebhookDto dto,
                                               @RequestHeader(value = "X-PortOne-Signature", required = false) String signature,
                                               HttpServletRequest request) {

        // 웹훅 서명 검증을 위해 raw body 읽기
        if (signature != null) {
            try {
                String rawBody = getRawBody(request);
                if (!paymentService.verifyWebhookSignature(rawBody, signature)) {
                    return ResponseEntity.badRequest().build();
                }
            } catch (IOException e) {
                return ResponseEntity.badRequest().build();
            }
        }

        paymentService.handleWebhook(dto);
        return ResponseEntity.ok().build();
    }

    private String getRawBody(HttpServletRequest request) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        return sb.toString();
    }
}