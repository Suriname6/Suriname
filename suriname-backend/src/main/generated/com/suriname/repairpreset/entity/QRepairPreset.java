package com.suriname.repairpreset.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;


/**
 * QRepairPreset is a Querydsl query type for RepairPreset
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QRepairPreset extends EntityPathBase<RepairPreset> {

    private static final long serialVersionUID = -1535453390L;

    public static final QRepairPreset repairPreset = new QRepairPreset("repairPreset");

    public final NumberPath<Long> categoryId = createNumber("categoryId", Long.class);

    public final NumberPath<Integer> cost = createNumber("cost", Integer.class);

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final BooleanPath isActive = createBoolean("isActive");

    public final StringPath name = createString("name");

    public final NumberPath<Long> repairPresetsId = createNumber("repairPresetsId", Long.class);

    public QRepairPreset(String variable) {
        super(RepairPreset.class, forVariable(variable));
    }

    public QRepairPreset(Path<? extends RepairPreset> path) {
        super(path.getType(), path.getMetadata());
    }

    public QRepairPreset(PathMetadata metadata) {
        super(RepairPreset.class, metadata);
    }

}

