package com.suriname.customer.controller;

import java.util.List;
import java.util.Map;

import com.suriname.product.dto.CustomerProductDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.suriname.customer.dto.CustomerDetailDto;
import com.suriname.customer.dto.CustomerListDto;
import com.suriname.customer.dto.CustomerRegisterDto;
import com.suriname.customer.dto.CustomerSearchDto;
import com.suriname.customer.service.CustomerExcelService;
import com.suriname.customer.service.CustomerService;
import com.suriname.product.entity.CustomerProduct;
import com.suriname.product.entity.Product;
import com.suriname.product.repository.CustomerProductRepository;

import io.swagger.v3.oas.models.responses.ApiResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final CustomerExcelService customerExcelService;
    private final CustomerProductRepository customerProductRepository;
    
    // 등록
    @PostMapping
    public ResponseEntity<?> register(@RequestBody CustomerRegisterDto dto) {
        Map<String, Long> ids = customerService.registerCustomer(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("status", 201, "data", ids));
    }

    // 목록 조회 
    @GetMapping
    public ResponseEntity<?> list(@RequestParam("page") int page, @RequestParam("size") int size) {
        Page<CustomerListDto> customers = customerService.getAll(PageRequest.of(page, size)); // ✅ DTO로 받기
        return ResponseEntity.ok(Map.of("status", 200, "data", customers));
    }

    
    // 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<?> detail(@PathVariable("id") Long id) {
        CustomerDetailDto dto = customerService.getDetailDto(id); 
        return ResponseEntity.ok(Map.of("status", 200, "data", dto));
    }


    // 단건 삭제
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        customerService.softDelete(id);
        return ResponseEntity.ok(Map.of("status", 200, "message", "삭제 완료"));
    }
    
    //다건 삭제
    @PostMapping("/delete")
    public ResponseEntity<?> deleteMultiple(@RequestBody List<Long> customerIds) {
        customerIds.forEach(customerService::softDelete);
        return ResponseEntity.ok(Map.of("status", 200, "message", customerIds.size() + "개 항목 삭제 완료"));
    }

    
    // 검색
    @PostMapping("/search")
    public ResponseEntity<?> searchCustomers(
            @RequestBody CustomerSearchDto requestDto,
            @RequestParam("page") int page,
            @RequestParam("size") int size
    ) {
        Page<CustomerListDto> result = customerService.searchCustomerDtos(requestDto, PageRequest.of(page, size));
        return ResponseEntity.ok(Map.of("status", 200, "data", result));
    }

    // 수정
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomer(
            @PathVariable("id") Long id,
            @RequestBody CustomerRegisterDto dto
    ) {
        customerService.updateCustomer(id, dto);
        return ResponseEntity.ok(Map.of("status", 200, "message", "고객 정보가 수정되었습니다."));
    }

    // 액셀 일괄 등록
    @PostMapping("/register/excel")
    public ResponseEntity<?> uploadExcel(@RequestParam("file") MultipartFile file) {
        try {
            customerExcelService.importFromExcel(file); 
            return ResponseEntity.ok(Map.of("message", "업로드 완료"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }
    
    // 자동완성
    @GetMapping("/autocomplete")
    public ResponseEntity<List<CustomerDetailDto>> autocompleteCustomers(@RequestParam("keyword") String keyword) {
        List<CustomerDetailDto> results = customerService.autocompleteCustomers(keyword);
        return ResponseEntity.ok(results);
    }

    // 고객명 검증
    @GetMapping("/validate/name/{name}")
    public ResponseEntity<Boolean> validateCustomerName(@PathVariable String name) {
        boolean exists = customerService.existsByName(name);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/{customerId}/products")
    public ResponseEntity<List<CustomerProductDto>> getCustomerProducts(@PathVariable("customerId") Long customerId) {
        List<CustomerProductDto> products = customerProductRepository
                .findByCustomerCustomerId(customerId)
                .stream()
                .map(CustomerProductDto::fromEntity)
                .toList();
        return ResponseEntity.ok(products);
    }


}
