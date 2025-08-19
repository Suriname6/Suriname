package com.suriname.quote.entity;

import com.suriname.customer.entity.Customer;
import com.suriname.employee.entity.Employee;
import com.suriname.product.entity.CustomerProduct;
import com.suriname.product.entity.Product;
import com.suriname.request.dto.RequestSearchDto;
import com.suriname.request.entity.Request;
import com.suriname.requestlog.entity.RequestLog;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class QuoteSpecification {
    // 검색
    public static Specification<Quote> search(RequestSearchDto dto) {
        return (root, query, cb) -> {

            Predicate predicate = cb.conjunction();

            Join<Quote, Request> requestJoin = root.join("request", JoinType.INNER);
            Join<Request, CustomerProduct> customerProductJoin = requestJoin.join("customerProduct", JoinType.INNER);
            Join<CustomerProduct, Product> productJoin = customerProductJoin.join("product", JoinType.INNER);

            Join<Request, Customer> customerJoin = requestJoin.join("customer", JoinType.INNER);
            Join<Request, Employee> employeeJoin = requestJoin.join("employee", JoinType.INNER);

            if (dto.getRequestNo() != null && !dto.getRequestNo().isBlank()) {
                predicate = cb.and(predicate, cb.like(requestJoin.get("requestNo"), "%" + dto.getRequestNo() + "%"));
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
                // 1. 각 request_id의 최신 changed_at 서브쿼리
                Subquery<LocalDateTime> maxChangedAtSubquery = query.subquery(LocalDateTime.class);
                Root<RequestLog> rl1 = maxChangedAtSubquery.from(RequestLog.class);
                maxChangedAtSubquery.select(cb.greatest(rl1.<LocalDateTime>get("changedAt")))
                        .where(cb.equal(rl1.get("request").get("requestId"), requestJoin.get("requestId")));

                // 2. 최신 로그의 new_status 가 dto.getStatus() 에 있는지 확인
                Subquery<Long> subquery = query.subquery(Long.class);
                Root<RequestLog> rl2 = subquery.from(RequestLog.class);
                subquery.select(rl2.get("request").get("requestId"))
                        .where(
                                cb.and(
                                        cb.equal(rl2.get("request").get("requestId"), requestJoin.get("requestId")),
                                        cb.equal(rl2.get("changedAt"), maxChangedAtSubquery),
                                        rl2.get("newStatus").in(dto.getStatus())
                                )
                        );

                predicate = cb.and(predicate, cb.exists(subquery));
            }

            if (dto.getEmployName() != null && !dto.getEmployName().isBlank()) {
                predicate = cb.and(predicate, cb.like(cb.function("BINARY", String.class, employeeJoin.get("name")),
                        "%" + dto.getEmployName() + "%"));
            }

            return predicate;
        };
    }
}
