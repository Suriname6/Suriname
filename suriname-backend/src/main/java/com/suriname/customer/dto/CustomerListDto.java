package com.suriname.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CustomerListDto {
    private Long customerId;
    private String customerName;
    private String phone;
    private String email;
    private String birth;
    private String address;

    private String productName;
    private String categoryName;
    private String productBrand;
    private String modelCode;
    private String serialNumber;
}