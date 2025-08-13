package com.suriname.product.entity;

import java.util.ArrayList;
import java.util.List;

import com.suriname.category.entity.Category;
import com.suriname.customer.entity.Customer;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import com.suriname.product.dto.ProductSearchDto;

public class ProductSpecification {

	// 검색
	public static Specification<Product> search(ProductSearchDto dto) {
		return (root, query, cb) -> {
			
			List<Predicate> predicates = new ArrayList<>();
			
			predicates.add(cb.isFalse(root.get("isDeleted")));

			Join<Customer, Category> ctJoin = root.join("category", jakarta.persistence.criteria.JoinType.LEFT);
			
			if (dto.getProductName() != null && !dto.getProductName().isBlank()) {
				predicates.add(
						cb.like(cb.lower(root.get("productName")), "%" + dto.getProductName().toLowerCase() + "%"));
			}

			if (dto.getCategories() != null && !dto.getCategories().isEmpty()) {
				Predicate manufacturerPredicate = cb.disjunction(); // 각 제조사 조건을 OR로 묶을 Predicate

				for (String brand : dto.getCategories()) {
					if (brand != null && !brand.isBlank()) {
						manufacturerPredicate = cb.or(manufacturerPredicate,
								cb.like(ctJoin.get("name"), "%" + brand + "%"));
					}
				}
				predicates.add(manufacturerPredicate);
			}

			if (dto.getManufacturers() != null && !dto.getManufacturers().isEmpty()) {
				Predicate manufacturerPredicate = cb.disjunction(); // 각 제조사 조건을 OR로 묶을 Predicate

				for (String brand : dto.getManufacturers()) {
					if (brand != null && !brand.isBlank()) {
						manufacturerPredicate = cb.or(manufacturerPredicate,
							cb.like(root.get("productBrand"), "%" + brand + "%"));
					}
				}
				predicates.add(manufacturerPredicate);
			}

			if (dto.getModelCode() != null && !dto.getModelCode().isBlank()) {
				predicates.add(
						cb.like(cb.lower(root.get("modelCode")), "%" + dto.getModelCode().toLowerCase() + "%"));
			}

			if (dto.getSerialNumber() != null && !dto.getSerialNumber().isBlank()) {
				predicates.add(cb.equal(root.get("serialNumber"), dto.getSerialNumber()));
			}

			if (dto.getIsVisible() != null) {
				predicates.add(cb.equal(root.get("isVisible"), dto.getIsVisible()));
			}

			return cb.and(predicates.toArray(new Predicate[0]));
		};
	}
	
	// 자동완성
	 public static Specification<Product> containsKeyword(String keyword) {
	        return (root, query, cb) -> {
	            String likeKeyword = "%" + keyword.toLowerCase() + "%";
	            return cb.or(
	                cb.like(cb.lower(root.get("productName")), likeKeyword),
	                cb.like(cb.lower(root.get("modelCode")), likeKeyword),
	                cb.like(cb.lower(root.get("productBrand")), likeKeyword)
	            );
	        };
	    }
}
