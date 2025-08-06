package com.suriname.request.controller;

import com.suriname.request.entity.Request;
import com.suriname.request.entity.RequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestRepository requestRepository;

    // A/S 접수 목록 조회 (배송 대기 상태만)
    @GetMapping
    public ResponseEntity<?> getRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        try {
            PageRequest pageable = PageRequest.of(page, size);
            Page<Request> requests;

            if ("WAITING_FOR_DELIVERY".equals(status)) {
                requests = requestRepository.findByStatus(Request.Status.WAITING_FOR_DELIVERY, pageable);
            } else {
                requests = requestRepository.findAll(pageable);
            }

            return ResponseEntity.ok(Map.of("status", 200, "data", requests));
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(Map.of("status", 400, "message", e.getMessage()));
        }
    }

    // A/S 접수 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<?> getRequestDetail(@PathVariable Long id) {
        try {
            Request request = requestRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("A/S 접수를 찾을 수 없습니다."));
            
            return ResponseEntity.ok(Map.of("status", 200, "data", request));
        } catch (Exception e) {
            return ResponseEntity.status(404)
                    .body(Map.of("status", 404, "message", e.getMessage()));
        }
    }
}