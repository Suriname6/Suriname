package com.suriname.completion.service;

import com.suriname.completion.dto.CompletionDetailDto;
import com.suriname.completion.dto.CompletionListDto;
import com.suriname.completion.dto.CompletionRegisterDto;
import com.suriname.completion.entity.Completion;
import com.suriname.completion.repository.CompletionRepository;
import com.suriname.delivery.entity.Delivery;
import com.suriname.delivery.repository.DeliveryRepository;
import com.suriname.employee.entity.Employee;
import com.suriname.employee.repository.EmployeeRepository;
import com.suriname.request.entity.Request;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompletionService {

    private final CompletionRepository completionRepository;
    private final DeliveryRepository deliveryRepository;
    private final EmployeeRepository employeeRepository;

    /**
     * 완료 처리 등록
     */
    @Transactional
    public Map<String, Long> registerCompletion(CompletionRegisterDto dto) {
        // 배송 정보 조회
        Delivery delivery = deliveryRepository.findById(dto.getDeliveryId())
                .orElseThrow(() -> new RuntimeException("배송 정보를 찾을 수 없습니다."));

        // 이미 완료 처리된 경우 체크
        if (completionRepository.findByDelivery(delivery).isPresent()) {
            throw new RuntimeException("이미 완료 처리된 배송입니다.");
        }

        // 배송 완료 상태 확인
        if (delivery.getStatus() != Delivery.Status.DELIVERED) {
            throw new RuntimeException("배송이 완료되지 않은 건은 완료 처리할 수 없습니다.");
        }

        // 담당자 조회
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("담당자 정보를 찾을 수 없습니다."));

        // 완료 정보 생성
        Completion completion = Completion.builder()
                .request(delivery.getRequest())
                .delivery(delivery)
                .completedBy(employee)
                .completionType(dto.getCompletionType())
                .completionNotes(dto.getCompletionNotes())
                .build();

        completionRepository.save(completion);

        // Request 상태를 COMPLETED로 변경
        Request request = delivery.getRequest();
        request.changeStatus(Request.Status.COMPLETED);

        log.info("완료 처리 등록 - 접수번호: {}, 완료 타입: {}", 
            request.getRequestNo(), dto.getCompletionType());

        return Map.of("completionId", completion.getCompletionId());
    }

    /**
     * 완료 목록 조회
     */
    public Page<CompletionListDto> getAllCompletions(Pageable pageable) {
        Page<Completion> completions = completionRepository.findAllByOrderByCreatedAtDesc(pageable);

        return completions.map(completion -> new CompletionListDto(
                completion.getCompletionId(),
                completion.getRequest().getRequestId(),
                completion.getRequest().getRequestNo(),
                completion.getRequest().getCustomer().getName(),
                completion.getDelivery().getDeliveryId(),
                completion.getCompletionType(),
                completion.getCompletedBy().getName(),
                completion.getCustomerReceived(),
                completion.getSatisfactionRequested(),
                completion.getCreatedAt(),
                completion.getReceivedDate()
        ));
    }

    /**
     * 완료 타입별 목록 조회
     */
    public Page<CompletionListDto> getCompletionsByType(Completion.CompletionType type, Pageable pageable) {
        Page<Completion> completions = completionRepository.findByCompletionTypeOrderByCreatedAtDesc(type, pageable);

        return completions.map(completion -> new CompletionListDto(
                completion.getCompletionId(),
                completion.getRequest().getRequestId(),
                completion.getRequest().getRequestNo(),
                completion.getRequest().getCustomer().getName(),
                completion.getDelivery().getDeliveryId(),
                completion.getCompletionType(),
                completion.getCompletedBy().getName(),
                completion.getCustomerReceived(),
                completion.getSatisfactionRequested(),
                completion.getCreatedAt(),
                completion.getReceivedDate()
        ));
    }

    /**
     * 완료 상세 조회
     */
    public CompletionDetailDto getCompletionDetail(Long completionId) {
        Completion completion = completionRepository.findById(completionId)
                .orElseThrow(() -> new RuntimeException("완료 정보를 찾을 수 없습니다."));

        return new CompletionDetailDto(
                completion.getCompletionId(),
                completion.getRequest().getRequestId(),
                completion.getRequest().getRequestNo(),
                completion.getRequest().getCustomer().getName(),
                completion.getRequest().getCustomer().getPhone(),
                completion.getDelivery().getDeliveryId(),
                completion.getDelivery().getAddress(),
                completion.getCompletionType(),
                completion.getCompletionNotes(),
                completion.getCompletedBy().getName(),
                completion.getCompletedBy().getEmployeeId(),
                completion.getCustomerReceived(),
                completion.getReceivedDate(),
                completion.getSatisfactionRequested(),
                completion.getSatisfactionSentDate(),
                completion.getCreatedAt(),
                completion.getUpdatedAt()
        );
    }

    /**
     * 고객 수령 확인
     */
    @Transactional
    public void confirmCustomerReceived(Long completionId) {
        Completion completion = completionRepository.findById(completionId)
                .orElseThrow(() -> new RuntimeException("완료 정보를 찾을 수 없습니다."));

        completion.confirmCustomerReceived();
        
        log.info("고객 수령 확인 - 접수번호: {}, 완료 ID: {}", 
            completion.getRequest().getRequestNo(), completionId);
    }

    /**
     * 만족도 조사 요청
     */
    @Transactional
    public void requestSatisfactionSurvey(Long completionId) {
        Completion completion = completionRepository.findById(completionId)
                .orElseThrow(() -> new RuntimeException("완료 정보를 찾을 수 없습니다."));

        completion.requestSatisfactionSurvey();
        
        log.info("만족도 조사 요청 - 접수번호: {}, 완료 ID: {}", 
            completion.getRequest().getRequestNo(), completionId);
    }

    /**
     * 완료 메모 업데이트
     */
    @Transactional
    public void updateCompletionNotes(Long completionId, String notes) {
        Completion completion = completionRepository.findById(completionId)
                .orElseThrow(() -> new RuntimeException("완료 정보를 찾을 수 없습니다."));

        completion.updateNotes(notes);
        
        log.info("완료 메모 업데이트 - 접수번호: {}, 완료 ID: {}", 
            completion.getRequest().getRequestNo(), completionId);
    }

    /**
     * 미완료 건 조회
     */
    public Page<CompletionListDto> getIncompleteItems(Pageable pageable) {
        Page<Completion> completions = completionRepository.findIncompleteItems(pageable);

        return completions.map(completion -> new CompletionListDto(
                completion.getCompletionId(),
                completion.getRequest().getRequestId(),
                completion.getRequest().getRequestNo(),
                completion.getRequest().getCustomer().getName(),
                completion.getDelivery().getDeliveryId(),
                completion.getCompletionType(),
                completion.getCompletedBy().getName(),
                completion.getCustomerReceived(),
                completion.getSatisfactionRequested(),
                completion.getCreatedAt(),
                completion.getReceivedDate()
        ));
    }

    /**
     * 접수번호로 완료 정보 조회
     */
    public CompletionDetailDto getCompletionByRequestNo(String requestNo) {
        // 먼저 접수번호로 완료 정보 검색
        Page<Completion> completions = completionRepository.findByRequestNoContaining(requestNo, Pageable.ofSize(1));
        
        if (completions.isEmpty()) {
            throw new RuntimeException("해당 접수번호의 완료 정보를 찾을 수 없습니다.");
        }
        
        Completion completion = completions.getContent().get(0);
        return getCompletionDetail(completion.getCompletionId());
    }
}