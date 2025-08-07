package com.suriname.category.controller;

import com.suriname.category.entity.Category;
import com.suriname.category.entity.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllCategories() {
        try {
            List<Category> categories = categoryRepository.findAll();
            
            List<Map<String, Object>> categoryList = new java.util.ArrayList<>();
            for (Category category : categories) {
                if (category.getIsVisible() != null && category.getIsVisible()) {
                    Map<String, Object> categoryMap = new java.util.HashMap<>();
                    categoryMap.put("categoryId", category.getCategoryId());
                    categoryMap.put("name", category.getName());
                    categoryMap.put("parentId", category.getParent() != null ? category.getParent().getCategoryId() : null);
                    categoryList.add(categoryMap);
                }
            }
            
            return ResponseEntity.ok(Map.of(
                "status", 200,
                "data", categoryList
            ));
        } catch (Exception e) {
            e.printStackTrace(); // 로그에 에러 출력
            return ResponseEntity.status(500).body(Map.of(
                "status", 500,
                "message", "카테고리 조회 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
}