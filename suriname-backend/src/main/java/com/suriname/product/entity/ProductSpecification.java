package com.suriname.product.entity;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import com.suriname.product.dto.ProductSearchDto;

public class ProductSpecification {

    public static Specification<Product> search(ProductSearchDto dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (dto.getProductName() != null && !dto.getProductName().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("productName")), "%" + dto.getProductName().toLowerCase() + "%"));
            }

            if (dto.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("categoryId"), dto.getCategoryId()));
            }

            if (dto.getProductBrand() != null && !dto.getProductBrand().isBlank()) {
                predicates.add(cb.equal(root.get("productBrand"), dto.getProductBrand()));
            }

            if (dto.getModelCode() != null && !dto.getModelCode().isBlank()) {
                predicates.add(cb.equal(root.get("modelCode"), dto.getModelCode()));
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
}
