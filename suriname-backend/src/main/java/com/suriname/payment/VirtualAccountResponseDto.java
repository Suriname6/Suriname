package com.suriname.payment;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class VirtualAccountResponseDto {
    private String bankName;
    private String accountNumber;
    private String dueDate; // ISO String 그대로 반환
}