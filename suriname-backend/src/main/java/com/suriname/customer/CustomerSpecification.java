package com.suriname.customer;

import com.suriname.product.CustomerProduct;
import com.suriname.product.Product;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class CustomerSpecification {

    public static Specification<Customer> searchWith(CustomerSearchDto dto) {
        return (root, query, cb) -> {
            query.distinct(true); 

            Predicate predicate = cb.conjunction();

            // 고객 이름
            if (dto.getCustomerName() != null && !dto.getCustomerName().isBlank()) {
                predicate = cb.and(predicate, cb.like(root.get("name"), "%" + dto.getCustomerName() + "%"));
            }

            // 주소
            if (dto.getAddress() != null && !dto.getAddress().isBlank()) {
                predicate = cb.and(predicate, cb.like(root.get("address"), "%" + dto.getAddress() + "%"));
            }

            // Join: Customer → CustomerProduct → Product
            Join<Customer, CustomerProduct> cpJoin = root.join("customerProducts", jakarta.persistence.criteria.JoinType.LEFT);
            Join<CustomerProduct, Product> productJoin = cpJoin.join("product", jakarta.persistence.criteria.JoinType.LEFT);

            // 제품명
            if (dto.getProductName() != null && !dto.getProductName().isBlank()) {
                predicate = cb.and(predicate, cb.like(productJoin.get("productName"), "%" + dto.getProductName() + "%"));
            }

            // 모델코드
            if (dto.getModelCode() != null && !dto.getModelCode().isBlank()) {
                predicate = cb.and(predicate, cb.like(productJoin.get("modelCode"), "%" + dto.getModelCode() + "%"));
            }

            // 제조사 (== productBrand)
            if (dto.getManufacturer() != null && !dto.getManufacturer().isBlank()) {
                predicate = cb.and(predicate, cb.like(productJoin.get("productBrand"), "%" + dto.getManufacturer() + "%"));
            }

            return predicate;
        };
    }
}
