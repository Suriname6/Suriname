package com.suriname.customer.dto;


import com.suriname.product.dto.CustomerProductDto;

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
    private CustomerProductDto product;
}