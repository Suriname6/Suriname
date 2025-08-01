package com.suriname.customer;

import java.time.LocalDate;

import com.suriname.product.ProductDto;

import lombok.Getter;
import lombok.Setter;


@Getter @Setter
public class CustomerRegisterDto {
    private String name;
    private String phone;
    private String email;
    private String address;
    private LocalDate birth;

    private ProductDto product;

}

