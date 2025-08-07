package com.suriname.delivery.service;

import com.suriname.delivery.dto.DeliveryDetailDto;
import com.suriname.delivery.dto.DeliveryListDto;
import com.suriname.delivery.dto.DeliveryRegisterDto;
import com.suriname.delivery.dto.DeliveryStatusUpdateDto;
import com.suriname.delivery.entity.Delivery;
import com.suriname.delivery.repository.DeliveryRepository;
import com.suriname.request.entity.Request;
import com.suriname.request.entity.RequestRepository;
import com.suriname.completion.entity.Completion;
import com.suriname.completion.repository.CompletionRepository;
import com.suriname.completion.service.SatisfactionNotificationService;
import com.suriname.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.List;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final RequestRepository requestRepository;
    private final DeliveryNotificationService notificationService;
    private final CompletionRepository completionRepository;
    private final EmployeeRepository employeeRepository;
    private final SatisfactionNotificationService satisfactionNotificationService;

    @Transactional
    public Map<String, Long> registerDelivery(DeliveryRegisterDto dto) {
        // Request 조회
        Request request = requestRepository.findById(dto.getRequestId())
                .orElseThrow(() -> new RuntimeException("A/S 접수를 찾을 수 없습니다."));

        // 이미 배송 정보가 등록되어 있는지 확인
        if (deliveryRepository.findByRequest(request).isPresent()) {
            throw new RuntimeException("이미 배송 정보가 등록된 접수입니다.");
        }

        // 배송 정보 생성
        Delivery delivery = Delivery.builder()
                .request(request)
                .name(dto.getName())
                .phone(dto.getPhone())
                .zipcode(dto.getZipcode())
                .address(dto.getAddress())
                .trackingNo(dto.getTrackingNo())
                .carrierName(dto.getCarrierName())
                .status(dto.getTrackingNo() != null ? Delivery.Status.SHIPPED : Delivery.Status.PENDING)
                .build();

        deliveryRepository.save(delivery);

        // Request 상태를 배송대기로 변경
        if (request.getStatus() != Request.Status.WAITING_FOR_DELIVERY) {
            request.changeStatus(Request.Status.WAITING_FOR_DELIVERY);
            requestRepository.save(request);
        }

        // 배송 등록 SMS 발송
        try {
            if (delivery.getStatus() == Delivery.Status.SHIPPED) {
                notificationService.sendDeliveryStartNotification(delivery);
            }
        } catch (Exception e) {
            // SMS 발송 실패해도 배송 등록은 성공으로 처리
            log.warn("배송 등록 SMS 발송 실패 - 배송 ID: {}", delivery.getDeliveryId(), e);
        }

        return Map.of("deliveryId", delivery.getDeliveryId());
    }

    public Page<DeliveryListDto> getAllDeliveries(Pageable pageable) {
        Page<Delivery> deliveries = deliveryRepository.findAllByOrderByCreatedAtDesc(pageable);

        return deliveries.map(delivery -> new DeliveryListDto(
                delivery.getDeliveryId(),
                delivery.getRequest().getRequestId(),
                delivery.getRequest().getRequestNo(),
                delivery.getRequest().getCustomer().getName(),
                delivery.getPhone(),
                delivery.getAddress(),
                delivery.getTrackingNo(),
                delivery.getCarrierName(),
                delivery.getStatus(),
                delivery.getCreatedAt(),
                delivery.getCompletedDate()
        ));
    }

    public Page<DeliveryListDto> getDeliveriesByStatus(Delivery.Status status, Pageable pageable) {
        Page<Delivery> deliveries = deliveryRepository.findByStatusOrderByCreatedAtDesc(status, pageable);

        return deliveries.map(delivery -> new DeliveryListDto(
                delivery.getDeliveryId(),
                delivery.getRequest().getRequestId(),
                delivery.getRequest().getRequestNo(),
                delivery.getRequest().getCustomer().getName(),
                delivery.getPhone(),
                delivery.getAddress(),
                delivery.getTrackingNo(),
                delivery.getCarrierName(),
                delivery.getStatus(),
                delivery.getCreatedAt(),
                delivery.getCompletedDate()
        ));
    }

    public DeliveryDetailDto getDeliveryDetail(Long deliveryId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("배송 정보를 찾을 수 없습니다."));

        DeliveryDetailDto dto = new DeliveryDetailDto();
        dto.setDeliveryId(delivery.getDeliveryId());
        dto.setRequestId(delivery.getRequest().getRequestId());
        dto.setRequestNo(delivery.getRequest().getRequestNo());
        dto.setCustomerName(delivery.getRequest().getCustomer().getName());
        dto.setCustomerPhone(delivery.getRequest().getCustomer().getPhone());
        dto.setName(delivery.getName());
        dto.setPhone(delivery.getPhone());
        dto.setZipcode(delivery.getZipcode());
        dto.setAddress(delivery.getAddress());
        dto.setTrackingNo(delivery.getTrackingNo());
        dto.setCarrierName(delivery.getCarrierName());
        dto.setStatus(delivery.getStatus());
        dto.setCreatedAt(delivery.getCreatedAt());
        dto.setUpdatedAt(delivery.getUpdatedAt());
        dto.setCompletedDate(delivery.getCompletedDate());
        dto.setRequestContent(delivery.getRequest().getContent());

        return dto;
    }

    @Transactional
    public void updateDeliveryStatus(Long deliveryId, DeliveryStatusUpdateDto dto) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("배송 정보를 찾을 수 없습니다."));

        delivery.updateStatus(dto.getStatus());
        deliveryRepository.save(delivery);

        // 배송 완료 시 Request 상태도 완료로 변경 및 자동 Completion 생성
        if (dto.getStatus() == Delivery.Status.DELIVERED) {
            Request request = delivery.getRequest();
            request.changeStatus(Request.Status.COMPLETED);
            requestRepository.save(request);
            
            // 완료 처리가 아직 등록되지 않은 경우에만 자동 생성
            if (completionRepository.findByDelivery(delivery).isEmpty()) {
                createAutoCompletion(delivery);
            }
        }
    }

    @Transactional
    public void updateTrackingInfo(Long deliveryId, String trackingNo, String carrierName) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("배송 정보를 찾을 수 없습니다."));

        delivery.updateTrackingInfo(trackingNo, carrierName);
        deliveryRepository.save(delivery);
    }

    // 고객 배송 조회 (공개 API용)
    public DeliveryDetailDto getDeliveryByRequestNo(String requestNo) {
        Request request = requestRepository.findByRequestNo(requestNo)
                .orElseThrow(() -> new RuntimeException("접수번호를 찾을 수 없습니다."));

        Delivery delivery = deliveryRepository.findByRequest(request)
                .orElseThrow(() -> new RuntimeException("배송 정보가 등록되지 않았습니다."));

        DeliveryDetailDto dto = new DeliveryDetailDto();
        dto.setDeliveryId(delivery.getDeliveryId());
        dto.setRequestNo(delivery.getRequest().getRequestNo());
        dto.setName(delivery.getName());
        dto.setAddress(delivery.getAddress());
        dto.setTrackingNo(delivery.getTrackingNo());
        dto.setCarrierName(delivery.getCarrierName());
        dto.setStatus(delivery.getStatus());
        dto.setCreatedAt(delivery.getCreatedAt());

        return dto;
    }

    // 배송 분석 데이터 생성
    public Map<String, Object> getDeliveryAnalytics() {
        List<Delivery> allDeliveries = deliveryRepository.findAll();
        
        Map<String, Object> analytics = new HashMap<>();
        
        // 전체 통계
        analytics.put("totalDeliveries", allDeliveries.size());
        analytics.put("pendingCount", allDeliveries.stream().filter(d -> d.getStatus() == Delivery.Status.PENDING).count());
        analytics.put("shippedCount", allDeliveries.stream().filter(d -> d.getStatus() == Delivery.Status.SHIPPED).count());
        analytics.put("deliveredCount", allDeliveries.stream().filter(d -> d.getStatus() == Delivery.Status.DELIVERED).count());
        
        // 택배사별 통계
        Map<String, Long> carrierStats = allDeliveries.stream()
                .filter(d -> d.getCarrierName() != null)
                .collect(Collectors.groupingBy(
                    Delivery::getCarrierName,
                    Collectors.counting()
                ));
        analytics.put("carrierStats", carrierStats);
        
        // 지역별 통계 (주소에서 시/도 추출)
        Map<String, Long> regionStats = allDeliveries.stream()
                .filter(d -> d.getAddress() != null)
                .collect(Collectors.groupingBy(
                    d -> extractRegion(d.getAddress()),
                    Collectors.counting()
                ));
        analytics.put("regionStats", regionStats);
        
        // 일별 배송 통계 (최근 7일)
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        Map<String, Long> dailyStats = allDeliveries.stream()
                .filter(d -> d.getCreatedAt().isAfter(weekAgo))
                .collect(Collectors.groupingBy(
                    d -> d.getCreatedAt().toLocalDate().format(DateTimeFormatter.ofPattern("MM-dd")),
                    Collectors.counting()
                ));
        analytics.put("dailyStats", dailyStats);
        
        return analytics;
    }
    
    // 주소에서 지역 추출 (시/도 레벨)
    private String extractRegion(String address) {
        if (address == null) return "기타";
        
        if (address.contains("서울")) return "서울";
        if (address.contains("부산")) return "부산";
        if (address.contains("대구")) return "대구";
        if (address.contains("인천")) return "인천";
        if (address.contains("광주")) return "광주";
        if (address.contains("대전")) return "대전";
        if (address.contains("울산")) return "울산";
        if (address.contains("경기")) return "경기";
        if (address.contains("강원")) return "강원";
        if (address.contains("충북")) return "충북";
        if (address.contains("충남")) return "충남";
        if (address.contains("전북")) return "전북";
        if (address.contains("전남")) return "전남";
        if (address.contains("경북")) return "경북";
        if (address.contains("경남")) return "경남";
        if (address.contains("제주")) return "제주";
        
        return "기타";
    }

    /**
     * 배송 완료 시 자동 완료 처리 생성
     */
    private void createAutoCompletion(Delivery delivery) {
        try {
            // 기본 담당자 조회 (Admin 역할 중 첫 번째)
            var defaultEmployee = employeeRepository.findAll().stream()
                    .filter(emp -> emp.getRole().name().equals("ADMIN"))
                    .findFirst()
                    .orElse(null);
            
            if (defaultEmployee == null) {
                log.warn("기본 담당자를 찾을 수 없어 자동 완료 처리를 건너뜁니다. 배송 ID: {}", delivery.getDeliveryId());
                return;
            }

            // 자동 완료 처리 생성
            Completion autoCompletion = Completion.builder()
                    .request(delivery.getRequest())
                    .delivery(delivery)
                    .completedBy(defaultEmployee)
                    .completionType(Completion.CompletionType.REPAIR_COMPLETED)
                    .completionNotes("배송 완료로 인한 자동 완료 처리")
                    .customerReceived(false) // 초기값
                    .satisfactionRequested(false) // 초기값
                    .build();

            completionRepository.save(autoCompletion);
            
            log.info("자동 완료 처리 생성 완료 - 접수번호: {}, 배송 ID: {}", 
                delivery.getRequest().getRequestNo(), delivery.getDeliveryId());

            // 자동 완료 처리 생성 후 만족도 설문 자동 발송
            try {
                satisfactionNotificationService.sendSatisfactionSurvey(autoCompletion);
            } catch (Exception surveyError) {
                log.error("자동 완료 처리 후 만족도 설문 발송 실패 - 완료 ID: {}", autoCompletion.getCompletionId(), surveyError);
            }

        } catch (Exception e) {
            log.error("자동 완료 처리 생성 실패 - 배송 ID: {}", delivery.getDeliveryId(), e);
        }
    }
}