package com.suriname.category.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CategoryResponseDto {
    private Long id;
    private Long parentId;
    private String name;
    private Boolean isVisible;
}
