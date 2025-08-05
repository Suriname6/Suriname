package com.suriname.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.suriname.request.entity.Request;
import com.suriname.request.entity.RequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final RequestRepository requestRepository;
    private final PortOneClient portOneClient;
    
    @Value("${portone.secret-key}")
    private String portOneSecretKey;

    // 결제 목록 조회
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    // 검색 및 페이징이 적용된 결제 목록 조회
    public PaymentPageResponse getPaymentsWithSearch(int page, int size, String customerName, 
            String receptionNumber, String bankName, String paymentAmount, String status, String startDate, String endDate) {
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("paymentId").descending());
            Page<Payment> paymentPage;
            
            // 검색 조건이 있으면 필터링, 없으면 전체 조회
            if (hasSearchCriteria(customerName, receptionNumber, bankName, paymentAmount, status, startDate, endDate)) {
                paymentPage = paymentRepository.findWithFilters(customerName, receptionNumber, bankName, 
                        parsePaymentAmount(paymentAmount), status, parseDate(startDate), parseDate(endDate), pageable);
            } else {
                paymentPage = paymentRepository.findAll(pageable);
            }
            
            List<PaymentDto> paymentDtos = paymentPage.getContent().stream()
                    .map(payment -> {
                        try {
                            return new PaymentDto(payment);
                        } catch (Exception e) {
                            // 개별 PaymentDto 변환 실패 시 로그 출력하고 null 반환
                            System.err.println("Failed to convert payment to DTO: " + payment.getPaymentId() + ", Error: " + e.getMessage());
                            e.printStackTrace();
                            return null;
                        }
                    })
                    .filter(dto -> dto != null) // null 제거
                    .collect(Collectors.toList());
            
            return new PaymentPageResponse(
                    paymentDtos,
                    paymentPage.getTotalPages(),
                    paymentPage.getTotalElements(),
                    paymentPage.getNumber(),
                    paymentPage.getSize(),
                    paymentPage.isFirst(),
                    paymentPage.isLast()
            );
        } catch (Exception e) {
            System.err.println("Error in getPaymentsWithSearch: " + e.getMessage());
            e.printStackTrace();
            
            // 에러 발생 시 빈 응답 반환
            return new PaymentPageResponse(
                    java.util.Collections.emptyList(),
                    0, 0, page, size, true, true
            );
        }
    }
    
    @Transactional
    public void deletePayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("해당 결제가 존재하지 않습니다."));
        paymentRepository.delete(payment);
    }
    
    @Transactional
    public void deletePayments(List<Long> paymentIds) {
        List<Payment> payments = paymentRepository.findAllById(paymentIds);
        paymentRepository.deleteAll(payments);
    }
    
    private boolean hasSearchCriteria(String customerName, String receptionNumber, String bankName, 
            String paymentAmount, String status, String startDate, String endDate) {
        return (customerName != null && !customerName.trim().isEmpty()) ||
               (receptionNumber != null && !receptionNumber.trim().isEmpty()) ||
               (bankName != null && !bankName.trim().isEmpty()) ||
               (paymentAmount != null && !paymentAmount.trim().isEmpty()) ||
               (status != null && !status.trim().isEmpty()) ||
               (startDate != null && !startDate.trim().isEmpty()) ||
               (endDate != null && !endDate.trim().isEmpty());
    }
    
    private LocalDateTime parseDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return null;
        }
        try {
            return LocalDateTime.parse(dateStr + "T00:00:00", DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (Exception e) {
            return null;
        }
    }
    
    private Integer parsePaymentAmount(String amountStr) {
        if (amountStr == null || amountStr.trim().isEmpty()) {
            return null;
        }
        try {
            // 콤마 제거 후 숫자로 변환
            String cleanAmount = amountStr.replaceAll("[,\\s]", "");
            return Integer.parseInt(cleanAmount);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @Transactional
    public VirtualAccountResponseDto issueVirtualAccount(VirtualAccountRequestDto dto) {
        Request request = requestRepository.findById(dto.getRequestId())
                .orElseThrow(() -> new IllegalArgumentException("해당 수리 요청이 없습니다."));

        Payment payment = Payment.builder()
                .request(request)
                .merchantUid(dto.getMerchantUid())
                .cost(dto.getAmount())
                .status(Payment.Status.PENDING)
                .build();

        paymentRepository.save(payment);

        try {
            JsonNode response = portOneClient.issueVirtualAccount(dto.getMerchantUid(), dto);

            // 포트원 V2 응답 구조에 맞게 수정
            String bank = response.get("bankCode").asText();
            String account = response.get("accountNumber").asText();
            String dueDate = response.get("expiry").get("dueDate").asText();

            payment.setAccountAndBank(account, bank);
            paymentRepository.save(payment);

            return new VirtualAccountResponseDto(bank, account, dueDate);
        } catch (Exception e) {
            // 실패시 payment status를 FAILED로 변경
            payment = paymentRepository.findById(payment.getPaymentId()).orElse(payment);
            payment = Payment.builder()
                    .request(payment.getRequest())
                    .merchantUid(payment.getMerchantUid())
                    .cost(payment.getCost())
                    .status(Payment.Status.FAILED)
                    .memo("가상계좌 발급 실패: " + e.getMessage())
                    .build();
            paymentRepository.save(payment);
            throw new RuntimeException("가상계좌 발급에 실패했습니다: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void handleWebhook(PortOneWebhookDto webhook) {
        String eventType = webhook.getEventType();
        JsonNode data = webhook.getData();

        // 포트원 V2 웹훅 데이터 구조 분석 및 로깅
        System.out.println("웹훅 이벤트 타입: " + eventType);
        System.out.println("웹훅 데이터: " + data.toString());

        // merchantUid 추출 - 포트원 V2의 다양한 경로 확인
        final String merchantUid;
        if (data.has("merchantId")) {
            merchantUid = data.get("merchantId").asText();
        } else if (data.has("merchant_uid")) {
            merchantUid = data.get("merchant_uid").asText();
        } else if (data.has("orderName")) {
            merchantUid = data.get("orderName").asText();  
        } else if (data.has("transactionId")) {
            merchantUid = data.get("transactionId").asText();
        } else if (data.has("paymentId")) {
            // paymentId를 merchantUid로 사용 (최후 수단)
            merchantUid = data.get("paymentId").asText();
        } else {
            System.err.println("웹훅에서 merchantUid를 찾을 수 없습니다. 데이터: " + data.toString());
            return; // 오류 대신 조용히 무시
        }

        System.out.println("추출된 merchantUid: " + merchantUid);

        Payment payment = paymentRepository.findByMerchantUid(merchantUid).orElse(null);
        if (payment == null) {
            System.err.println("해당 결제를 찾을 수 없습니다: " + merchantUid);
            return; // 오류 대신 조용히 무시
        }

        switch (eventType) {
            case "Transaction.VirtualAccountIssued", "VirtualAccount.Issued" -> {
                // 포트원 V2 가상계좌 발급 완료 이벤트
                if (data.has("virtualAccount")) {
                    JsonNode virtualAccount = data.get("virtualAccount");
                    String account = virtualAccount.get("accountNumber").asText();
                    String bank = virtualAccount.get("bankCode").asText();
                    payment.setAccountAndBank(account, bank);
                    System.out.println("가상계좌 정보 업데이트: " + bank + " " + account);
                }
            }
            case "Transaction.Paid", "Payment.Paid" -> {
                // 포트원 V2 결제 완료 이벤트
                payment.markCompleted();
                System.out.println("결제 완료 처리: " + merchantUid);
            }
            case "Transaction.Failed", "Payment.Failed" -> {
                // 결제 실패 처리
                Payment failedPayment = Payment.builder()
                        .request(payment.getRequest())
                        .merchantUid(payment.getMerchantUid())
                        .account(payment.getAccount())
                        .bank(payment.getBank())
                        .cost(payment.getCost())
                        .status(Payment.Status.FAILED)
                        .memo("결제 실패: " + (data.has("failReason") ? data.get("failReason").asText() : 
                                (data.has("reason") ? data.get("reason").asText() : "알 수 없는 오류")))
                        .build();
                paymentRepository.save(failedPayment);
                System.out.println("결제 실패 처리: " + merchantUid);
                return;
            }
            default -> {
                System.out.println("처리되지 않은 웹훅 이벤트: " + eventType);
                return;
            }
        }

        paymentRepository.save(payment);
    }

    // 웹훅 서명 검증
    public boolean verifyWebhookSignature(String payload, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(portOneSecretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            
            return hexString.toString().equals(signature);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("웹훅 서명 검증 실패", e);
        }
    }
}
