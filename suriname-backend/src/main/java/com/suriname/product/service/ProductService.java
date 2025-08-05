package com.suriname.product.service;


import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.suriname.category.entity.Category;
import com.suriname.product.dto.ProductDto;
import com.suriname.product.dto.ProductSearchDto;
import com.suriname.product.entity.Product;
import com.suriname.product.entity.ProductSpecification;
import com.suriname.product.repository.ProductRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductExcelService productExcelService;

    // 조회
    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 등록
    public void registerProduct(ProductDto dto, Category category) {
        productRepository.save(dto.toEntity(category));
    }

    // 수정
    public void updateProduct(Long id, ProductDto dto, Category category) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 제품이 존재하지 않습니다."));
        product.updateFromDto(dto, category);
        productRepository.save(product);
    }


    // 삭제
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
    
    @Transactional
    public void softDelete(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("제품을 찾을 수 없습니다."));
        product.markAsDeleted(); 
        productRepository.save(product);
    }

    
    // 상세
    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 제품이 존재하지 않습니다."));
    }


    // 검색
    public Page<ProductDto> searchProducts(ProductSearchDto dto, Pageable pageable) {
        Page<Product> result = productRepository.findAll(ProductSpecification.search(dto), pageable);
        return result.map(ProductDto::fromEntity);
    }

    
    // 자동완성
    public List<ProductDto> autocomplete(String keyword) {
        return productRepository.findByProductNameContainingIgnoreCase(keyword)
                    .stream()
                    .map(ProductDto::fromEntity)
                    .collect(Collectors.toList());
    }


    // 엑셀
    public void importFromExcel(MultipartFile file) {
        productExcelService.importFromExcel(file);
    }
}

