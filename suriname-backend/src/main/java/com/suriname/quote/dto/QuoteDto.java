package com.suriname.quote.dto;

import com.suriname.payment.Payment;
import com.suriname.quote.entity.Quote;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuoteDto {
    private Long quoteId;
    private String customerName;
    private String requestNo;
    private String productName;
    private String serialNumber;
    private Long cost;
    private String field;
    private Boolean isApproved;
    private String employeeName;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private String approvalStatus;
    private Long requestId;
    private String paymentStatus;  // 입금여부
    private String statusChange;   // Request의 실제 상태
    
    public QuoteDto(Quote quote) {
        this.quoteId = quote.getQuoteId();
        this.cost = quote.getCost();
        this.field = quote.getField();
        this.isApproved = quote.getIsApproved();
        this.createdAt = quote.getCreatedAt();
        this.approvedAt = quote.getApprovedAt();
        this.approvalStatus = quote.getIsApproved() ? "승인" : "미승인";
        
        if (quote.getRequest() != null) {
            this.requestId = quote.getRequest().getRequestId();
            this.requestNo = quote.getRequest().getRequestNo();
            
            // Request의 실제 상태를 statusChange로 매핑
            if (quote.getRequest().getStatus() != null) {
                switch (quote.getRequest().getStatus()) {
                    case RECEIVED -> this.statusChange = "RECEIVED";
                    case REPAIRING -> this.statusChange = "IN_PROGRESS";
                    case WAITING_FOR_PAYMENT -> this.statusChange = "AWAITING_PAYMENT";
                    case WAITING_FOR_DELIVERY -> this.statusChange = "READY_FOR_DELIVERY";
                    case COMPLETED -> this.statusChange = "COMPLETED";
                    default -> this.statusChange = "IN_PROGRESS";
                }
            } else {
                this.statusChange = "IN_PROGRESS";
            }
            
            // Customer 정보 가져오기
            if (quote.getRequest().getCustomer() != null) {
                this.customerName = quote.getRequest().getCustomer().getName();
            } else {
                this.customerName = "고객 정보 없음";
            }
            
            // Product 정보는 CustomerProduct를 통해 가져오기
            if (quote.getRequest().getCustomerProduct() != null && 
                quote.getRequest().getCustomerProduct().getProduct() != null) {
                this.productName = quote.getRequest().getCustomerProduct().getProduct().getProductName();
                this.serialNumber = quote.getRequest().getCustomerProduct().getProduct().getModelCode();
            } else {
                this.productName = "제품 정보 없음";
                this.serialNumber = "시리얼번호 없음";
            }
        } else {
            this.requestId = null;
            this.requestNo = "접수번호 없음";
            this.customerName = "고객 정보 없음";
            this.productName = "제품 정보 없음";
            this.serialNumber = "시리얼번호 없음";
            this.statusChange = "IN_PROGRESS"; // 기본값
        }
        
        if (quote.getEmployee() != null) {
            this.employeeName = quote.getEmployee().getName();
        } else {
            this.employeeName = "담당자 미지정";
        }
        
        // Payment 정보 가져오기 (입금여부) - QuoteService 로직과 동일하게 처리
        this.paymentStatus = determinePaymentStatusForDto(quote);
    }
    
    // QuoteService의 determinePaymentStatus와 동일한 로직으로 DTO용 paymentStatus 결정
    private String determinePaymentStatusForDto(Quote quote) {
        if (quote.getRequest() == null) {
            return "결제정보없음";
        }
        
        com.suriname.request.entity.Request.Status status = quote.getRequest().getStatus();
        
        if (status == com.suriname.request.entity.Request.Status.WAITING_FOR_DELIVERY || 
            status == com.suriname.request.entity.Request.Status.COMPLETED) {
            // 배송대기/완료 상태면 입금완료로 표시
            return "입금완료";
        } else if (status == com.suriname.request.entity.Request.Status.WAITING_FOR_PAYMENT) {
            // 입금대기 상태에서 가상계좌가 발급된 경우 구분
            if (quote.getRequest().getPayments() != null && !quote.getRequest().getPayments().isEmpty()) {
                // Payment가 존재하고 PENDING 상태면 가상계좌가 발급된 것으로 간주
                boolean hasValidPayment = quote.getRequest().getPayments().stream()
                    .anyMatch(payment -> payment.getStatus() != null && 
                             payment.getStatus() == com.suriname.payment.Payment.Status.PENDING);
                if (hasValidPayment) {
                    return "입금대기"; // PENDING 상태는 여전히 "입금대기"로 표시하되, 프론트엔드에서 구분 처리
                }
            }
            return "결제정보없음"; // 가상계좌 발급 전 상태
        } else {
            // 기타 상태 (수리중 등)
            return "결제정보없음";
        }
    }
}