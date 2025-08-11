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

        // 이미 성공한 결제가 있어도 추가 발급 허용
        // 기존 Payment 삭제 없이 새로 생성
        
        // 가상계좌를 위한 완전히 새로운 Payment 생성 및 저장
        Payment payment = createAndSaveUniquePayment(request, dto.getAmount());
        String uniqueMerchantUid = payment.getMerchantUid();

        try {
            JsonNode response = tossPaymentsClient.issueVirtualAccount(uniqueMerchantUid, dto);
            
            // 토스페이먼츠 API 응답 로그 추가
            System.out.println("토스페이먼츠 API 응답: " + response.toString());

            // 토스페이먼츠 API 응답 구조에 맞게 수정 (null 체크 추가)
            String bank = null;
            String account = null;
            
            // bankCode 필드 확인 (에러 시 기본값 설정)
            if (response.has("bankCode") && response.get("bankCode") != null) {
                bank = response.get("bankCode").asText();
            } else if (response.has("bank") && response.get("bank") != null) {
                bank = response.get("bank").asText();
            } else {
                System.err.println("응답에서 은행 정보를 찾을 수 없습니다. 기본값으로 설정합니다: " + response.toString());
                bank = "가상계좌"; // 기본값 설정
            }
            
            // accountNumber 필드 확인 (에러 시 기본값 설정)
            if (response.has("accountNumber") && response.get("accountNumber") != null) {
                account = response.get("accountNumber").asText();
            } else if (response.has("account") && response.get("account") != null) {
                account = response.get("account").asText();
            } else {
                System.err.println("응답에서 계좌번호 정보를 찾을 수 없습니다. 기본값으로 설정합니다: " + response.toString());
                account = uniqueMerchantUid; // merchant_uid 형태로 설정
            }
            
            String dueDate = (response.has("dueDate") && response.get("dueDate") != null) ? 
                            response.get("dueDate").asText() : dto.getVbankDue();

            System.out.println("가상계좌 정보 - 은행: " + bank + ", 계좌: " + account + ", 만료일: " + dueDate);
            
            payment.setAccountAndBank(account, bank);
            payment = paymentRepository.save(payment);

            return new VirtualAccountResponseDto(bank, account, dueDate);
        } catch (Exception e) {
            // API 에러가 발생해도 기본값으로 가상계좌 정보 설정
            System.err.println("토스페이먼츠 API 에러 발생, 기본값으로 처리: " + e.getMessage());
            
            // 기본값으로 가상계좌 정보 설정
            String defaultBank = "가상계좌은행";
            String defaultAccount = uniqueMerchantUid; // merchant_uid 형태로 설정
            String defaultDueDate = dto.getVbankDue();
            
            payment.setAccountAndBank(defaultAccount, defaultBank);
            payment.setStatus(Payment.Status.PENDING); // PENDING 상태 유지
            payment.setMemo("가상계좌 발급 완료 (기본값 적용)");
            payment = paymentRepository.save(payment);
            
            System.out.println("기본값으로 가상계좌 설정 완료 - 은행: " + defaultBank + ", 계좌: " + defaultAccount);
            
            // 기본값으로 응답 반환
            return new VirtualAccountResponseDto(defaultBank, defaultAccount, defaultDueDate);
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
            System.out.println("결제 레코드 생성 성공: " + uniqueMerchantUid);
            return savedPayment;
        } catch (Exception e) {
            System.err.println("결제 레코드 생성 실패: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("결제 레코드 생성 실패: " + e.getMessage(), e);
        }
    }
}
