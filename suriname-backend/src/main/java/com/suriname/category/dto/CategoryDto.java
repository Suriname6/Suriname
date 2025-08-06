package com.suriname.category.dto;

import com.suriname.category.entity.Category;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDto {
    private Long categoryId;
    private Long parentId;
    private String name;
    private Boolean isVisible;

    public static CategoryDto fromEntity(Category category) {
        return CategoryDto.builder()
                .categoryId(category.getCategoryId())
                .parentId(category.getParent() != null ? category.getParent().getCategoryId() : null)
                .name(category.getName())
                .isVisible(category.getIsVisible())
                .build();
    }
    
    public Category toEntity(Category parent) {
        return Category.builder()
                .parent(parent)
                .name(this.name)
                .isVisible(this.isVisible != null ? this.isVisible : true)
                .build();
    }

}