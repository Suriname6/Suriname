package com.suriname.customer.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerAutoCompleteDto {
    private Long customerId;
    private String customerName;
    private String phone;
    private String email;
    private LocalDate birth;
    private String address;
    private String productName;
    private String categoryName;
    private String productBrand;
    private String modelCode;
    private String serialNumber;
}

