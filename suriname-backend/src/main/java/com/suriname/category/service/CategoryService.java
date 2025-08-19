package com.suriname.category.service;

import com.suriname.category.dto.CategoryResponseDto;
import com.suriname.category.repository.CategoryRepository;
import com.suriname.product.repository.ProductRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponseDto> getVisibleCategories() {
        return categoryRepository.findByIsVisibleTrue().stream()
                .map(category -> new CategoryResponseDto(
                        category.getCategoryId(),
                        category.getParent() != null ? category.getParent().getCategoryId() : null,
                        category.getName(),
                        category.getIsVisible()
                ))
                .collect(Collectors.toList());
    }
}
