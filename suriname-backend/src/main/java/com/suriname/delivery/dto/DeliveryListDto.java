package com.suriname.delivery.dto;

import com.suriname.delivery.entity.Delivery;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class DeliveryListDto {

    private Long deliveryId;
    private Long requestId;
    private String requestNo;
    private String customerName;
    private String phone;
    private String address;
    private String trackingNo;
    private String carrierName;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime completedDate;

    public DeliveryListDto(Long deliveryId, Long requestId, String requestNo, String customerName,
                          String phone, String address, String trackingNo, String carrierName,
                          Delivery.Status status, LocalDateTime createdAt, LocalDateTime completedDate) {
        this.deliveryId = deliveryId;
        this.requestId = requestId;
        this.requestNo = requestNo;
        this.customerName = customerName;
        this.phone = phone;
        this.address = address;
        this.trackingNo = trackingNo;
        this.carrierName = carrierName;
        this.status = getStatusKorean(status);
        this.createdAt = createdAt;
        this.completedDate = completedDate;
    }

    private String getStatusKorean(Delivery.Status status) {
        return switch (status) {
            case PENDING -> "배송준비";
            case SHIPPED -> "배송중";
            case DELIVERED -> "배송완료";
        };
    }
}