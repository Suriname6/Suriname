package com.suriname.satisfaction.controller;

import com.suriname.satisfaction.dto.SatisfactionDetailDto;
import com.suriname.satisfaction.dto.SatisfactionListDto;
import com.suriname.satisfaction.dto.SatisfactionSurveyDto;
import com.suriname.satisfaction.service.SatisfactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/satisfaction")
@RequiredArgsConstructor
public class SatisfactionController {

    private final SatisfactionService satisfactionService;

    // 만족도 조사 제출
    @PostMapping
    public ResponseEntity<?> submitSatisfactionSurvey(
            @RequestBody @Validated SatisfactionSurveyDto dto,
            HttpServletRequest request) {
        try {
            // IP 주소 설정
            dto.setIpAddress(getClientIpAddress(request));
            
            Map<String, Long> result = satisfactionService.submitSatisfactionSurvey(dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("status", 201, "data", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", 400, "message", e.getMessage()));
        }
    }

    // 만족도 목록 조회
    @GetMapping
    public ResponseEntity<?> getSatisfactionList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String filter) {
        try {
            PageRequest pageable = PageRequest.of(page, size);
            Page<SatisfactionListDto> satisfactions;

            switch (filter != null ? filter.toLowerCase() : "") {
                case "high":
                    satisfactions = satisfactionService.getHighSatisfactionCustomers(pageable);
                    break;
                case "low":
                    satisfactions = satisfactionService.getLowSatisfactionCustomers(pageable);
                    break;
                default:
                    satisfactions = satisfactionService.getAllSatisfactions(pageable);
                    break;
            }

            return ResponseEntity.ok(Map.of("status", 200, "data", satisfactions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", 400, "message", e.getMessage()));
        }
    }

    // 만족도 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<?> getSatisfactionDetail(@PathVariable("id") Long id) {
        try {
            SatisfactionDetailDto satisfaction = satisfactionService.getSatisfactionDetail(id);
            return ResponseEntity.ok(Map.of("status", 200, "data", satisfaction));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("status", 404, "message", e.getMessage()));
        }
    }

    // 만족도 통계 조회
    @GetMapping("/statistics")
    public ResponseEntity<?> getSatisfactionStatistics(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            Map<String, Object> statistics;
            
            if (startDate != null && endDate != null) {
                LocalDateTime start = LocalDateTime.parse(startDate + "T00:00:00");
                LocalDateTime end = LocalDateTime.parse(endDate + "T23:59:59");
                statistics = satisfactionService.getSatisfactionStatisticsByDateRange(start, end);
            } else {
                statistics = satisfactionService.getSatisfactionStatistics();
            }

            return ResponseEntity.ok(Map.of("status", 200, "data", statistics));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", 400, "message", e.getMessage()));
        }
    }

    // 월별 만족도 통계
    @GetMapping("/statistics/monthly")
    public ResponseEntity<?> getMonthlySatisfactionStats(
            @RequestParam(defaultValue = "12") int months) {
        try {
            Object[] monthlyStats = satisfactionService.getMonthlySatisfactionStats(months);
            return ResponseEntity.ok(Map.of("status", 200, "data", monthlyStats));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", 400, "message", e.getMessage()));
        }
    }

    // 고만족 고객 조회
    @GetMapping("/high-satisfaction")
    public ResponseEntity<?> getHighSatisfactionCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            PageRequest pageable = PageRequest.of(page, size);
            Page<SatisfactionListDto> satisfactions = satisfactionService.getHighSatisfactionCustomers(pageable);
            return ResponseEntity.ok(Map.of("status", 200, "data", satisfactions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", 400, "message", e.getMessage()));
        }
    }

    // 저만족 고객 조회
    @GetMapping("/low-satisfaction")
    public ResponseEntity<?> getLowSatisfactionCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            PageRequest pageable = PageRequest.of(page, size);
            Page<SatisfactionListDto> satisfactions = satisfactionService.getLowSatisfactionCustomers(pageable);
            return ResponseEntity.ok(Map.of("status", 200, "data", satisfactions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", 400, "message", e.getMessage()));
        }
    }

    /**
     * 클라이언트 IP 주소 추출
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}

// 고객 공개용 만족도 조회 Controller
@RestController
@RequestMapping("/api/public/satisfaction")
@RequiredArgsConstructor
class PublicSatisfactionController {

    private final SatisfactionService satisfactionService;

    // 접수번호로 만족도 조회 (고객용)
    @GetMapping("/{requestNo}")
    public ResponseEntity<?> getSatisfactionByRequestNo(@PathVariable("requestNo") String requestNo) {
        try {
            SatisfactionDetailDto satisfaction = satisfactionService.getSatisfactionByRequestNo(requestNo);
            return ResponseEntity.ok(Map.of("status", 200, "data", satisfaction));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("status", 404, "message", e.getMessage()));
        }
    }

    // 공개용 만족도 조사 제출
    @PostMapping("/survey")
    public ResponseEntity<?> submitPublicSatisfactionSurvey(
            @RequestBody @Validated SatisfactionSurveyDto dto,
            HttpServletRequest request) {
        try {
            // IP 주소 설정
            dto.setIpAddress(getClientIpAddress(request));
            
            Map<String, Long> result = satisfactionService.submitSatisfactionSurvey(dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("status", 201, "data", result, "message", "만족도 조사가 제출되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", 400, "message", e.getMessage()));
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}