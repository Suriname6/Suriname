package com.suriname.completion.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QCompletion is a Querydsl query type for Completion
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QCompletion extends EntityPathBase<Completion> {

    private static final long serialVersionUID = -1418223054L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QCompletion completion = new QCompletion("completion");

    public final com.suriname.employee.entity.QEmployee completedBy;

    public final NumberPath<Long> completionId = createNumber("completionId", Long.class);

    public final StringPath completionNotes = createString("completionNotes");

    public final EnumPath<Completion.CompletionType> completionType = createEnum("completionType", Completion.CompletionType.class);

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final BooleanPath customerReceived = createBoolean("customerReceived");

    public final com.suriname.delivery.entity.QDelivery delivery;

    public final DateTimePath<java.time.LocalDateTime> receivedDate = createDateTime("receivedDate", java.time.LocalDateTime.class);

    public final com.suriname.request.entity.QRequest request;

    public final BooleanPath satisfactionRequested = createBoolean("satisfactionRequested");

    public final DateTimePath<java.time.LocalDateTime> satisfactionSentDate = createDateTime("satisfactionSentDate", java.time.LocalDateTime.class);

    public final DateTimePath<java.time.LocalDateTime> updatedAt = createDateTime("updatedAt", java.time.LocalDateTime.class);

    public QCompletion(String variable) {
        this(Completion.class, forVariable(variable), INITS);
    }

    public QCompletion(Path<? extends Completion> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QCompletion(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QCompletion(PathMetadata metadata, PathInits inits) {
        this(Completion.class, metadata, inits);
    }

    public QCompletion(Class<? extends Completion> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.completedBy = inits.isInitialized("completedBy") ? new com.suriname.employee.entity.QEmployee(forProperty("completedBy")) : null;
        this.delivery = inits.isInitialized("delivery") ? new com.suriname.delivery.entity.QDelivery(forProperty("delivery"), inits.get("delivery")) : null;
        this.request = inits.isInitialized("request") ? new com.suriname.request.entity.QRequest(forProperty("request"), inits.get("request")) : null;
    }

}

