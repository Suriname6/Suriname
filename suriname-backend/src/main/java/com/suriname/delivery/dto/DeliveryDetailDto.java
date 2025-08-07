package com.suriname.delivery.dto;

import com.suriname.delivery.entity.Delivery;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class DeliveryDetailDto {

    private Long deliveryId;
    private Long requestId;
    private String requestNo;
    private String customerName;
    private String customerPhone;
    private String name;
    private String phone;
    private String zipcode;
    private String address;
    private String trackingNo;
    private String carrierName;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedDate;

    // A/S 접수 관련 정보
    private String productName;
    private String requestContent;

    public void setStatus(Delivery.Status status) {
        this.status = switch (status) {
            case PENDING -> "배송준비";
            case SHIPPED -> "배송중";
            case DELIVERED -> "배송완료";
        };
    }
}