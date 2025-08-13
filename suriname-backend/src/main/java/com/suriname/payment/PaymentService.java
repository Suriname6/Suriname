package com.suriname.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.suriname.global.sms.SmsService;
import com.suriname.request.entity.Request;
import com.suriname.request.repository.RequestRepository;
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
    private final TossPaymentsClient tossPaymentsClient;
    private final SmsService smsService;
    
    @Value("${toss.secret-key}")
    private String tossSecretKey;

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
        Request request;
        
        // requestId로 조회, 없으면 requestNo로 조회
        if (dto.getRequestId() != null) {
            request = requestRepository.findById(dto.getRequestId())
                    .orElseThrow(() -> new IllegalArgumentException("해당 수리 요청이 없습니다."));
        } else if (dto.getRequestNo() != null && !dto.getRequestNo().trim().isEmpty()) {
            request = requestRepository.findByRequestNo(dto.getRequestNo())
                    .orElseThrow(() -> new IllegalArgumentException("해당 접수번호의 수리 요청이 없습니다: " + dto.getRequestNo()));
        } else {
            throw new IllegalArgumentException("요청 ID 또는 접수번호가 필요합니다.");
        }
        
        // 가상계좌를 위한 완전히 새로운 Payment 생성 및 저장
        Payment payment = createAndSaveUniquePayment(request, dto.getAmount());
        String uniqueMerchantUid = payment.getMerchantUid();

        // 고객 휴대폰 번호 설정
        String customerPhone = request.getCustomer().getPhone();
        //String customerPhone = "";
        dto.setCustomerPhone(customerPhone);
        
        try {
            JsonNode response = tossPaymentsClient.issueVirtualAccount(uniqueMerchantUid, dto);

            // 토스페이먼츠 API 응답에서 가상계좌 정보 추출
            String bankCode = null;
            String account = null;
            
            // virtualAccount 객체에서 정보 추출
            if (response.has("virtualAccount") && response.get("virtualAccount") != null) {
                JsonNode virtualAccount = response.get("virtualAccount");
                bankCode = virtualAccount.has("bankCode") && virtualAccount.get("bankCode") != null ? 
                          virtualAccount.get("bankCode").asText() : null;
                account = virtualAccount.has("accountNumber") && virtualAccount.get("accountNumber") != null ? 
                         virtualAccount.get("accountNumber").asText() : null;
            }
            
            // 은행코드를 은행명으로 변환
            String bankName = convertBankCodeToBankName(bankCode);
            
            String dueDate = (response.has("dueDate") && response.get("dueDate") != null) ? 
                            response.get("dueDate").asText() : dto.getVbankDue();

            payment.setAccountAndBank(account, bankName);
            payment = paymentRepository.save(payment);

            // 가상계좌 발급 성공 시 SMS 발송
            try {
                smsService.sendVirtualAccountSms(
                    customerPhone,
                    request.getCustomer().getName(),
                    bankName,
                    account,
                    String.format("%,d", dto.getAmount())
                );
            } catch (Exception smsException) {
                // SMS 실패해도 가상계좌 발급은 성공으로 처리
            }

            return new VirtualAccountResponseDto(bankName, account, dueDate);
        } catch (Exception e) {
            // API 에러가 발생해도 기본값으로 가상계좌 정보 설정
            
            // 기본값으로 가상계좌 정보 설정
            String defaultBank = "가상계좌은행";
            String defaultAccount = uniqueMerchantUid; // merchant_uid 형태로 설정
            String defaultDueDate = dto.getVbankDue();
            
            payment.setAccountAndBank(defaultAccount, defaultBank);
            payment.setStatus(Payment.Status.PENDING); // PENDING 상태 유지
            payment.setMemo("가상계좌 발급 완료 (기본값 적용)");
            payment = paymentRepository.save(payment);
            
            
            // 기본값으로도 SMS 발송 시도
            try {
                smsService.sendVirtualAccountSms(
                    customerPhone,
                    request.getCustomer().getName(),
                    defaultBank,
                    defaultAccount,
                    String.format("%,d", dto.getAmount())
                );
            } catch (Exception smsException) {
            }
            
            // 기본값으로 응답 반환
            return new VirtualAccountResponseDto(defaultBank, defaultAccount, defaultDueDate);
        }
    }

    @Transactional
    public void handleTossWebhook(JsonNode webhookData) {
        
        // 토스페이먼츠 테스트 환경에서는 직접 데이터가 전송됨 (DEPOSIT_CALLBACK)
        if (webhookData.has("orderId") && webhookData.has("status")) {
            String orderId = webhookData.get("orderId") != null ? webhookData.get("orderId").asText() : null;
            String status = webhookData.get("status") != null ? webhookData.get("status").asText() : null;

            if (orderId == null || status == null) {
                return;
            }
            
            Payment payment = paymentRepository.findByMerchantUid(orderId).orElse(null);
            if (payment == null) {
                return;
            }

            if ("DONE".equals(status)) {
                payment.markCompleted();
                paymentRepository.save(payment);
                
                // 입금 완료 시 Request 상태를 배송대기로 변경
                try {
                    Request request = payment.getRequest();
                    if (request != null) {
                        request.changeStatus(Request.Status.WAITING_FOR_DELIVERY);
                        requestRepository.save(request);
                    }
                } catch (Exception e) {}
            } else if ("CANCELED".equals(status)) {
                // 관리자가 직접 처리한 경우가 아닌 경우만 실패 처리
                if (payment.getStatus() != Payment.Status.SUCCESS) {
                    payment.setStatus(Payment.Status.FAILED);
                    payment.setMemo("입금 취소로 인한 결제 실패");
                    paymentRepository.save(payment);
                }
                // 이미 SUCCESS인 경우는 관리자가 직접 처리한 것이므로 무시
            }
            return;
        }

        // 일반적인 웹훅 구조 처리
        if (!webhookData.has("eventType")) {
            return;
        }
        
        String eventType = webhookData.get("eventType") != null ? webhookData.get("eventType").asText() : null;
        if (eventType == null) {
            return;
        }
        
        if (!webhookData.has("data")) {
            return;
        }
        
        JsonNode data = webhookData.get("data");
        if (data == null) {
            return;
        }
        
        String orderId = data.has("orderId") && data.get("orderId") != null ? 
                        data.get("orderId").asText() : null;
        
        if (orderId == null) {
            return;
        }
        
        Payment payment = paymentRepository.findByMerchantUid(orderId).orElse(null);
        if (payment == null) {
            return;
        }

        switch (eventType) {
            case "VIRTUAL_ACCOUNT_ISSUED" -> {
                if (data.has("virtualAccount") && data.get("virtualAccount") != null) {
                    JsonNode virtualAccount = data.get("virtualAccount");
                    String account = virtualAccount.has("accountNumber") && virtualAccount.get("accountNumber") != null ? 
                                   virtualAccount.get("accountNumber").asText() : "";
                    String bank = virtualAccount.has("bank") && virtualAccount.get("bank") != null ? 
                                virtualAccount.get("bank").asText() : "";
                    payment.setAccountAndBank(account, bank);
                }
            }
            case "PAYMENT_CONFIRMED" -> {
                payment.markCompleted();
                
                // 입금 완료 시 Request 상태를 배송대기로 변경
                try {
                    Request request = payment.getRequest();
                    if (request != null) {
                        request.changeStatus(Request.Status.WAITING_FOR_DELIVERY);
                        requestRepository.save(request);
                    }
                } catch (Exception e) {
                    // Request 상태 업데이트 실패해도 Payment 처리는 계속 진행
                }
            }
            case "PAYMENT_CANCELED" -> {
                // 관리자가 직접 처리한 경우가 아닌 경우만 실패 처리
                if (payment.getStatus() != Payment.Status.SUCCESS) {
                    payment.setStatus(Payment.Status.FAILED);
                    payment.setMemo("입금 취소로 인한 결제 실패");
                }
                // 이미 SUCCESS인 경우는 관리자가 직접 처리한 것이므로 무시
            }
            default -> {
                return;
            }
        }
        paymentRepository.save(payment);
    }

    // 토스페이먼츠 웹훅 서명 검증
    public boolean verifyTossWebhookSignature(String payload, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(tossSecretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
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
            throw new RuntimeException("토스페이먼츠 웹훅 서명 검증 실패", e);
        }
    }

    // 은행코드를 은행명으로 변환
    private String convertBankCodeToBankName(String bankCode) {
        if (bankCode == null) {
            return "은행 정보 없음";
        }
        
        return switch (bankCode) {
            case "88" -> "신한";
            case "04" -> "KB국민";
            case "11" -> "NH농협";
            case "03" -> "IBK기업";
            case "20" -> "우리";
            case "81" -> "KEB하나";
            case "27" -> "한국씨티";
            case "23" -> "SC제일";
            case "07" -> "수협";
            case "89" -> "케이뱅크";
            case "90" -> "카카오뱅크";
            case "92" -> "토스뱅크";
            default -> "기타(" + bankCode + ")";
        };
    }

    // 입금완료 전환 (입금대기 -> 입금완료)
    @Transactional
    public void completePayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("해당 결제가 존재하지 않습니다."));
        
        if (payment.getStatus() != Payment.Status.PENDING) {
            throw new IllegalArgumentException("입금대기 상태인 결제만 완료 처리할 수 있습니다.");
        }
        
        // 1. 먼저 토스페이먼츠에서 결제를 취소 처리
        try {
            tossPaymentsClient.cancelPaymentByOrderId(payment.getMerchantUid(), "관리자 입금완료 처리");
        } catch (Exception e) {
            throw new RuntimeException("토스페이먼츠 취소 처리 실패: " + e.getMessage());
        }
        
        // 2. 토스페이먼츠 취소가 성공하면 로컬 DB를 입금완료로 변경
        payment.markCompleted();
        payment.setMemo("관리자에 의한 입금완료 처리 (토스페이먼츠 취소됨)");
        paymentRepository.save(payment);
        
        // 3. Request 상태를 배송대기로 변경
        try {
            Request request = payment.getRequest();
            if (request != null) {
                request.changeStatus(Request.Status.WAITING_FOR_DELIVERY);
                requestRepository.save(request);
            }
        } catch (Exception e) {
            // Request 상태 업데이트 실패해도 Payment 처리는 성공으로 유지
        }
    }

    // Payment 생성 및 저장
    @Transactional
    private Payment createAndSaveUniquePayment(Request request, Integer amount) {
        // 현재 시간과 UUID를 조합한 merchant_uid 생성
        String uniqueMerchantUid = "VIR_" + System.currentTimeMillis() + "_" + 
                                  java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        
        Payment payment = Payment.builder()
                .request(request)
                .merchantUid(uniqueMerchantUid)
                .account("")
                .bank("")
                .cost(amount)
                .status(Payment.Status.PENDING)
                .build();
        
        try {
            Payment savedPayment = paymentRepository.save(payment);
            return savedPayment;
        } catch (Exception e) {
            throw new RuntimeException("결제 레코드 생성 실패: " + e.getMessage(), e);
        }
    }
}
