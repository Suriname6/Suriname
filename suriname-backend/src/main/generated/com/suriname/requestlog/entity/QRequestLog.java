package com.suriname.requestlog.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QRequestLog is a Querydsl query type for RequestLog
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QRequestLog extends EntityPathBase<RequestLog> {

    private static final long serialVersionUID = -97977660L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QRequestLog requestLog = new QRequestLog("requestLog");

    public final DateTimePath<java.time.LocalDateTime> changeAt = createDateTime("changeAt", java.time.LocalDateTime.class);

    public final com.suriname.employee.entity.QEmployee employee;

    public final NumberPath<Long> logId = createNumber("logId", Long.class);

    public final StringPath memo = createString("memo");

    public final EnumPath<RequestLog.NewStatus> newStatus = createEnum("newStatus", RequestLog.NewStatus.class);

    public final EnumPath<RequestLog.PreStatus> preStatus = createEnum("preStatus", RequestLog.PreStatus.class);

    public final com.suriname.request.entity.QRequest request;

    public QRequestLog(String variable) {
        this(RequestLog.class, forVariable(variable), INITS);
    }

    public QRequestLog(Path<? extends RequestLog> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QRequestLog(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QRequestLog(PathMetadata metadata, PathInits inits) {
        this(RequestLog.class, metadata, inits);
    }

    public QRequestLog(Class<? extends RequestLog> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.employee = inits.isInitialized("employee") ? new com.suriname.employee.entity.QEmployee(forProperty("employee")) : null;
        this.request = inits.isInitialized("request") ? new com.suriname.request.entity.QRequest(forProperty("request"), inits.get("request")) : null;
    }

}

