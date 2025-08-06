package com.suriname.completion.dto;

import com.suriname.completion.entity.Completion;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class CompletionListDto {

    private Long completionId;
    private Long requestId;
    private String requestNo;
    private String customerName;
    private Long deliveryId;
    private String completionType;
    private String completedBy;
    private Boolean customerReceived;
    private Boolean satisfactionRequested;
    private LocalDateTime createdAt;
    private LocalDateTime receivedDate;

    public CompletionListDto(Long completionId, Long requestId, String requestNo, 
                           String customerName, Long deliveryId, 
                           Completion.CompletionType completionType, String completedBy,
                           Boolean customerReceived, Boolean satisfactionRequested,
                           LocalDateTime createdAt, LocalDateTime receivedDate) {
        this.completionId = completionId;
        this.requestId = requestId;
        this.requestNo = requestNo;
        this.customerName = customerName;
        this.deliveryId = deliveryId;
        this.completionType = getCompletionTypeDisplayName(completionType);
        this.completedBy = completedBy;
        this.customerReceived = customerReceived;
        this.satisfactionRequested = satisfactionRequested;
        this.createdAt = createdAt;
        this.receivedDate = receivedDate;
    }

    private String getCompletionTypeDisplayName(Completion.CompletionType type) {
        switch (type) {
            case REPAIR_COMPLETED:
                return "수리 완료";
            case EXCHANGE_COMPLETED:
                return "교체 완료";
            case REFUND_COMPLETED:
                return "환불 완료";
            case RETURN_COMPLETED:
                return "반품 완료";
            case INSPECTION_COMPLETED:
                return "점검 완료";
            default:
                return type.name();
        }
    }
}