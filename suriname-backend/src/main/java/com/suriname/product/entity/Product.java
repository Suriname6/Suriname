package com.suriname.product.entity;

import com.suriname.category.entity.Category;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "product")
@NoArgsConstructor
@Getter
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 100)
    private String productName;

    @Column(nullable = false, length = 100)
    private String productBrand;

    @Column(nullable = false, length = 50)
    private String modelCode;

    @Column(nullable = false, unique = true, length = 100)
    private String serialNumber;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private Boolean isVisible;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isVisible = true;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Builder
    private Product(Category category, String productName, String productBrand,
                    String modelCode, String serialNumber) {
        this.category = category;
        this.productName = productName;
        this.productBrand = productBrand;
        this.modelCode = modelCode;
        this.serialNumber = serialNumber;
        this.isVisible = true;
    }

    public static Product create(Category category, String productName, String productBrand,
                                 String modelCode, String serialNumber) {
        return Product.builder()
                .category(category)
                .productName(productName)
                .productBrand(productBrand)
                .modelCode(modelCode)
                .serialNumber(serialNumber)
                .build();
    }
}
