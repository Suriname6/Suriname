package com.suriname.completion.dto;

import com.suriname.completion.entity.Completion;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class CompletionDetailDto {

    private Long completionId;
    private Long requestId;
    private String requestNo;
    private String customerName;
    private String customerPhone;
    private Long deliveryId;
    private String deliveryAddress;
    private String completionType;
    private String completionNotes;
    private String completedBy;
    private Long completedById;
    private Boolean customerReceived;
    private LocalDateTime receivedDate;
    private Boolean satisfactionRequested;
    private LocalDateTime satisfactionSentDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CompletionDetailDto(Long completionId, Long requestId, String requestNo,
                             String customerName, String customerPhone, Long deliveryId,
                             String deliveryAddress, Completion.CompletionType completionType,
                             String completionNotes, String completedBy, Long completedById,
                             Boolean customerReceived, LocalDateTime receivedDate,
                             Boolean satisfactionRequested, LocalDateTime satisfactionSentDate,
                             LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.completionId = completionId;
        this.requestId = requestId;
        this.requestNo = requestNo;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.deliveryId = deliveryId;
        this.deliveryAddress = deliveryAddress;
        this.completionType = getCompletionTypeDisplayName(completionType);
        this.completionNotes = completionNotes;
        this.completedBy = completedBy;
        this.completedById = completedById;
        this.customerReceived = customerReceived;
        this.receivedDate = receivedDate;
        this.satisfactionRequested = satisfactionRequested;
        this.satisfactionSentDate = satisfactionSentDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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