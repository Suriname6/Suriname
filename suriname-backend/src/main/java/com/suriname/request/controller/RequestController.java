package com.suriname.request.controller;

import com.suriname.global.security.principal.EmployeeDetails;
import com.suriname.request.dto.*;
import com.suriname.request.repository.RequestRepository;
import com.suriname.request.service.RequestAssignmentLogService;
import com.suriname.request.service.RequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestRepository requestRepository;
    private final RequestService requestService;
    private final RequestAssignmentLogService requestAssignmentLogService;

    // AS 요청 생성
    @PostMapping
    public ResponseEntity<?> createReq(@RequestBody RequestCreateRequestDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        EmployeeDetails employeeDetails = (EmployeeDetails) authentication.getPrincipal();
        Long receiverId = employeeDetails.getEmployee().getEmployeeId();
        RequestCreateResponseDto response = requestService.createRequest(receiverId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // AS 요청 리스트 조회
    @GetMapping
    public ResponseEntity<?> getReqList(@ModelAttribute RequestSearchCondition condition, @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        EmployeeDetails employeeDetails = (EmployeeDetails) authentication.getPrincipal();

        Long viewerId = employeeDetails.getEmployee().getEmployeeId();
        String role = employeeDetails.getEmployee().getRole().name();

        Page<RequestListResponseDto> response = requestService.getRequestList(condition, pageable, viewerId, role);
        return ResponseEntity.ok(response);
    }

    // AS 요청 단건 조회
    @GetMapping("/{requestId}")
    public ResponseEntity<?> getReqDetail(@PathVariable Long requestId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        EmployeeDetails employeeDetails = (EmployeeDetails) authentication.getPrincipal();

        Long viewerId = employeeDetails.getEmployee().getEmployeeId();
        String role = employeeDetails.getEmployee().getRole().name();

        RequestDetailResponseDto response = requestService.getRequestDetail(requestId, viewerId, role);
        return ResponseEntity.ok(response);
    }

    // AS 요청 수정
    @PatchMapping("/{requestId}")
    public ResponseEntity<?> updateReq(@PathVariable Long requestId, @RequestBody RequestUpdateDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        EmployeeDetails employeeDetails = (EmployeeDetails) authentication.getPrincipal();

        Long viewerId = employeeDetails.getEmployee().getEmployeeId();
        String role = employeeDetails.getEmployee().getRole().name();

        RequestCreateResponseDto response = requestService.updateRequest(requestId, dto, viewerId, role);
        return ResponseEntity.ok(response);
    }

    // AS 요청 단건 삭제
    @DeleteMapping("/{requestId}")
    public ResponseEntity<?> deleteReq(@PathVariable Long requestId) {
        requestService.deleteRequest(requestId);
        return ResponseEntity.noContent().build();
    }

    // AS 요청 다중 삭제
    @DeleteMapping
    public ResponseEntity<?> deleteRequests(@RequestBody RequestDeleteDto dto) {
        requestService.deleteRequests(dto.getIds());
        return ResponseEntity.noContent().build();
    }

    // AS 요청 수리 담당자 배정 상태 처리
    @PutMapping("/{requestId}/assignment-status")
    public ResponseEntity<Void> changeAssignmentStatus(
            @PathVariable Long requestId,
            @RequestBody RequestAssignmentStatusUpdateRequestDto dto
    ) {
        requestAssignmentLogService.changeAssignmentStatus(requestId, dto);
        return ResponseEntity.ok().build();
    }

    // AS 요청 수리 담당자 재배정
    @PutMapping("/{requestId}/assignment-engineer")
    public ResponseEntity<Void> changeassignmentStatus(
            @PathVariable Long requestId,
            @RequestBody RequestAssignmentEngineerUpdateRequestDto dto
    ){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        EmployeeDetails employeeDetails = (EmployeeDetails) authentication.getPrincipal();

        Long viewerId = employeeDetails.getEmployee().getEmployeeId();
        String role = employeeDetails.getEmployee().getRole().name();

        requestAssignmentLogService.changeEnginner(requestId, dto, viewerId, role);
        return ResponseEntity.ok().build();
    }

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