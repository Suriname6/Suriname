package com.suriname.analytics.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;


/**
 * QTempRequest is a Querydsl query type for TempRequest
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QTempRequest extends EntityPathBase<TempRequest> {

    private static final long serialVersionUID = -1509032267L;

    public static final QTempRequest tempRequest = new QTempRequest("tempRequest");

    public final StringPath content = createString("content");

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final NumberPath<Long> customerId = createNumber("customerId", Long.class);

    public final NumberPath<Long> customerProductId = createNumber("customerProductId", Long.class);

    public final NumberPath<Long> employeeId = createNumber("employeeId", Long.class);

    public final StringPath inputBrand = createString("inputBrand");

    public final StringPath inputModel = createString("inputModel");

    public final StringPath inputProductName = createString("inputProductName");

    public final NumberPath<Long> requestId = createNumber("requestId", Long.class);

    public final StringPath requestNo = createString("requestNo");

    public final EnumPath<RequestStatus> status = createEnum("status", RequestStatus.class);

    public final DateTimePath<java.time.LocalDateTime> updatedAt = createDateTime("updatedAt", java.time.LocalDateTime.class);

    public QTempRequest(String variable) {
        super(TempRequest.class, forVariable(variable));
    }

    public QTempRequest(Path<? extends TempRequest> path) {
        super(path.getType(), path.getMetadata());
    }

    public QTempRequest(PathMetadata metadata) {
        super(TempRequest.class, metadata);
    }

}

