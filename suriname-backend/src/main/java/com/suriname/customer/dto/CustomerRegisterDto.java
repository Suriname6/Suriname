package com.suriname.customer.dto;

import java.time.LocalDate;

import com.suriname.product.dto.CustomerProductDto;

import lombok.Getter;
import lombok.Setter;


@Getter @Setter
public class CustomerRegisterDto {
    private String name;
    private String phone;
    private String email;
    private LocalDate birth;
    private String address;

    private CustomerProductDto product;

}

