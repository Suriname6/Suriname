package com.suriname.satisfaction.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QSatisfaction is a Querydsl query type for Satisfaction
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QSatisfaction extends EntityPathBase<Satisfaction> {

    private static final long serialVersionUID = -1351576878L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QSatisfaction satisfaction = new QSatisfaction("satisfaction");

    public final com.suriname.completion.entity.QCompletion completion;

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final com.suriname.customer.entity.QCustomer customer;

    public final NumberPath<Integer> deliveryRating = createNumber("deliveryRating", Integer.class);

    public final StringPath feedback = createString("feedback");

    public final StringPath ipAddress = createString("ipAddress");

    public final NumberPath<Integer> overallRating = createNumber("overallRating", Integer.class);

    public final NumberPath<Byte> rating = createNumber("rating", Byte.class);

    public final BooleanPath recommendToOthers = createBoolean("recommendToOthers");

    public final com.suriname.request.entity.QRequest request;

    public final NumberPath<Integer> responseTimeRating = createNumber("responseTimeRating", Integer.class);

    public final NumberPath<Long> satisfactionId = createNumber("satisfactionId", Long.class);

    public final NumberPath<Integer> serviceQualityRating = createNumber("serviceQualityRating", Integer.class);

    public final NumberPath<Integer> staffKindnessRating = createNumber("staffKindnessRating", Integer.class);

    public final DateTimePath<java.time.LocalDateTime> submittedAt = createDateTime("submittedAt", java.time.LocalDateTime.class);

    public final EnumPath<Satisfaction.SurveyMethod> surveyMethod = createEnum("surveyMethod", Satisfaction.SurveyMethod.class);

    public QSatisfaction(String variable) {
        this(Satisfaction.class, forVariable(variable), INITS);
    }

    public QSatisfaction(Path<? extends Satisfaction> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QSatisfaction(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QSatisfaction(PathMetadata metadata, PathInits inits) {
        this(Satisfaction.class, metadata, inits);
    }

    public QSatisfaction(Class<? extends Satisfaction> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.completion = inits.isInitialized("completion") ? new com.suriname.completion.entity.QCompletion(forProperty("completion"), inits.get("completion")) : null;
        this.customer = inits.isInitialized("customer") ? new com.suriname.customer.entity.QCustomer(forProperty("customer")) : null;
        this.request = inits.isInitialized("request") ? new com.suriname.request.entity.QRequest(forProperty("request"), inits.get("request")) : null;
    }

}

