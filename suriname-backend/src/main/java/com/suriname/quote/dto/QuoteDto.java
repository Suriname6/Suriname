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
        }
        
        if (quote.getEmployee() != null) {
            this.employeeName = quote.getEmployee().getName();
        } else {
            this.employeeName = "담당자 미지정";
        }
        
        // Payment 정보 가져오기 (입금여부) - 여러 Payment 중 우선순위에 따라 결정
        if (quote.getRequest() != null && quote.getRequest().getPayments() != null && !quote.getRequest().getPayments().isEmpty()) {
            // SUCCESS 상태가 있으면 우선, 없으면 가장 최근 Payment 사용
            Payment relevantPayment = quote.getRequest().getPayments().stream()
                    .filter(p -> p.getStatus() == Payment.Status.SUCCESS)
                    .findFirst()
                    .orElse(
                        quote.getRequest().getPayments().stream()
                                .reduce((first, second) -> second) // 가장 최근 것
                                .orElse(null)
                    );
                    
            if (relevantPayment != null) {
                switch (relevantPayment.getStatus()) {
                    case SUCCESS -> this.paymentStatus = "입금완료";
                    case PENDING -> this.paymentStatus = "입금대기";
                    case FAILED -> this.paymentStatus = "입금실패";
                    default -> this.paymentStatus = "상태없음";
                }
            } else {
                this.paymentStatus = "결제정보없음";
            }
        } else {
            this.paymentStatus = "결제정보없음";
        }
    }
}