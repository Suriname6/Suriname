package com.suriname.payment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDto {
    private Long paymentId;
    private String customerName;
    private String receptionNumber;
    private String virtualAccountNumber;
    private String bankName;
    private Integer paymentAmount;
    private String depositStatus;
    private LocalDateTime confirmedAt;
    private String memo;
    private Long requestId;
    
    public PaymentDto(Payment payment) {
        this.paymentId = payment.getPaymentId();
        
        // Null 체크 추가
        if (payment.getRequest() != null) {
            this.requestId = payment.getRequest().getRequestId();
            this.receptionNumber = payment.getRequest().getRequestNo();
            
            if (payment.getRequest().getCustomer() != null) {
                this.customerName = payment.getRequest().getCustomer().getName();
            } else {
                this.customerName = "고객 정보 없음";
            }
        } else {
            this.requestId = null;
            this.receptionNumber = "접수번호 없음";
            this.customerName = "고객 정보 없음";
        }
        
        this.virtualAccountNumber = payment.getAccount();
        this.bankName = payment.getBank();
        this.paymentAmount = payment.getCost();
        this.depositStatus = getStatusInKorean(payment.getStatus());
        this.confirmedAt = payment.getConfirmedAt();
        this.memo = payment.getMemo();
    }
    
    private String getStatusInKorean(Payment.Status status) {
        switch (status) {
            case SUCCESS:
                return "입금완료";
            case PENDING:
                return "입금대기";
            case FAILED:
                return "입금실패";
            default:
                return "알수없음";
        }
    }
}