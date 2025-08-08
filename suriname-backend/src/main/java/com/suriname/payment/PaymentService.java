package com.suriname.payment;

import com.fasterxml.jackson.databind.JsonNode;
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
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final RequestRepository requestRepository;
    private final TossPaymentsClient tossPaymentsClient;
    
    @Value("${toss.secret-key}")
    private String tossSecretKey;

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
        Request request;
        
        // requestId가 있으면 ID로 조회, 없으면 requestNo로 조회
        if (dto.getRequestId() != null) {
            request = requestRepository.findById(dto.getRequestId())
                    .orElseThrow(() -> new IllegalArgumentException("해당 수리 요청이 없습니다."));
        } else if (dto.getRequestNo() != null && !dto.getRequestNo().trim().isEmpty()) {
            request = requestRepository.findByRequestNo(dto.getRequestNo())
                    .orElseThrow(() -> new IllegalArgumentException("해당 접수번호의 수리 요청이 없습니다: " + dto.getRequestNo()));
        } else {
            throw new IllegalArgumentException("요청 ID 또는 접수번호가 필요합니다.");
        }

        // 이미 해당 요청에 대한 성공한 결제가 존재하는지 확인
        if (paymentRepository.existsByRequestAndStatus(request, Payment.Status.SUCCESS)) {
            throw new IllegalArgumentException("해당 수리 요청에 대한 결제가 이미 완료되었습니다.");
        }

        // 모든 이전 결제 기록 완전 삭제
        cleanupAllPreviousPaymentsForRequest(request);
        
        // 가상계좌를 위한 완전히 새로운 Payment 생성 및 저장
        Payment payment = createAndSaveUniquePayment(request, dto.getAmount());
        String uniqueMerchantUid = payment.getMerchantUid();

        try {
            JsonNode response = tossPaymentsClient.issueVirtualAccount(uniqueMerchantUid, dto);

            // 토스페이먼츠 API 2022-11-16 버전 응답 구조에 맞게 수정
            String bank = response.get("bankCode").asText(); // bank -> bankCode (2022-11-16 버전)
            String account = response.get("accountNumber").asText();
            String dueDate = response.has("dueDate") ? response.get("dueDate").asText() : 
                            dto.getVbankDue();

            payment.setAccountAndBank(account, bank);
            payment = paymentRepository.save(payment);

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
    public void handleTossWebhook(JsonNode webhookData) {
        System.out.println("토스페이먼츠 웹훅 데이터: " + webhookData.toString());
        
        // 토스페이먼츠 테스트 환경에서는 직접 데이터가 전송됨 (DEPOSIT_CALLBACK)
        if (webhookData.has("orderId") && webhookData.has("status")) {
            String orderId = webhookData.get("orderId") != null ? webhookData.get("orderId").asText() : null;
            String status = webhookData.get("status") != null ? webhookData.get("status").asText() : null;
            
            System.out.println("DEPOSIT_CALLBACK - 주문 ID: " + orderId);
            System.out.println("DEPOSIT_CALLBACK - 상태: " + status);
            
            if (orderId == null || status == null) {
                System.err.println("필수 필드가 누락되었습니다: orderId=" + orderId + ", status=" + status);
                return;
            }
            
            Payment payment = paymentRepository.findByMerchantUid(orderId).orElse(null);
            if (payment == null) {
                System.err.println("해당 merchant_uid로 결제를 찾을 수 없습니다: " + orderId);
                return;
            }
            
            System.out.println("기존 결제 상태: " + payment.getStatus());
            
            if ("DONE".equals(status)) {
                payment.markCompleted();
                paymentRepository.save(payment);
                System.out.println("입금 완료 처리 성공: " + orderId + " -> " + payment.getStatus());
            } else {
                System.out.println("처리되지 않은 상태: " + status);
            }
            return;
        }

        // 일반적인 웹훅 구조 처리
        if (!webhookData.has("eventType")) {
            System.err.println("eventType 필드가 없습니다.");
            return;
        }
        
        String eventType = webhookData.get("eventType") != null ? webhookData.get("eventType").asText() : null;
        if (eventType == null) {
            System.err.println("eventType이 null입니다.");
            return;
        }
        
        if (!webhookData.has("data")) {
            System.err.println("data 필드가 없습니다.");
            return;
        }
        
        JsonNode data = webhookData.get("data");
        if (data == null) {
            System.err.println("data가 null입니다.");
            return;
        }
        
        String orderId = data.has("orderId") && data.get("orderId") != null ? 
                        data.get("orderId").asText() : null;
        
        if (orderId == null) {
            System.err.println("orderId가 null이거나 존재하지 않습니다.");
            return;
        }
        
        Payment payment = paymentRepository.findByMerchantUid(orderId).orElse(null);
        if (payment == null) {
            System.err.println("해당 merchant_uid로 결제를 찾을 수 없습니다: " + orderId);
            return;
        }

        System.out.println("이벤트 타입: " + eventType + ", 주문 ID: " + orderId);

        switch (eventType) {
            case "VIRTUAL_ACCOUNT_ISSUED" -> {
                if (data.has("virtualAccount") && data.get("virtualAccount") != null) {
                    JsonNode virtualAccount = data.get("virtualAccount");
                    String account = virtualAccount.has("accountNumber") && virtualAccount.get("accountNumber") != null ? 
                                   virtualAccount.get("accountNumber").asText() : "";
                    String bank = virtualAccount.has("bank") && virtualAccount.get("bank") != null ? 
                                virtualAccount.get("bank").asText() : "";
                    payment.setAccountAndBank(account, bank);
                    System.out.println("가상계좌 정보 업데이트: " + bank + " " + account);
                }
            }
            case "PAYMENT_CONFIRMED" -> {
                payment.markCompleted();
                System.out.println("결제 완료 처리: " + orderId);
            }
            default -> {
                System.out.println("처리되지 않은 웹훅 이벤트: " + eventType);
                return;
            }
        }

        paymentRepository.save(payment);
        System.out.println("결제 상태 업데이트 완료: " + payment.getStatus());
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

    // 실패한 결제 정리
    @Transactional
    private void cleanupFailedPaymentsForRequest(Request request) {
        List<Payment> failedPayments = paymentRepository.findByRequestAndStatus(request, Payment.Status.FAILED);
        if (!failedPayments.isEmpty()) {
            paymentRepository.deleteAll(failedPayments);
            System.out.println("요청 " + request.getRequestNo() + "에 대한 실패한 결제 " + failedPayments.size() + "건을 삭제했습니다.");
        }
    }

    // 모든 이전 결제 기록 정리 (PENDING, FAILED 상태 모두)
    @Transactional
    private void cleanupAllPreviousPaymentsForRequest(Request request) {
        // FAILED 상태 결제 삭제
        List<Payment> failedPayments = paymentRepository.findByRequestAndStatus(request, Payment.Status.FAILED);
        if (!failedPayments.isEmpty()) {
            paymentRepository.deleteAll(failedPayments);
            System.out.println("요청 " + request.getRequestNo() + "에 대한 실패한 결제 " + failedPayments.size() + "건을 삭제했습니다.");
        }
        
        // PENDING 상태 결제도 삭제 (새로운 가상계좌 발급을 위해)
        List<Payment> pendingPayments = paymentRepository.findByRequestAndStatus(request, Payment.Status.PENDING);
        if (!pendingPayments.isEmpty()) {
            paymentRepository.deleteAll(pendingPayments);
            System.out.println("요청 " + request.getRequestNo() + "에 대한 대기중인 결제 " + pendingPayments.size() + "건을 삭제했습니다.");
        }
    }

    // 완전히 유니크한 Payment 생성 및 저장
    @Transactional
    private Payment createAndSaveUniquePayment(Request request, Integer amount) {
        int maxAttempts = 10;
        
        for (int attempt = 0; attempt < maxAttempts; attempt++) {
            // 매번 완전히 새로운 merchant_uid 생성
            String uniqueMerchantUid = "VIR_" + System.nanoTime() + "_" + 
                                      java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 12) + 
                                      "_" + Thread.currentThread().getId() + "_" + attempt;
            
            // 데이터베이스에서 중복 확인
            if (paymentRepository.findByMerchantUid(uniqueMerchantUid).isPresent()) {
                System.out.println("시도 " + (attempt + 1) + ": merchant_uid 중복 발견, 재시도: " + uniqueMerchantUid);
                continue;
            }
            
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
                System.out.println("결제 레코드 생성 성공: " + uniqueMerchantUid + " (시도 횟수: " + (attempt + 1) + ")");
                return savedPayment;
            } catch (Exception e) {
                if (e.getMessage() != null && e.getMessage().contains("Duplicate entry") && 
                    e.getMessage().contains("merchant_uid")) {
                    System.out.println("시도 " + (attempt + 1) + ": 데이터베이스 중복 오류, 재시도: " + uniqueMerchantUid);
                    // 다음 시도를 위해 짧은 대기
                    try {
                        Thread.sleep(10 + attempt * 5); // 10ms, 15ms, 20ms... 점진적으로 증가
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                    continue;
                } else {
                    System.err.println("예상치 못한 오류: " + e.getMessage());
                    throw new RuntimeException("결제 레코드 생성 실패: " + e.getMessage(), e);
                }
            }
        }
        
        throw new RuntimeException("유니크한 결제 레코드 생성에 " + maxAttempts + "번 시도 후 실패했습니다.");
    }

    // 중복된 merchant_uid 정리 (모든 상태)
    @Transactional
    private void cleanupDuplicateMerchantUid(String merchantUid) {
        // 먼저 FAILED 상태만 삭제 시도
        List<Payment> failedPayments = paymentRepository.findByMerchantUidAndStatus(merchantUid, Payment.Status.FAILED);
        if (!failedPayments.isEmpty()) {
            paymentRepository.deleteAll(failedPayments);
            System.out.println("중복된 merchant_uid " + merchantUid + "에 대한 실패한 결제 " + failedPayments.size() + "건을 삭제했습니다.");
        }
        
        // 그래도 중복이 있다면 해당 merchant_uid의 결제를 삭제 (안전장치)
        Optional<Payment> existingPayment = paymentRepository.findByMerchantUid(merchantUid);
        if (existingPayment.isPresent()) {
            paymentRepository.delete(existingPayment.get());
            System.out.println("중복된 merchant_uid " + merchantUid + "에 대한 기존 결제를 강제 삭제했습니다.");
        }
    }

    // 유니크한 merchant_uid 생성
    private String generateUniqueMerchantUid(String baseMerchantUid) {
        String uniqueId = baseMerchantUid;
        int attempt = 0;
        
        // 최대 10번 시도
        while (attempt < 10) {
            if (!paymentRepository.findByMerchantUid(uniqueId).isPresent()) {
                return uniqueId;
            }
            
            // 중복이면 새로운 ID 생성
            attempt++;
            uniqueId = "VIR_" + System.currentTimeMillis() + "_" + 
                      java.util.UUID.randomUUID().toString().substring(0, 8) + "_" + attempt;
                      
            System.out.println("merchant_uid 중복 발견, 새로운 ID 생성: " + uniqueId);
        }
        
        throw new RuntimeException("유니크한 merchant_uid 생성에 실패했습니다.");
    }
}
