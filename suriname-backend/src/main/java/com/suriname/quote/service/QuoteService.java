package com.suriname.quote.service;

import com.suriname.customer.entity.Customer;
import com.suriname.customer.repository.CustomerRepository;
import com.suriname.employee.entity.Employee;
import com.suriname.employee.repository.EmployeeRepository;
import com.suriname.quote.dto.QuoteCreateDto;
import com.suriname.quote.dto.QuoteDto;
import com.suriname.quote.dto.QuotePageResponse;
import com.suriname.quote.entity.Quote;
import com.suriname.quote.repository.QuoteRepository;
import com.suriname.request.entity.Request;
import com.suriname.request.repository.RequestRepository;
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
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final RequestRepository requestRepository;
    
    public QuoteService(QuoteRepository quoteRepository, CustomerRepository customerRepository, 
                        EmployeeRepository employeeRepository, RequestRepository requestRepository) {
        this.quoteRepository = quoteRepository;
        this.customerRepository = customerRepository;
        this.employeeRepository = employeeRepository;
        this.requestRepository = requestRepository;
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
            String employeeName, String startDate, String endDate, String progressStatus, String paymentStatus) {
        
        try {
            System.out.println("=== QuoteService.getQuotesWithSearch ===");
            System.out.println("Request params: page=" + page + ", size=" + size);
            
            Pageable pageable = PageRequest.of(page, size, Sort.by("quoteId").descending());
            Page<Quote> quotePage;
            
            // 먼저 전체 Quote 개수 확인
            long totalQuotes = quoteRepository.count();
            System.out.println("Total quotes in database: " + totalQuotes);
            
            if (hasSearchCriteria(customerName, requestNo, productName, serialNumber, isApproved, employeeName, startDate, endDate, progressStatus, paymentStatus)) {
                System.out.println("Using filtered search with progressStatus: " + progressStatus + ", paymentStatus: " + paymentStatus);
                quotePage = quoteRepository.findWithFilters(customerName, requestNo, productName, 
                        serialNumber, parseApprovalStatus(isApproved), employeeName, 
                        parseDate(startDate), parseDate(endDate), pageable);
                
                // 진행상태 필터링 (메모리에서 처리)
                if (progressStatus != null && !progressStatus.trim().isEmpty()) {
                    quotePage = filterByProgressStatus(quotePage, progressStatus, pageable);
                }
                
                // 입금상태 필터링 (메모리에서 처리)
                if (paymentStatus != null && !paymentStatus.trim().isEmpty()) {
                    System.out.println("입금상태 필터링 시작 - paymentStatus: " + paymentStatus);
                    System.out.println("필터링 전 Quote 개수: " + quotePage.getContent().size());
                    quotePage = filterByPaymentStatus(quotePage, paymentStatus, pageable);
                    System.out.println("필터링 후 Quote 개수: " + quotePage.getContent().size());
                }
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
    
    // 견적서 생성
    @Transactional
    public Long createQuote(QuoteCreateDto dto) {
        System.out.println("=== 견적서 생성 시작 ===");
        System.out.println("고객명: " + dto.getCustomerName());
        System.out.println("접수번호: " + dto.getRequestNo());
        System.out.println("고객동의: " + dto.getCustomerConsent());
        System.out.println("수리기사: " + dto.getEngineerName());
        System.out.println("수리기사ID: " + dto.getEngineerId());
        
        // 고객 검증
        Customer customer = customerRepository.findByName(dto.getCustomerName())
            .orElseThrow(() -> new IllegalArgumentException("등록되지 않은 고객입니다: " + dto.getCustomerName()));
        System.out.println("고객 검증 완료: " + customer.getName());
            
        // 접수번호 검증
        Request request = requestRepository.findByRequestNo(dto.getRequestNo())
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 접수번호입니다: " + dto.getRequestNo()));
        System.out.println("접수번호 검증 완료: " + request.getRequestNo());
            
        // 수리기사 처리 (고객 동의 시)
        Employee engineer = null;
        if (Boolean.TRUE.equals(dto.getCustomerConsent())) {
            if (dto.getEngineerId() != null) {
                engineer = employeeRepository.findById(dto.getEngineerId())
                        .orElseThrow(() -> new IllegalArgumentException("수리기사를 찾을 수 없습니다. id=" + dto.getEngineerId()));
                System.out.println("지정된 수리기사(id): " + engineer.getEmployeeId());
            } else {
                Pageable engineerPageable = PageRequest.of(0, 100);
                List<Employee> engineers = employeeRepository
                        .findByRole(Employee.Role.ENGINEER, engineerPageable)
                        .getContent();
                if (engineers.isEmpty()) throw new IllegalArgumentException("배정 가능한 수리기사가 없습니다.");
                engineer = engineers.get((int) (Math.random() * engineers.size()));
                System.out.println("랜덤 배정된 수리기사(id): " + engineer.getEmployeeId());
            }
        }

        // 수리 항목들을 JSON 형태로 field에 저장하기 위한 문자열 생성
        StringBuilder fieldContent = new StringBuilder();
        fieldContent.append("제품명: ").append(dto.getProductName()).append("\n");
        fieldContent.append("고객동의: ").append(dto.getCustomerConsent() ? "동의" : "미동의").append("\n");
        fieldContent.append("예상견적: ").append(dto.getEstimatedCost()).append("원\n");
        fieldContent.append("실제비용: ").append(dto.getActualCost()).append("원\n");
        fieldContent.append("상태변경: ").append(dto.getStatusChange()).append("\n");
        fieldContent.append("수리항목:\n");
        
        if (dto.getRepairItems() != null) {
            for (QuoteCreateDto.RepairItemDto item : dto.getRepairItems()) {
                fieldContent.append("- ").append(item.getItemName())
                    .append(": ").append(item.getDescription())
                    .append(" (").append(item.getCost()).append("원)\n");
            }
        }
        
        // Quote 엔티티 생성 (기존 구조에 맞춰서)
        Quote quote = Quote.builder()
            .request(request)
            .cost(dto.getActualCost()) // 실제 수리비용을 cost 필드에 저장
            .field(fieldContent.toString()) // 모든 추가 정보를 field에 저장
            .build();
            
        Quote savedQuote = quoteRepository.save(quote);
        
        // 고객 동의 시 수리기사 승인 처리
        if (Boolean.TRUE.equals(dto.getCustomerConsent()) && engineer != null) {
            savedQuote.approveByEmployee(engineer);
            quoteRepository.save(savedQuote);
        }
        
        // Request 상태 업데이트
        updateRequestStatus(request, dto.getStatusChange());
        
        // 직접 입력한 수리항목 자동 저장 기능 제거됨
        
        return savedQuote.getQuoteId();
    }
    
    // 견적서 수정
    @Transactional
    public Long updateQuote(Long quoteId, QuoteCreateDto dto) {
        System.out.println("=== 견적서 수정 시작 ===");
        System.out.println("견적서 ID: " + quoteId);
        System.out.println("고객명: " + dto.getCustomerName());
        System.out.println("접수번호: " + dto.getRequestNo());
        System.out.println("고객동의: " + dto.getCustomerConsent());
        System.out.println("수리기사: " + dto.getEngineerName());
        System.out.println("수리기사ID: " + dto.getEngineerId());
        
        // 기존 견적서 조회
        Quote existingQuote = quoteRepository.findById(quoteId)
            .orElseThrow(() -> new IllegalArgumentException("견적서를 찾을 수 없습니다: " + quoteId));
        System.out.println("기존 견적서 검증 완료: " + existingQuote.getQuoteId());
        
        // 고객 검증
        Customer customer = customerRepository.findByName(dto.getCustomerName())
            .orElseThrow(() -> new IllegalArgumentException("등록되지 않은 고객입니다: " + dto.getCustomerName()));
        System.out.println("고객 검증 완료: " + customer.getName());
            
        // 접수번호 검증
        Request request = requestRepository.findByRequestNo(dto.getRequestNo())
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 접수번호입니다: " + dto.getRequestNo()));
        System.out.println("접수번호 검증 완료: " + request.getRequestNo());
            
        // 수리기사 처리 (고객 동의 시)
        Employee engineer = null;
        if (Boolean.TRUE.equals(dto.getCustomerConsent())) {
            if (dto.getEngineerId() != null) {
                engineer = employeeRepository.findById(dto.getEngineerId())
                        .orElseThrow(() -> new IllegalArgumentException("수리기사를 찾을 수 없습니다. id=" + dto.getEngineerId()));
                System.out.println("지정된 수리기사(id): " + engineer.getEmployeeId());
            } else {
                Pageable engineerPageable = PageRequest.of(0, 100);
                List<Employee> engineers = employeeRepository.findByRole(Employee.Role.ENGINEER, engineerPageable).getContent();
                if (engineers.isEmpty()) throw new IllegalArgumentException("배정 가능한 수리기사가 없습니다.");
                engineer = engineers.get((int) (Math.random() * engineers.size()));
                System.out.println("랜덤 배정된 수리기사(id): " + engineer.getEmployeeId());
            }
        }


        // 수리 항목들을 JSON 형태로 field에 저장하기 위한 문자열 생성
        StringBuilder fieldContent = new StringBuilder();
        fieldContent.append("제품명: ").append(dto.getProductName()).append("\n");
        fieldContent.append("고객동의: ").append(dto.getCustomerConsent() ? "동의" : "미동의").append("\n");
        fieldContent.append("예상견적: ").append(dto.getEstimatedCost()).append("원\n");
        fieldContent.append("실제비용: ").append(dto.getActualCost()).append("원\n");
        fieldContent.append("상태변경: ").append(dto.getStatusChange()).append("\n");
        fieldContent.append("수리항목:\n");
        
        if (dto.getRepairItems() != null) {
            for (QuoteCreateDto.RepairItemDto item : dto.getRepairItems()) {
                fieldContent.append("- ").append(item.getItemName())
                    .append(": ").append(item.getDescription())
                    .append(" (").append(item.getCost()).append("원)\n");
            }
        }
        
        // Quote 엔티티 수정
        existingQuote.updateQuote(dto.getActualCost(), fieldContent.toString(), engineer);
        
        Quote savedQuote = quoteRepository.save(existingQuote);
        
        // Request 상태 업데이트
        updateRequestStatus(request, dto.getStatusChange());
        
        return savedQuote.getQuoteId();
    }
    
    // Request 상태 업데이트 메서드
    private void updateRequestStatus(Request request, String statusChange) {
        if (statusChange == null) return;
        
        Request.Status newStatus;
        switch (statusChange) {
            case "IN_PROGRESS":
                newStatus = Request.Status.REPAIRING;
                break;
            case "AWAITING_PAYMENT":
                newStatus = Request.Status.WAITING_FOR_PAYMENT;
                break;
            case "READY_FOR_DELIVERY":
                newStatus = Request.Status.WAITING_FOR_DELIVERY;
                break;
            case "COMPLETED":
                newStatus = Request.Status.COMPLETED;
                break;
            default:
                return; // 알 수 없는 상태는 업데이트하지 않음
        }
        
        request.changeStatus(newStatus);
        requestRepository.save(request);
        System.out.println("Request 상태 업데이트: " + request.getRequestNo() + " -> " + newStatus);
    }
    
    // 진행상태 필터링
    private Page<Quote> filterByProgressStatus(Page<Quote> quotePage, String progressStatus, Pageable pageable) {
        // 콤마로 구분된 여러 상태 처리 (예: "READY_FOR_DELIVERY,COMPLETED")
        String[] statusArray = progressStatus.contains(",") ? progressStatus.split(",") : new String[]{progressStatus};
        
        List<Quote> filteredQuotes = quotePage.getContent().stream()
                .filter(quote -> {
                    if (quote.getRequest() == null || quote.getRequest().getStatus() == null) {
                        return false;
                    }
                    
                    String requestStatus = mapRequestStatusToProgressStatus(quote.getRequest().getStatus());
                    
                    // 여러 상태 중 하나라도 일치하면 포함
                    for (String status : statusArray) {
                        if (status.trim().equals(requestStatus)) {
                            return true;
                        }
                    }
                    return false;
                })
                .collect(java.util.stream.Collectors.toList());
        
        return new org.springframework.data.domain.PageImpl<>(
                filteredQuotes, pageable, filteredQuotes.size());
    }
    
    // 입금상태 필터링  
    private Page<Quote> filterByPaymentStatus(Page<Quote> quotePage, String paymentStatus, Pageable pageable) {
        System.out.println("=== filterByPaymentStatus 호출됨 ===");
        System.out.println("필터링할 paymentStatus: " + paymentStatus);
        System.out.println("전체 Quote 개수: " + quotePage.getContent().size());
        
        List<Quote> filteredQuotes = quotePage.getContent().stream()
                .filter(quote -> {
                    String currentPaymentStatus = determinePaymentStatus(quote);
                    boolean matches = paymentStatus.equals(currentPaymentStatus);
                    System.out.println("Quote " + quote.getRequest().getRequestNo() + 
                                     " - currentStatus: " + currentPaymentStatus + 
                                     ", filterStatus: " + paymentStatus + 
                                     ", matches: " + matches);
                    return matches;
                })
                .collect(java.util.stream.Collectors.toList());
        
        System.out.println("필터링 결과: " + filteredQuotes.size() + "개");
        return new org.springframework.data.domain.PageImpl<>(
                filteredQuotes, pageable, filteredQuotes.size());
    }
    
    // Request 상태를 진행상태로 매핑
    private String mapRequestStatusToProgressStatus(com.suriname.request.entity.Request.Status status) {
        switch (status) {
            case RECEIVED -> { return "RECEIVED"; }
            case REPAIRING -> { return "IN_PROGRESS"; }
            case WAITING_FOR_PAYMENT -> { return "AWAITING_PAYMENT"; }
            case WAITING_FOR_DELIVERY -> { return "READY_FOR_DELIVERY"; }
            case COMPLETED -> { return "COMPLETED"; }
            default -> { return "IN_PROGRESS"; }
        }
    }
    
    // Quote를 기반으로 입금상태 결정
    private String determinePaymentStatus(Quote quote) {
        if (quote.getRequest() == null) {
            return "AWAITING_PAYMENT";
        }
        
        com.suriname.request.entity.Request.Status status = quote.getRequest().getStatus();
        System.out.println("determinePaymentStatus - RequestNo: " + quote.getRequest().getRequestNo() + 
                          ", Status: " + status + ", PaymentsSize: " + 
                          (quote.getRequest().getPayments() != null ? quote.getRequest().getPayments().size() : "null"));
        
        if (status == com.suriname.request.entity.Request.Status.WAITING_FOR_DELIVERY || 
            status == com.suriname.request.entity.Request.Status.COMPLETED) {
            System.out.println("Returning COMPLETED for " + quote.getRequest().getRequestNo());
            return "COMPLETED";
        } else if (status == com.suriname.request.entity.Request.Status.WAITING_FOR_PAYMENT) {
            // 입금대기 상태에서 가상계좌가 발급된 경우 구분
            if (quote.getRequest().getPayments() != null && !quote.getRequest().getPayments().isEmpty()) {
                // Payment가 존재하고 PENDING 상태면 가상계좌가 발급된 것으로 간주
                boolean hasValidPayment = quote.getRequest().getPayments().stream()
                    .anyMatch(payment -> payment.getStatus() != null && 
                             payment.getStatus() == com.suriname.payment.Payment.Status.PENDING);
                System.out.println("HasValidPayment (PENDING): " + hasValidPayment + " for " + quote.getRequest().getRequestNo());
                if (hasValidPayment) {
                    System.out.println("Returning VIRTUAL_ACCOUNT_ISSUED for " + quote.getRequest().getRequestNo());
                    return "VIRTUAL_ACCOUNT_ISSUED";
                }
            }
            System.out.println("Returning AWAITING_PAYMENT for " + quote.getRequest().getRequestNo());
            return "AWAITING_PAYMENT";
        } else {
            System.out.println("Returning AWAITING_PAYMENT (default) for " + quote.getRequest().getRequestNo());
            return "AWAITING_PAYMENT";
        }
    }
    
    private boolean hasSearchCriteria(String customerName, String requestNo, String productName, 
            String serialNumber, String isApproved, String employeeName, String startDate, String endDate,
            String progressStatus, String paymentStatus) {
        return (customerName != null && !customerName.trim().isEmpty()) ||
               (requestNo != null && !requestNo.trim().isEmpty()) ||
               (productName != null && !productName.trim().isEmpty()) ||
               (serialNumber != null && !serialNumber.trim().isEmpty()) ||
               (isApproved != null && !isApproved.trim().isEmpty()) ||
               (employeeName != null && !employeeName.trim().isEmpty()) ||
               (startDate != null && !startDate.trim().isEmpty()) ||
               (endDate != null && !endDate.trim().isEmpty()) ||
               (progressStatus != null && !progressStatus.trim().isEmpty()) ||
               (paymentStatus != null && !paymentStatus.trim().isEmpty());
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