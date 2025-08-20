package com.suriname.request.entity;

import com.suriname.customer.entity.Customer;
import com.suriname.employee.entity.Employee;
import com.suriname.product.entity.CustomerProduct;
import com.suriname.product.entity.Product;
import com.suriname.request.dto.RequestSearchDto;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.function.Function;

import java.time.LocalDate;

public class RequestSpecification {

    public static Specification<Request> search(RequestSearchDto dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            Join<Request, Customer> customer = root.join("customer", JoinType.INNER);
            Join<Request, CustomerProduct> cp = root.join("customerProduct", JoinType.INNER);
            Join<CustomerProduct, Product> product = cp.join("product", JoinType.INNER);
            Join<Request, Employee> employee = root.join("employee", JoinType.LEFT);

            String reqNo       = dto.getRequestNo();
            String custName    = dto.getCustomerName();
            String prodName    = dto.getProductName();
            String modelCode   = dto.getModelCode();
            String employName  = dto.getEmployName();

            if (hasText(reqNo)) {
                predicates.add(cb.like(root.get("requestNo"), "%" + reqNo.trim() + "%"));
            }
            if (hasText(custName)) {
                predicates.add(cb.like(customer.get("name"), "%" + custName.trim() + "%"));
            }
            if (hasText(prodName)) {
                predicates.add(cb.like(product.get("productName"), "%" + prodName.trim() + "%"));
            }
            if (hasText(modelCode)) {
                predicates.add(cb.like(product.get("modelCode"), "%" + modelCode.trim() + "%"));
            }
            if (hasText(employName)) {
                predicates.add(cb.like(employee.get("name"), "%" + employName.trim() + "%"));
            }

            LocalDate start = dto.getStartCreateAt();
            LocalDate end   = dto.getEndCreateAt();

            if (start != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start.atStartOfDay()));
            }
            if (end != null) {
                predicates.add(cb.lessThan(root.get("createdAt"), end.plusDays(1).atStartOfDay()));
            }

            List<String> dtoStatus = dto.getStatus();
            if (dtoStatus != null && !dtoStatus.isEmpty()) {
                List<Request.Status> statusEnums = dtoStatus.stream()
                        .filter(Objects::nonNull)
                        .map(String::trim)
                        .map(safeEnum(Request.Status.class))
                        .filter(Objects::nonNull)
                        .toList();

                if (!statusEnums.isEmpty()) {
                    predicates.add(root.get("status").in(statusEnums));
                } else {
                    return cb.disjunction();
                }
            }

            List<String> dtoAssign = dto.getAssignmentStatus();
            if (dtoAssign != null && !dtoAssign.isEmpty()) {
                List<RequestAssignmentLog.AssignmentStatus> assignEnums = dtoAssign.stream()
                        .filter(Objects::nonNull)
                        .map(String::trim)
                        .map(safeEnum(RequestAssignmentLog.AssignmentStatus.class))
                        .filter(Objects::nonNull)
                        .toList();

                if (!assignEnums.isEmpty()) {
                    Subquery<RequestAssignmentLog.AssignmentStatus> sub =
                            query.subquery(RequestAssignmentLog.AssignmentStatus.class);
                    Root<RequestAssignmentLog> log = sub.from(RequestAssignmentLog.class);

                    Subquery<Long> maxIdSub = query.subquery(Long.class);
                    Root<RequestAssignmentLog> log2 = maxIdSub.from(RequestAssignmentLog.class);

                    Path<Long> id2 = log2.get("id");
                    maxIdSub.select(cb.greatest(id2))
                            .where(cb.equal(log2.get("request"), root));

                    Path<Long> id = log.get("id");
                    Path<RequestAssignmentLog.AssignmentStatus> statusExp = log.get("status");

                    sub.select(statusExp)
                            .where(
                                    cb.equal(log.get("request"), root),
                                    cb.equal(id, maxIdSub)
                            );

                    predicates.add(sub.in(assignEnums));
                } else {
                    return cb.disjunction();
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static boolean hasText(String s) {
        return s != null && !s.trim().isEmpty();
    }

    private static <E extends Enum<E>> Function<String, E> safeEnum(Class<E> type) {
        return s -> {
            try { return Enum.valueOf(type, s); }
            catch (Exception e) { return null; }
        };
    }
}