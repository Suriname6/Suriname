package com.suriname.delivery.service;

import com.suriname.delivery.dto.DeliveryDetailDto;
import com.suriname.delivery.dto.DeliveryListDto;
import com.suriname.delivery.dto.DeliveryRegisterDto;
import com.suriname.delivery.dto.DeliveryStatusUpdateDto;
import com.suriname.delivery.entity.Delivery;
import com.suriname.delivery.repository.DeliveryRepository;
import com.suriname.request.entity.Request;
import com.suriname.request.repository.RequestRepository;
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
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final RequestRepository requestRepository;
    private final DeliveryNotificationService notificationService;

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

        // 배송 완료 시 Request 상태도 완료로 변경
        if (dto.getStatus() == Delivery.Status.DELIVERED) {
            Request request = delivery.getRequest();
            request.changeStatus(Request.Status.COMPLETED);
            requestRepository.save(request);
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
}