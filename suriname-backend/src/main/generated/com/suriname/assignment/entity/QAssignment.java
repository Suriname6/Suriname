package com.suriname.assignment.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QAssignment is a Querydsl query type for Assignment
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QAssignment extends EntityPathBase<Assignment> {

    private static final long serialVersionUID = 877948372L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QAssignment assignment = new QAssignment("assignment");

    public final com.suriname.employee.entity.QEmployee assignedBy;

    public final NumberPath<Long> assignmentId = createNumber("assignmentId", Long.class);

    public final EnumPath<Assignment.AssignmentType> assignmentType = createEnum("assignmentType", Assignment.AssignmentType.class);

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final com.suriname.employee.entity.QEmployee employee;

    public final StringPath memo = createString("memo");

    public final com.suriname.request.entity.QRequest request;

    public final DateTimePath<java.time.LocalDateTime> respondedAt = createDateTime("respondedAt", java.time.LocalDateTime.class);

    public final EnumPath<Assignment.ResponseStatus> responseStatus = createEnum("responseStatus", Assignment.ResponseStatus.class);

    public QAssignment(String variable) {
        this(Assignment.class, forVariable(variable), INITS);
    }

    public QAssignment(Path<? extends Assignment> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QAssignment(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QAssignment(PathMetadata metadata, PathInits inits) {
        this(Assignment.class, metadata, inits);
    }

    public QAssignment(Class<? extends Assignment> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.assignedBy = inits.isInitialized("assignedBy") ? new com.suriname.employee.entity.QEmployee(forProperty("assignedBy")) : null;
        this.employee = inits.isInitialized("employee") ? new com.suriname.employee.entity.QEmployee(forProperty("employee")) : null;
        this.request = inits.isInitialized("request") ? new com.suriname.request.entity.QRequest(forProperty("request"), inits.get("request")) : null;
    }

}

