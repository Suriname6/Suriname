package com.suriname.product.dto;

import com.suriname.category.entity.Category;
import com.suriname.product.entity.Product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductDto {
    private Long productId;
    private String productName;
    private String categoryName;
    private String productBrand;
    private String modelCode;
    private String memo;
    private Boolean isDeleted;
    private Boolean isVisible;
    
    public static ProductDto fromEntity(Product product) {
        return ProductDto.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .categoryName(product.getCategory().getName())  // Category 엔티티에 getName() 메서드가 있어야 함
                .productBrand(product.getProductBrand())
                .modelCode(product.getModelCode())
                .memo(product.getMemo())
                .isDeleted(product.getIsDeleted())
                .isVisible(product.getIsVisible())
                .build();
    }

    public Product toEntity(Category category) {
        return Product.builder()
                .productName(productName)
                .productBrand(productBrand)
                .modelCode(modelCode)
                .category(category)
                .memo(memo)
                .isVisible(true)
                .isDeleted(false)
                .build();
    }
}