package com.suriname.request.entity;

import com.suriname.customer.entity.Customer;
import com.suriname.employee.entity.Employee;
import com.suriname.product.entity.CustomerProduct;
import com.suriname.product.entity.Product;
import com.suriname.request.dto.RequestSearchDto;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class RequestSpecification {

    // 검색
    public static Specification<Request> search(RequestSearchDto dto) {
        return (root, query, cb) -> {

            Predicate predicate = cb.conjunction();

            Join<Request, CustomerProduct> customerProductJoin = root.join("customerProduct", JoinType.INNER);
            Join<CustomerProduct, Product> productJoin = customerProductJoin.join("product", JoinType.INNER);

            Join<Request, Customer> customerJoin = root.join("customer", JoinType.INNER);
            Join<Request, Employee> employeeJoin = root.join("employee", JoinType.INNER);
            Join<Request, RequestAssignmentLog> assignmentLogJoin = root.join("assignmentLogs", JoinType.LEFT);
            
            if (dto.getRequestNo() != null && !dto.getRequestNo().isBlank()) {
                predicate = cb.and(predicate, cb.like(root.get("requestNo"), "%" + dto.getRequestNo() + "%"));
            }

            if (dto.getCustomerName() != null && !dto.getCustomerName().isBlank()) {
                predicate = cb.and(predicate, cb.like(customerJoin.get("name"), "%" + dto.getCustomerName() + "%"));
            }

            if (dto.getProductName() != null && !dto.getProductName().isBlank()) {
                predicate = cb.and(predicate, cb.like(productJoin.get("productName"), "%" + dto.getProductName() + "%"));
            }

            if (dto.getModelCode() != null && !dto.getModelCode().isBlank()) {
                predicate = cb.and(predicate, cb.like(productJoin.get("modelCode"), "%" + dto.getModelCode() + "%"));
            }

            if (dto.getStartCreateAt() != null && dto.getEndCreateAt() != null) {
                predicate = cb.and(predicate, cb.between(root.get("createdAt"), dto.getStartCreateAt(), dto.getEndCreateAt()));
            }

            if (dto.getStatus() != null && !dto.getStatus().isEmpty()) {
                Predicate statusPredicate = cb.disjunction();
                for (String status : dto.getStatus()) {
                    if (status != null && !status.isBlank()) {
                        statusPredicate = cb.or(statusPredicate, cb.equal(assignmentLogJoin.get("status"), status));
                    }
                }
                predicate = cb.and(predicate, statusPredicate);
            }

            if (dto.getEmployName() != null && !dto.getEmployName().isBlank()) {
                predicate = cb.and(predicate, cb.like(cb.function("BINARY", String.class, employeeJoin.get("name")),
                        "%" + dto.getEmployName() + "%"));
            }

            return predicate;
        };
    }
}
