package com.suriname.customer.entity;

import com.suriname.customer.dto.CustomerSearchDto;
import com.suriname.product.entity.CustomerProduct;
import com.suriname.product.entity.Product;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class CustomerSpecification {

    public static Specification<Customer> searchWith(CustomerSearchDto dto) {
        return (root, query, cb) -> {
            query.distinct(true); 

            Predicate predicate = cb.conjunction();
            predicate = cb.and(predicate, cb.isFalse(root.get("isDeleted")));

            // 고객
            if (dto.getCustomerName() != null && !dto.getCustomerName().isBlank()) {
                predicate = cb.and(predicate, cb.like(root.get("name"), "%" + dto.getCustomerName() + "%"));
            }

            // 전화번호
            if (dto.getPhone() != null && !dto.getPhone().isBlank()) {
                predicate = cb.and(predicate, cb.like(root.get("phone"), "%" + dto.getPhone() + "%"));
            }

            // 이메일
            if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
                predicate = cb.and(predicate, cb.like(root.get("email"), "%" + dto.getEmail() + "%"));
            }
       
            if (dto.getAddress() != null && !dto.getAddress().isBlank()) {
                predicate = cb.and(predicate, cb.like(root.get("address"), "%" + dto.getAddress() + "%"));
            }

            Join<Customer, CustomerProduct> cpJoin = root.join("customerProducts", jakarta.persistence.criteria.JoinType.LEFT);
            Join<CustomerProduct, Product> productJoin = cpJoin.join("product", jakarta.persistence.criteria.JoinType.LEFT);

            // 제품관리
            if (
                    (dto.getProductName() != null && !dto.getProductName().isBlank()) ||
                    (dto.getModelCode() != null && !dto.getModelCode().isBlank()) ||
                    (dto.getManufacturers() != null && !dto.getManufacturers().isEmpty())
                ) {
                    cpJoin = root.join("customerProducts", jakarta.persistence.criteria.JoinType.LEFT);
                    productJoin = cpJoin.join("product", jakarta.persistence.criteria.JoinType.LEFT);

                    if (dto.getProductName() != null && !dto.getProductName().isBlank()) {
                        predicate = cb.and(predicate,
                            cb.like(productJoin.get("productName"), "%" + dto.getProductName() + "%"));
                    }

                    if (dto.getModelCode() != null && !dto.getModelCode().isBlank()) {
                        predicate = cb.and(predicate,
                            cb.like(productJoin.get("modelCode"), "%" + dto.getModelCode() + "%"));
                    }

                    if (dto.getManufacturers() != null && !dto.getManufacturers().isEmpty()) {
                        Predicate manufacturerPredicate = cb.disjunction();
                        for (String brand : dto.getManufacturers()) {
                            if (brand != null && !brand.isBlank()) {
                                manufacturerPredicate = cb.or(manufacturerPredicate,
                                        cb.like(productJoin.get("productBrand"), "%" + brand + "%"));
                            }
                        }
                        predicate = cb.and(predicate, manufacturerPredicate);
                    }
                    if (dto.getCategoryName() != null && !dto.getCategoryName().isBlank()) {
                        Join<Product, ?> categoryJoin = productJoin.join("category", jakarta.persistence.criteria.JoinType.LEFT);
                        predicate = cb.and(predicate,
                            cb.equal(categoryJoin.get("name"), dto.getCategoryName()));
                    }
                }


            return predicate;
        };
    }
}
