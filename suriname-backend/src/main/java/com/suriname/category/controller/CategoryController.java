package com.suriname.category.controller;

import com.suriname.category.dto.CategoryDto;
import com.suriname.category.entity.Category;
import com.suriname.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public List<String> getAllCategoryNames() {
        return categoryRepository.findAll().stream()
                .map(Category::getName)
                .distinct()
                .toList();
    }

    @GetMapping("/visible")
    public ResponseEntity<Map<String, Object>> getVisibleCategories() {
        List<CategoryDto> categories = categoryRepository.findByIsVisibleTrue()
                .stream()
                .map(CategoryDto::fromEntity)
                .toList();
        return ResponseEntity.ok(Map.of("status", 200, "data", categories));
    }
}