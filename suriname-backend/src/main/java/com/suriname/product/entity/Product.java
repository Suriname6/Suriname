package com.suriname.product.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.suriname.category.entity.Category;
import com.suriname.product.dto.ProductDto;

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

	@Column(nullable = false)
	private LocalDateTime createdAt;

	@Column(nullable = false)
	private LocalDateTime updatedAt;

	@Column(nullable = false)
	private Boolean isVisible;

	@Column(columnDefinition = "TEXT")
	private String memo;

	@Column(nullable = false)
	private Boolean isDeleted = false;

	@PrePersist
	public void onCreate() {
		this.createdAt = LocalDateTime.now();
		this.updatedAt = LocalDateTime.now();
		if (this.isVisible == null)
			this.isVisible = true;
		if (this.isDeleted == null)
			this.isDeleted = false;
	}

	@PreUpdate
	public void onUpdate() {
		this.updatedAt = LocalDateTime.now();
	}

	@Builder
	public Product(Category category, String productName, String productBrand, String modelCode, String serialNumber,
			String memo, Boolean isDeleted, Boolean isVisible) {
		this.category = category;
		this.productName = productName;
		this.productBrand = productBrand;
		this.modelCode = modelCode;
		this.memo = memo;
		this.isVisible = true;
		this.isDeleted = false;
	}

	public void markAsDeleted() {
		this.isDeleted = true;
		this.isVisible = false;
	}

	public void updateProduct(String productName, String productBrand, String modelCode, String serialNumber,
			Category category) {
		this.productName = productName;
		this.productBrand = productBrand;
		this.modelCode = modelCode;
		this.category = category;
	}

	public void updateFromDto(ProductDto dto, Category category) {
		this.productName = dto.getProductName();
		this.productBrand = dto.getProductBrand();
		this.modelCode = dto.getModelCode();
		this.memo = dto.getMemo();
		this.category = category;
	}

}