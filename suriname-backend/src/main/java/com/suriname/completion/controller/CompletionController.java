package com.suriname.completion.controller;

import com.suriname.completion.dto.CompletionDetailDto;
import com.suriname.completion.dto.CompletionListDto;
import com.suriname.completion.dto.CompletionRegisterDto;
import com.suriname.completion.entity.Completion;
import com.suriname.completion.service.CompletionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/completion")
@RequiredArgsConstructor
public class CompletionController {

    private final CompletionService completionService;

    // 완료 처리 등록
    @PostMapping
    public ResponseEntity<?> registerCompletion(@RequestBody @Validated CompletionRegisterDto dto) {
        try {
            Map<String, Long> result = completionService.registerCompletion(dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("status", 201, "data", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", 400, "message", e.getMessage()));
        }
    }

    // 완료 목록 조회
    @GetMapping
    public ResponseEntity<?> getCompletionList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String type) {
        try {
            PageRequest pageable = PageRequest.of(page, size);
            Page<CompletionListDto> completions;

            if (type != null && !type.isEmpty()) {
                Completion.CompletionType completionType = Completion.CompletionType.valueOf(type.toUpperCase());
                completions = completionService.getCompletionsByType(completionType, pageable);
            } else {
                completions = completionService.getAllCompletions(pageable);
            }

            return ResponseEntity.ok(Map.of("status", 200, "data", completions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", 400, "message", e.getMessage()));
        }
    }

    // 완료 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<?> getCompletionDetail(@PathVariable("id") Long id) {
        try {
            CompletionDetailDto completion = completionService.getCompletionDetail(id);
            return ResponseEntity.ok(Map.of("status", 200, "data", completion));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("status", 404, "message", e.getMessage()));
        }
    }

    // 고객 수령 확인
    @PutMapping("/{id}/received")
    public ResponseEntity<?> confirmCustomerReceived(@PathVariable("id") Long id) {
        try {
            completionService.confirmCustomerReceived(id);
            return ResponseEntity.ok(Map.of("status", 200, "message", "고객 수령이 확인되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", 400, "message", e.getMessage()));
        }
    }

    // 만족도 조사 요청
    @PutMapping("/{id}/satisfaction")
    public ResponseEntity<?> requestSatisfactionSurvey(@PathVariable("id") Long id) {
        try {
            completionService.requestSatisfactionSurvey(id);
            return ResponseEntity.ok(Map.of("status", 200, "message", "만족도 조사가 요청되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", 400, "message", e.getMessage()));
        }
    }

    // 완료 메모 업데이트
    @PutMapping("/{id}/notes")
    public ResponseEntity<?> updateCompletionNotes(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> request) {
        try {
            String notes = request.get("notes");
            completionService.updateCompletionNotes(id, notes);
            return ResponseEntity.ok(Map.of("status", 200, "message", "완료 메모가 업데이트되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", 400, "message", e.getMessage()));
        }
    }

    // 미완료 건 조회
    @GetMapping("/incomplete")
    public ResponseEntity<?> getIncompleteItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            PageRequest pageable = PageRequest.of(page, size);
            Page<CompletionListDto> completions = completionService.getIncompleteItems(pageable);
            return ResponseEntity.ok(Map.of("status", 200, "data", completions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", 400, "message", e.getMessage()));
        }
    }
}

// 고객 공개용 완료 정보 조회 Controller
@RestController
@RequestMapping("/api/public/completion")
@RequiredArgsConstructor
class PublicCompletionController {

    private final CompletionService completionService;

    // 접수번호로 완료 정보 조회 (고객용)
    @GetMapping("/{requestNo}")
    public ResponseEntity<?> getCompletionByRequestNo(@PathVariable("requestNo") String requestNo) {
        try {
            CompletionDetailDto completion = completionService.getCompletionByRequestNo(requestNo);
            return ResponseEntity.ok(Map.of("status", 200, "data", completion));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("status", 404, "message", e.getMessage()));
        }
    }
}