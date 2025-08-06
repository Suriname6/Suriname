package com.suriname.delivery.dto;

import com.suriname.delivery.entity.Delivery;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DeliveryStatusUpdateDto {

    @NotNull(message = "배송 상태는 필수입니다")
    private Delivery.Status status;

    private String memo; // 상태 변경 메모
}