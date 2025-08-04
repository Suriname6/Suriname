package com.suriname.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.suriname.request.entity.Request;
import com.suriname.request.entity.RequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.List;

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
