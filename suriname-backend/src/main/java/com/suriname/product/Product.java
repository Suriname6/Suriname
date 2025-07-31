package com.suriname.product;

import java.time.LocalDateTime;

import com.suriname.category.Category;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product")
@Getter @Setter
public class Product {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    private String productName;
    private String productBrand;
    private String modelCode;
    private String serialNumber;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Boolean isVisible;
}

