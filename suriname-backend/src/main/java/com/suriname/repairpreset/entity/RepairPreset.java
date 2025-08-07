package com.suriname.repairpreset.entity;

import com.suriname.category.entity.Category;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "repair_preset")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class RepairPreset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long repairPresetsId;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private Integer cost;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public RepairPreset(Category category, String name, Integer cost) {
        this.category = category;
        this.name = name;
        this.cost = cost;
        this.isActive = true;
    }

    public void inactive() {
        this.isActive = false;
    }
}
