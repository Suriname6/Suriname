package com.suriname.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DeliveryRegisterDto {

    @NotNull(message = "A/S 접수 ID는 필수입니다")
    private Long requestId;

    @NotBlank(message = "수취인 이름은 필수입니다")
    private String name;

    @NotBlank(message = "전화번호는 필수입니다")
    private String phone;

    @NotBlank(message = "우편번호는 필수입니다")
    private String zipcode;

    @NotBlank(message = "주소는 필수입니다")
    private String address;

    private String trackingNo;  // 송장번호 (선택사항)
    private String carrierName; // 택배사명 (선택사항)
}