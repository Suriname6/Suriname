package com.suriname.quote.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QQuote is a Querydsl query type for Quote
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QQuote extends EntityPathBase<Quote> {

    private static final long serialVersionUID = -1469719584L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QQuote quote = new QQuote("quote");

    public final DateTimePath<java.time.LocalDateTime> approvedAt = createDateTime("approvedAt", java.time.LocalDateTime.class);

    public final NumberPath<Long> cost = createNumber("cost", Long.class);

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final com.suriname.employee.entity.QEmployee employee;

    public final StringPath field = createString("field");

    public final BooleanPath isApproved = createBoolean("isApproved");

    public final NumberPath<Long> quoteId = createNumber("quoteId", Long.class);

    public final com.suriname.request.entity.QRequest request;

    public QQuote(String variable) {
        this(Quote.class, forVariable(variable), INITS);
    }

    public QQuote(Path<? extends Quote> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QQuote(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QQuote(PathMetadata metadata, PathInits inits) {
        this(Quote.class, metadata, inits);
    }

    public QQuote(Class<? extends Quote> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.employee = inits.isInitialized("employee") ? new com.suriname.employee.entity.QEmployee(forProperty("employee")) : null;
        this.request = inits.isInitialized("request") ? new com.suriname.request.entity.QRequest(forProperty("request"), inits.get("request")) : null;
    }

}

