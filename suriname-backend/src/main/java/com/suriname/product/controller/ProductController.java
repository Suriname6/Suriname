package com.suriname.product.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.suriname.product.dto.ProductDto;
import com.suriname.product.dto.ProductSearchDto;
import com.suriname.product.entity.Product;
import com.suriname.product.entity.ProductSpecification;
import com.suriname.product.repository.ProductRepository;
import com.suriname.product.service.ProductExcelService;
import com.suriname.product.service.ProductService;
import com.suriname.product.service.ProductTemplateService;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

	private final ProductService productService;
	private final ProductRepository productRepository;
	private final ProductExcelService productExcelService;
	private final ProductTemplateService productTemplateService;

	// 전체 조회
	@GetMapping
	public ResponseEntity<?> getAllProducts() {
		List<ProductDto> products = productService.getAllProducts();
		return ResponseEntity.ok(Map.of("status", 200, "data", products));
	}

	// 등록
	@PostMapping
	public ResponseEntity<?> registerProduct(@RequestBody ProductDto dto) {
		productService.registerProduct(dto);
		return ResponseEntity.ok(Map.of("status", 200, "message", "제품이 등록되었습니다."));
	}

	// 수정
	@PutMapping("/{id}")
	public ResponseEntity<?> updateProduct(@PathVariable("id") Long id, @RequestBody ProductDto dto) {
		productService.updateProduct(id, dto);
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
	public ResponseEntity<List<ProductDto>> autocompleteProducts(@RequestParam("keyword") String keyword) {
		List<Product> products = productRepository
				.findAll(ProductSpecification.containsKeyword(keyword), PageRequest.of(0, 10)).getContent();

		List<ProductDto> result = products.stream().map(ProductDto::fromEntity).toList();

		return ResponseEntity.ok(result);
	}

	// 엑셀
	@PostMapping(value = "/register/excel", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> uploadExcel(@RequestParam("file") MultipartFile file) throws IOException {
		return productExcelService.importFromExcel(file);
	}

	// 엑셀 템플릿
	@GetMapping(value = "/template", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	public ResponseEntity<byte[]> downloadProductTemplate() throws IOException {
		byte[] file = productTemplateService.buildProductTemplate();

		HttpHeaders headers = new HttpHeaders();
		headers.setContentDisposition(ContentDisposition.attachment()
				.filename("ProductListTemplate.xlsx", java.nio.charset.StandardCharsets.UTF_8).build());
		headers.setContentType(
				MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
		return new ResponseEntity<>(file, headers, HttpStatus.OK);
	}

}
