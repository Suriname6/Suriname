package com.suriname.request.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QRequestAssignmentLog is a Querydsl query type for RequestAssignmentLog
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QRequestAssignmentLog extends EntityPathBase<RequestAssignmentLog> {

    private static final long serialVersionUID = -1324087849L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QRequestAssignmentLog requestAssignmentLog = new QRequestAssignmentLog("requestAssignmentLog");

    public final DateTimePath<java.time.LocalDateTime> assignedAt = createDateTime("assignedAt", java.time.LocalDateTime.class);

    public final com.suriname.employee.entity.QEmployee assignedBy;

    public final NumberPath<Long> assignmentLogId = createNumber("assignmentLogId", Long.class);

    public final EnumPath<RequestAssignmentLog.AssignmentType> assignmentType = createEnum("assignmentType", RequestAssignmentLog.AssignmentType.class);

    public final com.suriname.employee.entity.QEmployee employee;

    public final StringPath notes = createString("notes");

    public final StringPath rejectionReason = createString("rejectionReason");

    public final QRequest request;

    public final EnumPath<RequestAssignmentLog.AssignmentStatus> status = createEnum("status", RequestAssignmentLog.AssignmentStatus.class);

    public final DateTimePath<java.time.LocalDateTime> statusChangedAt = createDateTime("statusChangedAt", java.time.LocalDateTime.class);

    public QRequestAssignmentLog(String variable) {
        this(RequestAssignmentLog.class, forVariable(variable), INITS);
    }

    public QRequestAssignmentLog(Path<? extends RequestAssignmentLog> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QRequestAssignmentLog(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QRequestAssignmentLog(PathMetadata metadata, PathInits inits) {
        this(RequestAssignmentLog.class, metadata, inits);
    }

    public QRequestAssignmentLog(Class<? extends RequestAssignmentLog> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.assignedBy = inits.isInitialized("assignedBy") ? new com.suriname.employee.entity.QEmployee(forProperty("assignedBy")) : null;
        this.employee = inits.isInitialized("employee") ? new com.suriname.employee.entity.QEmployee(forProperty("employee")) : null;
        this.request = inits.isInitialized("request") ? new QRequest(forProperty("request"), inits.get("request")) : null;
    }

}

