package com.suriname.product.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.suriname.category.entity.Category;
import com.suriname.category.repository.CategoryRepository;
import com.suriname.product.dto.ProductDto;
import com.suriname.product.dto.ProductSearchDto;
import com.suriname.product.entity.Product;
import com.suriname.product.service.ProductService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

	private final ProductService productService;
	private final CategoryRepository categoryRepository;

	// 전체 조회
	@GetMapping
	public ResponseEntity<?> getAllProducts() {
		List<ProductDto> products = productService.getAllProducts();
		return ResponseEntity.ok(Map.of("status", 200, "data", products));
	}

	// 등록
	@PostMapping
	public ResponseEntity<?> registerProduct(@RequestBody ProductDto dto) {
		Category category = categoryRepository.findByName(dto.getCategoryName())
				.orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));
		productService.registerProduct(dto, category);
		return ResponseEntity.ok(Map.of("status", 200, "message", "제품이 등록되었습니다."));
	}

	// 수정
	@PutMapping("/{id}")
	public ResponseEntity<?> updateProduct(@PathVariable("id") Long id, @RequestBody ProductDto dto) {
		Category category = categoryRepository.findByName(dto.getCategoryName())
				.orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));
		productService.updateProduct(id, dto, category);
		return ResponseEntity.ok(Map.of("status", 200, "message", "제품이 수정되었습니다."));
	}

	// 단건 삭제
	@DeleteMapping("delete/{id}")
	public ResponseEntity<?> deleteProduct(@PathVariable("id") Long id) {
		productService.deleteProduct(id);
		return ResponseEntity.ok(Map.of("status", 200, "message", "제품이 삭제되었습니다."));
	}
	
	// 다건 삭제
	@PostMapping("/delete")
	public ResponseEntity<?> deleteMultiple(@RequestBody List<Long> productIds) {
	    productIds.forEach(productService::softDelete);
	    return ResponseEntity.ok(Map.of("status", 200, "message", productIds.size() + "개 항목 삭제 완료"));
	}


	// 상세
	@GetMapping("/{id}")
	public ResponseEntity<?> getProductById(@PathVariable("id") Long id) {
		Product product = productService.findById(id);
		return ResponseEntity.ok(Map.of("status", 200, "data", ProductDto.fromEntity(product)));
	}

	// 검색
	@PostMapping("/search")
	public ResponseEntity<?> searchProducts(@RequestBody ProductSearchDto dto, @RequestParam("page") int page,
			@RequestParam("size") int size) {
		Page<ProductDto> result = productService.searchProducts(dto, PageRequest.of(page, size));
		return ResponseEntity.ok(Map.of("status", 200, "data", result));
	}

	// 자동완성
	@GetMapping("/autocomplete")
	public ResponseEntity<?> autocomplete(@RequestParam("name") String name) {
		List<ProductDto> results = productService.autocomplete(name);
		return ResponseEntity.ok(Map.of("status", 200, "data", results));
	}

	// 엑셀
	@PostMapping("upload/excel")
	public ResponseEntity<?> uploadExcel(@RequestParam("file") MultipartFile file) {
		productService.importFromExcel(file);
		return ResponseEntity.ok(Map.of("status", 200, "message", "엑셀 등록이 완료되었습니다."));
	}
}
