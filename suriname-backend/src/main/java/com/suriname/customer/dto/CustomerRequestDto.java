package com.suriname.customer.dto;

import lombok.*;

@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder

public class CustomerRequestDto {
    private String customerName;
    private String productName;
    private String requestNo;
}
