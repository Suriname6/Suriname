package com.suriname.quote.service;

import com.suriname.quote.dto.QuoteDto;
import com.suriname.quote.dto.QuotePageResponse;
import com.suriname.quote.entity.Quote;
import com.suriname.quote.repository.QuoteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuoteService {
    private final QuoteRepository quoteRepository;
    
    public QuoteService(QuoteRepository quoteRepository) {
        this.quoteRepository = quoteRepository;
        System.out.println("QuoteService initialized successfully!");
    }

    public List<Quote> getAllQuotes() {
        return quoteRepository.findAll();
    }
    
    public long getQuoteCount() {
        return quoteRepository.count();
    }

    @Transactional(readOnly = true)
    public QuotePageResponse getQuotesWithSearch(int page, int size, String customerName, 
            String requestNo, String productName, String serialNumber, String isApproved, 
            String employeeName, String startDate, String endDate) {
        
        try {
            System.out.println("=== QuoteService.getQuotesWithSearch ===");
            System.out.println("Request params: page=" + page + ", size=" + size);
            
            Pageable pageable = PageRequest.of(page, size, Sort.by("quoteId").descending());
            Page<Quote> quotePage;
            
            // 먼저 전체 Quote 개수 확인
            long totalQuotes = quoteRepository.count();
            System.out.println("Total quotes in database: " + totalQuotes);
            
            if (hasSearchCriteria(customerName, requestNo, productName, serialNumber, isApproved, employeeName, startDate, endDate)) {
                System.out.println("Using filtered search");
                quotePage = quoteRepository.findWithFilters(customerName, requestNo, productName, 
                        serialNumber, parseApprovalStatus(isApproved), employeeName, 
                        parseDate(startDate), parseDate(endDate), pageable);
            } else {
                System.out.println("Using findAll (no filters)");
                quotePage = quoteRepository.findAll(pageable);
            }
            
            System.out.println("Found " + quotePage.getContent().size() + " quotes in current page");
            System.out.println("Total elements: " + quotePage.getTotalElements());
            
            List<QuoteDto> quoteDtos = quotePage.getContent().stream()
                    .map(quote -> {
                        try {
                            return new QuoteDto(quote);
                        } catch (Exception e) {
                            System.err.println("Failed to convert quote to DTO: " + quote.getQuoteId() + ", Error: " + e.getMessage());
                            e.printStackTrace();
                            return null;
                        }
                    })
                    .filter(dto -> dto != null)
                    .collect(Collectors.toList());
            
            return new QuotePageResponse(
                    quoteDtos,
                    quotePage.getTotalPages(),
                    quotePage.getTotalElements(),
                    quotePage.getNumber(),
                    quotePage.getSize(),
                    quotePage.isFirst(),
                    quotePage.isLast()
            );
        } catch (Exception e) {
            System.err.println("Error in getQuotesWithSearch: " + e.getMessage());
            e.printStackTrace();
            
            return new QuotePageResponse(
                    java.util.Collections.emptyList(),
                    0, 0, page, size, true, true
            );
        }
    }
    
    @Transactional
    public void deleteQuote(Long quoteId) {
        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new IllegalArgumentException("해당 견적이 존재하지 않습니다."));
        quoteRepository.delete(quote);
    }
    
    @Transactional
    public void deleteQuotes(List<Long> quoteIds) {
        List<Quote> quotes = quoteRepository.findAllById(quoteIds);
        quoteRepository.deleteAll(quotes);
    }
    
    private boolean hasSearchCriteria(String customerName, String requestNo, String productName, 
            String serialNumber, String isApproved, String employeeName, String startDate, String endDate) {
        return (customerName != null && !customerName.trim().isEmpty()) ||
               (requestNo != null && !requestNo.trim().isEmpty()) ||
               (productName != null && !productName.trim().isEmpty()) ||
               (serialNumber != null && !serialNumber.trim().isEmpty()) ||
               (isApproved != null && !isApproved.trim().isEmpty()) ||
               (employeeName != null && !employeeName.trim().isEmpty()) ||
               (startDate != null && !startDate.trim().isEmpty()) ||
               (endDate != null && !endDate.trim().isEmpty());
    }
    
    private LocalDateTime parseDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return null;
        }
        try {
            return LocalDateTime.parse(dateStr + "T00:00:00", DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (Exception e) {
            return null;
        }
    }
    
    private Boolean parseApprovalStatus(String isApprovedStr) {
        if (isApprovedStr == null || isApprovedStr.trim().isEmpty()) {
            return null;
        }
        try {
            if ("승인".equals(isApprovedStr)) return true;
            if ("미승인".equals(isApprovedStr)) return false;
            return Boolean.parseBoolean(isApprovedStr);
        } catch (Exception e) {
            return null;
        }
    }
}