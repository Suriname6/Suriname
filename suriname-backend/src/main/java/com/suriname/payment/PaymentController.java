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
            System.out.println("Payment API called with params: page=" + page + ", size=" + size + 
                             ", customerName=" + customerName + ", receptionNumber=" + receptionNumber + 
                             ", bankName=" + bankName + ", paymentAmount=" + paymentAmount + 
                             ", status=" + status + ", startDate=" + startDate + ", endDate=" + endDate);
            
            PaymentPageResponse response = paymentService.getPaymentsWithSearch(
                page, size, customerName, receptionNumber, bankName, paymentAmount, status, startDate, endDate);
            
            System.out.println("Payment API response: " + response.getTotalElements() + " elements found");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error in getPayments controller: " + e.getMessage());
            e.printStackTrace();
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