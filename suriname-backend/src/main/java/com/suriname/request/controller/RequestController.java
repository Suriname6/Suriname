package com.suriname.request.controller;

import com.suriname.request.repository.RequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestRepository requestRepository;

    @GetMapping("/validate/requestno/{requestNo}")
    public ResponseEntity<Boolean> validateRequestNo(@PathVariable String requestNo) {
        boolean exists = requestRepository.findByRequestNo(requestNo).isPresent();
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/requestid/{requestNo}")
    public ResponseEntity<java.util.Map<String, Object>> getRequestIdByRequestNo(@PathVariable String requestNo) {
        try {
            var request = requestRepository.findByRequestNo(requestNo);
            if (request.isPresent()) {
                return ResponseEntity.ok(java.util.Map.of(
                    "status", 200,
                    "data", java.util.Map.of("requestId", request.get().getRequestId())
                ));
            } else {
                return ResponseEntity.badRequest().body(java.util.Map.of(
                    "status", 404,
                    "message", "해당 접수번호의 수리 요청을 찾을 수 없습니다."
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                "status", 500,
                "message", "Request ID 조회 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/list")
    public ResponseEntity<java.util.Map<String, Object>> getRequestList() {
        try {
            var requests = requestRepository.findAll();
            var requestList = requests.stream().map(request -> 
                java.util.Map.of(
                    "requestId", request.getRequestId(),
                    "requestNo", request.getRequestNo(),
                    "status", request.getStatus(),
                    "createdAt", request.getCreatedAt()
                )
            ).limit(10).toList(); // 최대 10개만 조회
            
            return ResponseEntity.ok(java.util.Map.of(
                "status", 200,
                "data", requestList,
                "total", requests.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                "status", 500,
                "message", "Request 목록 조회 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
}