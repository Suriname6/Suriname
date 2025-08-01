package com.suriname.customer;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final CustomerExcelService customerExcelService;

    // 등록
    @PostMapping
    public ResponseEntity<?> register(@RequestBody CustomerRegisterDto dto) {
        Map<String, Long> ids = customerService.registerCustomer(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("status", 201, "data", ids));
    }

    // 목록 조회 
    @GetMapping
    public ResponseEntity<?> list(@RequestParam int page, @RequestParam int size) {
        Page<Customer> customers = customerService.getAll(PageRequest.of(page, size));
        return ResponseEntity.ok(Map.of("status", 200, "data", customers));
    }
    
    // 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<?> detail(@PathVariable Long id) {
        Customer customer = customerService.getDetail(id);
        return ResponseEntity.ok(Map.of("status", 200, "data", customer));
    }
    
    
    // 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        customerService.softDelete(id);
        return ResponseEntity.ok(Map.of("status", 200, "message", "삭제 완료"));
    }
    
    // 액셀 일괄 등록
    @PostMapping("/upload")
    public ResponseEntity<?> uploadExcel(@RequestParam("file") MultipartFile file) {
        try {
            customerExcelService.importFromExcel(file);
            return ResponseEntity.ok(Map.of("status", 200, "message", "업로드 성공"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("status", 400, "message", e.getMessage()));
        }
    }




}
