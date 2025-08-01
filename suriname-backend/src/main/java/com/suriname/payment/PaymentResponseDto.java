package com.suriname.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PaymentResponseDto {
    private String account;
    private String bank;
    private Integer amount;
    private String merchantUid;
}