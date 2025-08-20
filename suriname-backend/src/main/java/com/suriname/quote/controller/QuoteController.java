package com.suriname.quote.controller;

import com.suriname.quote.dto.QuoteCreateDto;
import com.suriname.quote.dto.QuoteDto;
import com.suriname.quote.dto.QuotePageResponse;
import com.suriname.quote.service.QuoteService;
import com.suriname.request.dto.RequestSearchDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quotes")
public class QuoteController {

    private final QuoteService quoteService;
    
    public QuoteController(QuoteService quoteService) {
        this.quoteService = quoteService;
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
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String progressStatus,
            @RequestParam(required = false) String paymentStatus) {
    
        try {
            
            QuotePageResponse response = quoteService.getQuotesWithSearch(
                page, size, customerName, requestNo, productName, serialNumber, 
                isApproved, employeeName, startDate, endDate, progressStatus, paymentStatus);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new QuotePageResponse(
                java.util.Collections.emptyList(), 0, 0, page, size, true, true));
        }
    }

    // 검색
    @PostMapping("/search")
    public ResponseEntity<?> searchQuotes(@RequestBody RequestSearchDto dto, @RequestParam("page") int page,
                                            @RequestParam("size") int size) {
        Page<QuoteDto> result = quoteService.searchProducts(dto, PageRequest.of(page, size));
        return ResponseEntity.ok(Map.of("status", 200, "data", result));
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
            Long quoteId = quoteService.createQuote(dto);
            return ResponseEntity.ok(Map.of("status", 201, "data", Map.of("quoteId", quoteId)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("status", 400, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("status", 500, "message", "견적서 생성 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    // 견적서 수정
    @PostMapping("/update/{quoteId}")
    public ResponseEntity<Map<String, Object>> updateQuoteByPostMethod(@PathVariable Long quoteId, @RequestBody QuoteCreateDto dto) {
        try {
            
            Long updatedQuoteId = quoteService.updateQuote(quoteId, dto);
            return ResponseEntity.ok(Map.of("status", 200, "data", Map.of("quoteId", updatedQuoteId)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("status", 400, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("status", 500, "message", "견적서 수정 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    // 견적서 단건 조회
    @GetMapping("{quoteId}")
    public ResponseEntity<?> getQuote(@PathVariable Long quoteId){
            QuoteDto response = quoteService.getQuote(quoteId);
            return ResponseEntity.ok(response);
    }

}