package com.suriname.customer.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import com.suriname.product.dto.CustomerProductDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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
import com.suriname.customer.service.CustomerTemplateService;
import com.suriname.product.repository.CustomerProductRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final CustomerExcelService customerExcelService;
    private final CustomerProductRepository customerProductRepository;
    private final CustomerTemplateService customerTemplateService;

    
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
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<?> detail(@PathVariable("id") Long id) {
        CustomerDetailDto dto = customerService.getDetailDto(id); 
        return ResponseEntity.ok(Map.of("status", 200, "data", dto));
    }


    // 단건 삭제
    @DeleteMapping("/delete/{id:\\d+}")
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
    @PutMapping("/{id:\\d+}")
    public ResponseEntity<?> updateCustomer(
            @PathVariable("id") Long id,
            @RequestBody CustomerRegisterDto dto
    ) {
        customerService.updateCustomer(id, dto);
        return ResponseEntity.ok(Map.of("status", 200, "message", "고객 정보가 수정되었습니다."));
    }

 // 액셀 일괄 등록
    @PostMapping(
        value = "/register/excel",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> uploadExcel(@RequestParam("file") MultipartFile file) {
        try {
            return customerExcelService.importFromExcel(file);
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "status", 500,
                    "message", "업로드 실패",
                    "error", e.getMessage()
                ));
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

    // 엑셀 템플릿
    @GetMapping(
    	    value = "/template",
    	    produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    	)
    	public ResponseEntity<byte[]> downloadCustomerTemplate() throws IOException {
    	    byte[] file = customerTemplateService.buildCustomerTemplate();

    	    HttpHeaders headers = new HttpHeaders();
    	    headers.setContentDisposition(
    	        ContentDisposition.attachment()
    	            .filename("CustomerListTemplate.xlsx", java.nio.charset.StandardCharsets.UTF_8)
    	            .build()
    	    );
    	    headers.setContentType(
    	        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    	    );
    	    return new ResponseEntity<>(file, headers, HttpStatus.OK);
    	}
}
