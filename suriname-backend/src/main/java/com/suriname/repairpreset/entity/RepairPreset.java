package com.suriname.repairpreset.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "repair_preset")
@NoArgsConstructor
@Getter
public class RepairPreset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long repairPresetsId;

    @Column(nullable = false)
    private Long categoryId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private Integer cost;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    private RepairPreset(Long categoryId, String name, Integer cost) {
        this.categoryId = categoryId;
        this.name = name;
        this.cost = cost;
        this.isActive = true;
    }

    public static RepairPreset create(Long categoryId, String name, Integer cost) {
        return RepairPreset.builder()
                .categoryId(categoryId)
                .name(name)
                .cost(cost)
                .build();
    }

    public void inactive() {
        this.isActive = false;
    }
}
