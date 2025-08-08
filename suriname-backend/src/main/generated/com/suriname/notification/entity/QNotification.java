package com.suriname.notification.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QNotification is a Querydsl query type for Notification
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QNotification extends EntityPathBase<Notification> {

    private static final long serialVersionUID = -243491312L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QNotification notification = new QNotification("notification");

    public final StringPath channel = createString("channel");

    public final StringPath content = createString("content");

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final com.suriname.customer.entity.QCustomer customer;

    public final com.suriname.employee.entity.QEmployee employee;

    public final EnumPath<Notification.NotificationType> eventType = createEnum("eventType", Notification.NotificationType.class);

    public final BooleanPath isRead = createBoolean("isRead");

    public final NumberPath<Long> notificationId = createNumber("notificationId", Long.class);

    public final com.suriname.request.entity.QRequest request;

    public QNotification(String variable) {
        this(Notification.class, forVariable(variable), INITS);
    }

    public QNotification(Path<? extends Notification> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QNotification(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QNotification(PathMetadata metadata, PathInits inits) {
        this(Notification.class, metadata, inits);
    }

    public QNotification(Class<? extends Notification> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.customer = inits.isInitialized("customer") ? new com.suriname.customer.entity.QCustomer(forProperty("customer")) : null;
        this.employee = inits.isInitialized("employee") ? new com.suriname.employee.entity.QEmployee(forProperty("employee")) : null;
        this.request = inits.isInitialized("request") ? new com.suriname.request.entity.QRequest(forProperty("request"), inits.get("request")) : null;
    }

}

