package com.suriname.product.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QCustomerProduct is a Querydsl query type for CustomerProduct
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QCustomerProduct extends EntityPathBase<CustomerProduct> {

    private static final long serialVersionUID = -1921368958L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QCustomerProduct customerProduct = new QCustomerProduct("customerProduct");

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final com.suriname.customer.entity.QCustomer customer;

    public final NumberPath<Long> customerProductId = createNumber("customerProductId", Long.class);

    public final QProduct product;

    public final StringPath serialNumber = createString("serialNumber");

    public final DateTimePath<java.time.LocalDateTime> updatedAt = createDateTime("updatedAt", java.time.LocalDateTime.class);

    public QCustomerProduct(String variable) {
        this(CustomerProduct.class, forVariable(variable), INITS);
    }

    public QCustomerProduct(Path<? extends CustomerProduct> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QCustomerProduct(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QCustomerProduct(PathMetadata metadata, PathInits inits) {
        this(CustomerProduct.class, metadata, inits);
    }

    public QCustomerProduct(Class<? extends CustomerProduct> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.customer = inits.isInitialized("customer") ? new com.suriname.customer.entity.QCustomer(forProperty("customer")) : null;
        this.product = inits.isInitialized("product") ? new QProduct(forProperty("product"), inits.get("product")) : null;
    }

}

