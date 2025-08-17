package com.suriname.request.service;

import com.suriname.employee.entity.Employee;
import com.suriname.employee.repository.EmployeeRepository;
import com.suriname.request.dto.RequestAssignmentEngineerUpdateRequestDto;
import com.suriname.request.dto.RequestAssignmentStatusUpdateRequestDto;
import com.suriname.request.entity.Request;
import com.suriname.request.entity.RequestAssignmentLog;
import com.suriname.request.repository.RequestAssignmentLogRepository;
import com.suriname.request.repository.RequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RequestAssignmentLogService {

    private final RequestAssignmentLogRepository requestAssignmentLogRepository;
    private final EmployeeRepository employeeRepository;
    private final RequestRepository requestRepository;

    // 배정 상태 변경
    @Transactional
    public void changeAssignmentStatus(Long requestId, RequestAssignmentStatusUpdateRequestDto dto) {
        RequestAssignmentLog log = requestAssignmentLogRepository
                .findTopByRequestRequestIdAndStatusOrderByAssignedAtDesc(requestId, RequestAssignmentLog.AssignmentStatus.PENDING)
                .orElseThrow(() -> new IllegalArgumentException("배정 대기 중인 로그가 없습니다."));

        log.setStatus(dto.getStatus());
        log.setStatusChangedAt(LocalDateTime.now());

        if (dto.getStatus() == RequestAssignmentLog.AssignmentStatus.REJECTED) {
            log.setRejectionReason(dto.getReason());
            return;
        }

        if (dto.getStatus() == RequestAssignmentLog.AssignmentStatus.ACCEPTED) {
            Request request = log.getRequest();
            request.changeStatus(Request.Status.REPAIRING, request.getEmployee().getEmployeeId().toString(), "배정 수락 -> 수리 중");
            requestRepository.saveAndFlush(request);
        }

    }

    // 수리 담당자 재배정
    @Transactional
    public void changeEnginner(Long requestId, RequestAssignmentEngineerUpdateRequestDto dto, Long viewerId, String role) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("해당 요청이 존재하지 않습니다."));

        Employee newEngineer = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 수리담당자가 존재하지 않습니다."));

        Employee receiver = employeeRepository.findById(viewerId)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 접수담당자가 존재하지 않습니다."));

        request.setEmployee(newEngineer);

        RequestAssignmentLog newLog = RequestAssignmentLog.builder()
                .request(request)
                .employee(newEngineer)
                .assignedBy(receiver)
                .assignmentType(RequestAssignmentLog.AssignmentType.MANUAL)
                .status(RequestAssignmentLog.AssignmentStatus.PENDING)
                .assignedAt(LocalDateTime.now())
                .build();

        requestAssignmentLogRepository.save(newLog);
    }
}
