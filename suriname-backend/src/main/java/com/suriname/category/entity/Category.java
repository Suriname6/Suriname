package com.suriname.category.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "category")
@NoArgsConstructor
@Getter
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false)
    private Boolean isVisible;

    @Builder
    private Category(Category parent, String name, Boolean isVisible) {
        this.parent = parent;
        this.name = name;
        this.isVisible = isVisible;
    }

    public static Category create(Category parent, String name, Boolean isVisible) {
        return Category.builder()
                .parent(parent)
                .name(name)
                .isVisible(isVisible)
                .build();
    }
}
