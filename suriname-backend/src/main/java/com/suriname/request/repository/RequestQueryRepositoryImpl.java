package com.suriname.request.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.suriname.category.entity.QCategory;
import com.suriname.customer.entity.QCustomer;
import com.suriname.employee.entity.QEmployee;
import com.suriname.product.entity.QCustomerProduct;
import com.suriname.product.entity.QProduct;
import com.suriname.request.dto.RequestListResponseDto;
import com.suriname.request.dto.RequestSearchCondition;
import com.suriname.request.entity.QRequest;
import com.suriname.request.entity.QRequestAssignmentLog;
import com.suriname.request.entity.RequestAssignmentLog;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.time.LocalTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class RequestQueryRepositoryImpl implements RequestQueryRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<RequestListResponseDto> searchRequestList(RequestSearchCondition condition, Pageable pageable, Long viewerId, String role) {
        QRequest request = QRequest.request;
        QCustomer customer = QCustomer.customer;
        QCustomerProduct cp = QCustomerProduct.customerProduct;
        QProduct product = QProduct.product;
        QCategory category = QCategory.category;
        QEmployee employee = QEmployee.employee;
        QRequestAssignmentLog log = QRequestAssignmentLog.requestAssignmentLog;

        // 조건 빌더
        BooleanBuilder builder = new BooleanBuilder();

        if (StringUtils.hasText(condition.getCustomerName())) {
            builder.and(customer.name.containsIgnoreCase(condition.getCustomerName()));
        }
        if (StringUtils.hasText(condition.getProductName())) {
            builder.and(product.productName.containsIgnoreCase(condition.getProductName()));
        }
        if (StringUtils.hasText(condition.getCategory())) {
            builder.and(product.category.name.eq(condition.getCategory()));
        }
        if (StringUtils.hasText(condition.getBrand())) {
            builder.and(product.productBrand.eq(condition.getBrand()));
        }
        if (StringUtils.hasText(condition.getModelCode())) {
            builder.and(product.modelCode.eq(condition.getModelCode()));
        }
        if (StringUtils.hasText(condition.getEmployeeName())) {
            builder.and(employee.name.containsIgnoreCase(condition.getEmployeeName()));
        }
        if (condition.getStatus() != null) {
            builder.and(log.status.eq(condition.getStatus()));
        }
        if (condition.getStartDate() != null) {
            builder.and(request.createdAt.goe(condition.getStartDate().atStartOfDay()));
        }

        if (condition.getEndDate() != null) {
            builder.and(request.createdAt.loe(condition.getEndDate().atTime(LocalTime.MAX)));
        }

        if ("STAFF".equals(role)) {
            builder.and(request.receiver.employeeId.eq(viewerId)); // 접수자 본인 건만
        } else if ("ENGINEER".equals(role)) {
            builder.and(request.employee.employeeId.eq(viewerId)); // 담당자 본인 건만
        } else if ("ADMIN".equals(role)) {
            // 제약 없음
        }

        NumberExpression<Integer> statusPriority = new CaseBuilder()
                .when(log.status.eq(RequestAssignmentLog.AssignmentStatus.EXPIRED)).then(0)
                .when(log.status.eq(RequestAssignmentLog.AssignmentStatus.REJECTED)).then(1)
                .when(log.status.eq(RequestAssignmentLog.AssignmentStatus.CANCELLED)).then(2)
                .when(log.status.eq(RequestAssignmentLog.AssignmentStatus.ACCEPTED)).then(3)
                .when(log.status.eq(RequestAssignmentLog.AssignmentStatus.PENDING)).then(4)
                .otherwise(5);

        // 메인 쿼리
        List<RequestListResponseDto> content = queryFactory

                .select(
                        Projections.constructor(
                                RequestListResponseDto.class,
                                request.requestId,
                                request.requestNo,
                                customer.name,
                                product.productName,
                                product.modelCode,
                                product.category.name,
                                request.createdAt,
                                request.status.stringValue(),
                                employee.name,
                                log.status
                        )
                )
                .from(request)
                .leftJoin(request.customer, customer)
                .leftJoin(request.customerProduct, cp)
                .leftJoin(cp.product, product)
                .leftJoin(product.category, category)
                .leftJoin(request.employee, employee).leftJoin(log)
                .on(log.request.eq(request),
                        log.assignedAt.eq(
                                JPAExpressions.select(log.assignedAt.max())
                                        .from(log)
                                        .where(log.request.eq(request))
                        )
                )
                .where(builder)
                .orderBy(request.createdAt.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        // count 쿼리
        long total = queryFactory
                .select(request.count())
                .from(request)
                .leftJoin(request.customer, customer)
                .leftJoin(request.customerProduct, cp)
                .leftJoin(cp.product, product)
                .leftJoin(product.category, category)
                .leftJoin(request.employee, employee)
                .where(builder)
                .fetchOne();

        return new PageImpl<>(content, pageable, total);
    }
}

