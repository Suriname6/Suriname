package com.suriname.customer.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QCustomer is a Querydsl query type for Customer
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QCustomer extends EntityPathBase<Customer> {

    private static final long serialVersionUID = -4614410L;

    public static final QCustomer customer = new QCustomer("customer");

    public final StringPath address = createString("address");

    public final DatePath<java.time.LocalDate> birth = createDate("birth", java.time.LocalDate.class);

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final NumberPath<Long> customerId = createNumber("customerId", Long.class);

    public final ListPath<com.suriname.product.entity.CustomerProduct, com.suriname.product.entity.QCustomerProduct> customerProducts = this.<com.suriname.product.entity.CustomerProduct, com.suriname.product.entity.QCustomerProduct>createList("customerProducts", com.suriname.product.entity.CustomerProduct.class, com.suriname.product.entity.QCustomerProduct.class, PathInits.DIRECT2);

    public final StringPath email = createString("email");

    public final BooleanPath isDeleted = createBoolean("isDeleted");

    public final StringPath name = createString("name");

    public final StringPath phone = createString("phone");

    public final EnumPath<Customer.Status> status = createEnum("status", Customer.Status.class);

    public final DateTimePath<java.time.LocalDateTime> updatedAt = createDateTime("updatedAt", java.time.LocalDateTime.class);

    public QCustomer(String variable) {
        super(Customer.class, forVariable(variable));
    }

    public QCustomer(Path<? extends Customer> path) {
        super(path.getType(), path.getMetadata());
    }

    public QCustomer(PathMetadata metadata) {
        super(Customer.class, metadata);
    }

}

