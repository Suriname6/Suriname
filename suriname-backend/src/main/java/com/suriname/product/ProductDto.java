package com.suriname.product;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ProductDto {
    private Long productId;
    private String productName;
    private String categoryName;
    private String productBrand;
    private String modelCode;
    private String serialNumber;
}