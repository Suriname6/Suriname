package com.suriname.quote.controller;

import com.suriname.quote.dto.QuotePageResponse;
import com.suriname.quote.service.QuoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String requestNo,
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) String serialNumber,
            @RequestParam(required = false) String isApproved,
            @RequestParam(required = false) String employeeName,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
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