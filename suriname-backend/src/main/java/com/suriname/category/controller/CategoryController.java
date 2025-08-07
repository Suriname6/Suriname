package com.suriname.category.controller;

import com.suriname.category.dto.CategoryResponseDto;
import com.suriname.category.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponseDto>> getVisibleCategories() {
        List<CategoryResponseDto> responseDtos = categoryService.getVisibleCategories();
        return ResponseEntity.ok(responseDtos);
    }
}
