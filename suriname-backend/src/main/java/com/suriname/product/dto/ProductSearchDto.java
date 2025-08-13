package com.suriname.product.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductSearchDto {
    private String productName;
    private List<String> categories;
    private List<String> manufacturers;
    private String modelCode;
    private String serialNumber;
    private Boolean isVisible;
}

