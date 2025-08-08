package com.suriname.request.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QRequest is a Querydsl query type for Request
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QRequest extends EntityPathBase<Request> {

    private static final long serialVersionUID = 259917632L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QRequest request = new QRequest("request");

    public final ListPath<RequestAssignmentLog, QRequestAssignmentLog> assignmentLogs = this.<RequestAssignmentLog, QRequestAssignmentLog>createList("assignmentLogs", RequestAssignmentLog.class, QRequestAssignmentLog.class, PathInits.DIRECT2);

    public final StringPath content = createString("content");

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final com.suriname.customer.entity.QCustomer customer;

    public final com.suriname.product.entity.QCustomerProduct customerProduct;

    public final com.suriname.employee.entity.QEmployee employee;

    public final com.suriname.payment.QPayment payment;

    public final com.suriname.employee.entity.QEmployee receiver;

    public final NumberPath<Long> requestId = createNumber("requestId", Long.class);

    public final ListPath<com.suriname.image.entity.Image, com.suriname.image.entity.QImage> requestImages = this.<com.suriname.image.entity.Image, com.suriname.image.entity.QImage>createList("requestImages", com.suriname.image.entity.Image.class, com.suriname.image.entity.QImage.class, PathInits.DIRECT2);

    public final StringPath requestNo = createString("requestNo");

    public final EnumPath<Request.Status> status = createEnum("status", Request.Status.class);

    public QRequest(String variable) {
        this(Request.class, forVariable(variable), INITS);
    }

    public QRequest(Path<? extends Request> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QRequest(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QRequest(PathMetadata metadata, PathInits inits) {
        this(Request.class, metadata, inits);
    }

    public QRequest(Class<? extends Request> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.customer = inits.isInitialized("customer") ? new com.suriname.customer.entity.QCustomer(forProperty("customer")) : null;
        this.customerProduct = inits.isInitialized("customerProduct") ? new com.suriname.product.entity.QCustomerProduct(forProperty("customerProduct"), inits.get("customerProduct")) : null;
        this.employee = inits.isInitialized("employee") ? new com.suriname.employee.entity.QEmployee(forProperty("employee")) : null;
        this.payment = inits.isInitialized("payment") ? new com.suriname.payment.QPayment(forProperty("payment"), inits.get("payment")) : null;
        this.receiver = inits.isInitialized("receiver") ? new com.suriname.employee.entity.QEmployee(forProperty("receiver")) : null;
    }

}

