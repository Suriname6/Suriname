package com.suriname.requestdetail.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QRequestDetail is a Querydsl query type for RequestDetail
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QRequestDetail extends EntityPathBase<RequestDetail> {

    private static final long serialVersionUID = 1769543040L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QRequestDetail requestDetail = new QRequestDetail("requestDetail");

    public final StringPath content = createString("content");

    public final NumberPath<Integer> cost = createNumber("cost", Integer.class);

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final com.suriname.employee.entity.QEmployee employee;

    public final com.suriname.repairpreset.entity.QRepairPreset repairPreset;

    public final com.suriname.request.entity.QRequest request;

    public final NumberPath<Long> requestDetailId = createNumber("requestDetailId", Long.class);

    public QRequestDetail(String variable) {
        this(RequestDetail.class, forVariable(variable), INITS);
    }

    public QRequestDetail(Path<? extends RequestDetail> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QRequestDetail(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QRequestDetail(PathMetadata metadata, PathInits inits) {
        this(RequestDetail.class, metadata, inits);
    }

    public QRequestDetail(Class<? extends RequestDetail> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.employee = inits.isInitialized("employee") ? new com.suriname.employee.entity.QEmployee(forProperty("employee")) : null;
        this.repairPreset = inits.isInitialized("repairPreset") ? new com.suriname.repairpreset.entity.QRepairPreset(forProperty("repairPreset")) : null;
        this.request = inits.isInitialized("request") ? new com.suriname.request.entity.QRequest(forProperty("request"), inits.get("request")) : null;
    }

}

