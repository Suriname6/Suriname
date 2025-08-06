package com.suriname.employee.repository;

import com.suriname.employee.dto.EmployeeSearchRequestDto;
import com.suriname.employee.entity.Employee;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class EmployeeSpecification {

    public static Specification<Employee> searchWith(EmployeeSearchRequestDto dto) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.notEqual(root.get("role"), Employee.Role.PENDING));

            if (StringUtils.hasText(dto.getName())) {
                predicates.add(cb.like(root.get("name"), "%" + dto.getName() + "%"));
            }
            if (StringUtils.hasText(dto.getLoginId())) {
                predicates.add(cb.like(root.get("loginId"), "%" + dto.getLoginId() + "%"));
            }
            if (StringUtils.hasText(dto.getEmail())) {
                predicates.add(cb.like(root.get("email"), "%" + dto.getEmail() + "%"));
            }
            if (StringUtils.hasText(dto.getPhone())) {
                predicates.add(cb.like(root.get("phone"), "%" + dto.getPhone() + "%"));
            }
            if (StringUtils.hasText(dto.getAddress())) {
                predicates.add(cb.like(root.get("address"), "%" + dto.getAddress() + "%"));
            }

            // enum 파싱
            if (StringUtils.hasText(dto.getRole())) {
                try {
                    Employee.Role role = Employee.Role.valueOf(dto.getRole().toUpperCase());
                    predicates.add(cb.equal(root.get("role"), role));
                } catch (IllegalArgumentException ignored) {}
            }

            if (StringUtils.hasText(dto.getStatus())) {
                try {
                    Employee.Status status = Employee.Status.valueOf(dto.getStatus().toUpperCase());
                    predicates.add(cb.equal(root.get("status"), status));
                } catch (IllegalArgumentException ignored) {}
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
