package com.suriname.quote.controller;

import com.suriname.quote.dto.QuoteCreateDto;
import com.suriname.quote.dto.QuotePageResponse;
import com.suriname.quote.service.QuoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quotes")
public class QuoteController {

    private final QuoteService quoteService;
    
    // Constructor에서 로그 출력
    public QuoteController(QuoteService quoteService) {
        this.quoteService = quoteService;
        System.out.println("QuoteController initialized successfully!");
    }

    @GetMapping
    public ResponseEntity<QuotePageResponse> getQuotes(
    	    @RequestParam(name = "page", defaultValue = "0") int page,
    	    @RequestParam(name = "size", defaultValue = "10") int size,
    	    @RequestParam(name = "customerName", required = false) String customerName,
    	    @RequestParam(name = "requestNo", required = false) String requestNo,
    	    @RequestParam(name = "productName", required = false) String productName,
    	    @RequestParam(name = "serialNumber", required = false) String serialNumber,
    	    @RequestParam(name = "isApproved", required = false) String isApproved,
    	    @RequestParam(name = "employeeName", required = false) String employeeName,
    	    @RequestParam(name = "startDate", required = false) String startDate,
    	    @RequestParam(name = "endDate", required = false) String endDate
    	) {
        
        try {
            System.out.println("Quote API called with params: page=" + page + ", size=" + size + 
                             ", customerName=" + customerName + ", requestNo=" + requestNo + 
                             ", productName=" + productName + ", serialNumber=" + serialNumber + 
                             ", isApproved=" + isApproved + ", employeeName=" + employeeName + 
                             ", startDate=" + startDate + ", endDate=" + endDate);
            
            QuotePageResponse response = quoteService.getQuotesWithSearch(
                page, size, customerName, requestNo, productName, serialNumber, 
                isApproved, employeeName, startDate, endDate);
            
            System.out.println("Quote API response: " + response.getTotalElements() + " elements found");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error in getQuotes controller: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new QuotePageResponse(
                java.util.Collections.emptyList(), 0, 0, page, size, true, true));
        }
    }

    @DeleteMapping("/{quoteId}")
    public ResponseEntity<Void> deleteQuote(@PathVariable Long quoteId) {
        quoteService.deleteQuote(quoteId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteQuotes(@RequestBody List<Long> quoteIds) {
        quoteService.deleteQuotes(quoteIds);
        return ResponseEntity.ok().build();
    }
    
    // 견적서 생성
    @PostMapping
    public ResponseEntity<Map<String, Object>> createQuote(@RequestBody QuoteCreateDto dto) {
        try {
            System.out.println("=== 견적서 생성 요청 수신 ===");
            System.out.println("DTO: " + dto.toString());
            System.out.println("고객명: " + dto.getCustomerName());
            System.out.println("접수번호: " + dto.getRequestNo());
            System.out.println("수리기사: " + dto.getEngineerName());
            System.out.println("고객동의: " + dto.getCustomerConsent());
            System.out.println("예상비용: " + dto.getEstimatedCost());
            System.out.println("실제비용: " + dto.getActualCost());
            System.out.println("수리항목 수: " + (dto.getRepairItems() != null ? dto.getRepairItems().size() : "null"));
            
            Long quoteId = quoteService.createQuote(dto);
            return ResponseEntity.ok(Map.of("status", 201, "data", Map.of("quoteId", quoteId)));
        } catch (IllegalArgumentException e) {
            System.err.println("견적서 생성 검증 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("status", 400, "message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("견적서 생성 서버 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("status", 500, "message", "견적서 생성 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    // 견적서 수정 (PUT)
    @PutMapping("/{quoteId}")
    public ResponseEntity<Map<String, Object>> updateQuote(@PathVariable Long quoteId, @RequestBody QuoteCreateDto dto) {
        try {
            System.out.println("=== 견적서 수정 요청 수신 (PUT) ===");
            System.out.println("견적서 ID: " + quoteId);
            System.out.println("DTO: " + dto.toString());
            
            Long updatedQuoteId = quoteService.updateQuote(quoteId, dto);
            return ResponseEntity.ok(Map.of("status", 200, "data", Map.of("quoteId", updatedQuoteId)));
        } catch (IllegalArgumentException e) {
            System.err.println("견적서 수정 검증 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("status", 400, "message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("견적서 수정 서버 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("status", 500, "message", "견적서 수정 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    // 견적서 수정 (PATCH) - PUT이 지원되지 않는 경우를 위한 폴백
    @PatchMapping("/{quoteId}")
    public ResponseEntity<Map<String, Object>> updateQuoteByPatch(@PathVariable Long quoteId, @RequestBody QuoteCreateDto dto) {
        try {
            System.out.println("=== 견적서 수정 요청 수신 (PATCH 폴백) ===");
            System.out.println("견적서 ID: " + quoteId);
            System.out.println("DTO: " + dto.toString());
            
            Long updatedQuoteId = quoteService.updateQuote(quoteId, dto);
            return ResponseEntity.ok(Map.of("status", 200, "data", Map.of("quoteId", updatedQuoteId)));
        } catch (IllegalArgumentException e) {
            System.err.println("견적서 수정 검증 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("status", 400, "message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("견적서 수정 서버 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("status", 500, "message", "견적서 수정 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    // 견적서 수정 (POST 기반) - HTTP 메서드 제한 환경용
    @PostMapping("/update/{quoteId}")
    public ResponseEntity<Map<String, Object>> updateQuoteByPostMethod(@PathVariable Long quoteId, @RequestBody QuoteCreateDto dto) {
        try {
            System.out.println("=== 견적서 수정 요청 수신 (POST 기반) ===");
            System.out.println("견적서 ID: " + quoteId);
            System.out.println("DTO: " + dto.toString());
            
            Long updatedQuoteId = quoteService.updateQuote(quoteId, dto);
            return ResponseEntity.ok(Map.of("status", 200, "data", Map.of("quoteId", updatedQuoteId)));
        } catch (IllegalArgumentException e) {
            System.err.println("견적서 수정 검증 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("status", 400, "message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("견적서 수정 서버 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("status", 500, "message", "견적서 수정 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    // 테스트용 API - MySQL 테이블 직접 쿼리
    @GetMapping("/test")
    public ResponseEntity<String> testDatabaseConnection() {
        try {
            long count = quoteService.getQuoteCount();
            return ResponseEntity.ok("Quote table has " + count + " records");
        } catch (Exception e) {
            return ResponseEntity.ok("Error: " + e.getMessage());
        }
    }
}