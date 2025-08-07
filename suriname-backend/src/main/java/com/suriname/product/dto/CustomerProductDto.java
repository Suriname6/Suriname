package com.suriname.product.dto;

import com.suriname.customer.entity.Customer;
import com.suriname.product.entity.CustomerProduct;
import com.suriname.product.entity.Product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerProductDto {

    private Long customerProductId;
    private Long customerId;
    private Long productId;
    private String categoryName; 
    private String productName;
    private String productBrand;
    private String modelCode;
    private String serialNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CustomerProductDto fromEntity(CustomerProduct cp) {
        Product p = cp.getProduct();
        Customer c = cp.getCustomer();

        return CustomerProductDto.builder()
                .customerProductId(cp.getCustomerProductId())
                .customerId(c.getCustomerId())
                .productId(p.getProductId())
                .serialNumber(cp.getSerialNumber())
                .categoryName(p.getCategory().getName())
                .productName(p.getProductName())
                .productBrand(p.getProductBrand())
                .modelCode(p.getModelCode())
                .createdAt(cp.getCreatedAt())
                .updatedAt(cp.getUpdatedAt())
                .build();
    }
}
