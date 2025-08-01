package com.suriname.product;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.suriname.category.Category;

@Entity
@Table(name = "product")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
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
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isVisible = true;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Builder
    public Product(Category category, String productName, String productBrand,
                    String modelCode, String serialNumber, Boolean isVisible) {
        this.category = category;
        this.productName = productName;
        this.productBrand = productBrand;
        this.modelCode = modelCode;
        this.serialNumber = serialNumber;
        this.isVisible = true;
    }
}