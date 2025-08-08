package com.suriname.product.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductSearchDto {
    private String productName;
    private String categoryName;
    private String productBrand;
    private String modelCode;
    private String serialNumber;
    private Boolean isVisible;
}

