package com.suriname.repairpreset.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QRepairPreset is a Querydsl query type for RepairPreset
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QRepairPreset extends EntityPathBase<RepairPreset> {

    private static final long serialVersionUID = -1535453390L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QRepairPreset repairPreset = new QRepairPreset("repairPreset");

    public final com.suriname.category.entity.QCategory category;

    public final NumberPath<Integer> cost = createNumber("cost", Integer.class);

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final BooleanPath isActive = createBoolean("isActive");

    public final StringPath name = createString("name");

    public final NumberPath<Long> repairPresetsId = createNumber("repairPresetsId", Long.class);

    public QRepairPreset(String variable) {
        this(RepairPreset.class, forVariable(variable), INITS);
    }

    public QRepairPreset(Path<? extends RepairPreset> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QRepairPreset(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QRepairPreset(PathMetadata metadata, PathInits inits) {
        this(RepairPreset.class, metadata, inits);
    }

    public QRepairPreset(Class<? extends RepairPreset> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.category = inits.isInitialized("category") ? new com.suriname.category.entity.QCategory(forProperty("category"), inits.get("category")) : null;
    }

}

