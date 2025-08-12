package com.suriname.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 결제 목록 조회 (페이징 및 검색)
    @GetMapping
    public ResponseEntity<PaymentPageResponse> getPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String receptionNumber,
            @RequestParam(required = false) String bankName,
            @RequestParam(required = false) String paymentAmount,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        try {
            
            PaymentPageResponse response = paymentService.getPaymentsWithSearch(
                page, size, customerName, receptionNumber, bankName, paymentAmount, status, startDate, endDate);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new PaymentPageResponse(
                java.util.Collections.emptyList(), 0, 0, page, size, true, true));
        }
    }

    // 결제 삭제
    @DeleteMapping("/{paymentId}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long paymentId) {
        paymentService.deletePayment(paymentId);
        return ResponseEntity.ok().build();
    }

    // 여러 결제 삭제
    @DeleteMapping
    public ResponseEntity<Void> deletePayments(@RequestBody List<Long> paymentIds) {
        paymentService.deletePayments(paymentIds);
        return ResponseEntity.ok().build();
    }

    // 가상계좌 발급
    @PostMapping("/virtual-account")
    public ResponseEntity<VirtualAccountResponseDto> createVAccount(@RequestBody VirtualAccountRequestDto dto) {
        VirtualAccountResponseDto res = paymentService.issueVirtualAccount(dto);
        return ResponseEntity.ok(res);
    }

    // 토스페이먼츠 webhook 수신
    @PostMapping("/webhook/toss")
    public ResponseEntity<Void> tossWebhook(@RequestBody String payload,
                                           @RequestHeader(value = "X-Toss-Signature", required = false) String signature) {
        try {

            // 웹훅 서명 검증 (테스트 환경에서는 스킵)
            if (signature != null) {
                if (!paymentService.verifyTossWebhookSignature(payload, signature)) {
                    return ResponseEntity.badRequest().build();
                }
            }

            // JSON 파싱
            JsonNode webhookData = objectMapper.readTree(payload);
            paymentService.handleTossWebhook(webhookData);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}