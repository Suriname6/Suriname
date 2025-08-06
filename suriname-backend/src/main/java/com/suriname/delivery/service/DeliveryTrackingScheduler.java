package com.suriname.delivery.service;

import com.suriname.delivery.entity.Delivery;
import com.suriname.delivery.repository.DeliveryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryTrackingScheduler {

    private final DeliveryRepository deliveryRepository;
    private final CourierApiService courierApiService;
    private final DeliveryService deliveryService;
    private final DeliveryNotificationService notificationService;

    /**
     * 배송 상태 자동 업데이트 (매 30분마다 실행)
     */
    @Scheduled(fixedRate = 1800000) // 30분 = 30 * 60 * 1000ms
    @Transactional
    public void updateDeliveryStatus() {
        log.info("배송 상태 자동 업데이트 시작");
        
        try {
            // 배송 중인 항목들만 조회 (PENDING, SHIPPED 상태)
            List<Delivery> activeDeliveries = deliveryRepository.findByStatusIn(
                List.of(Delivery.Status.PENDING, Delivery.Status.SHIPPED)
            );
            
            log.info("업데이트 대상 배송 건수: {}", activeDeliveries.size());
            
            int updatedCount = 0;
            for (Delivery delivery : activeDeliveries) {
                try {
                    // 송장번호가 없으면 스킵
                    if (delivery.getTrackingNo() == null || delivery.getTrackingNo().trim().isEmpty()) {
                        continue;
                    }
                    
                    // 택배사 API로 현재 상태 조회
                    Map<String, Object> trackingInfo = courierApiService.getTrackingInfo(
                        delivery.getCarrierName(), 
                        delivery.getTrackingNo()
                    );
                    
                    // 에러 응답인 경우 스킵
                    if (trackingInfo.containsKey("error")) {
                        log.warn("배송 조회 실패 - ID: {}, 송장번호: {}", 
                            delivery.getDeliveryId(), delivery.getTrackingNo());
                        continue;
                    }
                    
                    // 상태 표준화
                    String apiStatus = (String) trackingInfo.get("status");
                    String normalizedStatus = courierApiService.normalizeDeliveryStatus(apiStatus);
                    
                    // 상태가 변경된 경우에만 업데이트
                    if (!delivery.getStatus().name().equals(normalizedStatus)) {
                        Delivery.Status newStatus = Delivery.Status.valueOf(normalizedStatus);
                        delivery.updateStatus(newStatus);
                        updatedCount++;
                        
                        log.info("배송 상태 업데이트 - ID: {}, {} -> {}", 
                            delivery.getDeliveryId(), delivery.getStatus(), newStatus);
                        
                        // 배송 완료 시 SMS 발송
                        if (newStatus == Delivery.Status.DELIVERED) {
                            sendDeliveryCompletionNotification(delivery);
                        }
                    }
                    
                } catch (Exception e) {
                    log.error("개별 배송 상태 업데이트 실패 - ID: {}", delivery.getDeliveryId(), e);
                }
            }
            
            log.info("배송 상태 자동 업데이트 완료 - 업데이트된 건수: {}", updatedCount);
            
        } catch (Exception e) {
            log.error("배송 상태 자동 업데이트 중 오류 발생", e);
        }
    }

    /**
     * 배송 완료 SMS 발송
     */
    private void sendDeliveryCompletionNotification(Delivery delivery) {
        try {
            notificationService.sendDeliveryCompletionNotification(delivery);
            log.info("배송 완료 SMS 발송 완료 - 접수번호: {}, 고객: {}", 
                delivery.getRequest().getRequestNo(), 
                delivery.getRequest().getCustomer().getName());
            
        } catch (Exception e) {
            log.error("배송 완료 SMS 발송 실패 - 배송 ID: {}", delivery.getDeliveryId(), e);
        }
    }

    /**
     * 배송 지연 감지 및 알림 (매일 오전 9시 실행)
     */
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional(readOnly = true)
    public void checkDelayedDeliveries() {
        log.info("배송 지연 감지 작업 시작");
        
        try {
            // 3일 이상 배송 중인 항목 조회
            List<Delivery> delayedDeliveries = deliveryRepository.findDelayedDeliveries(3);
            
            if (!delayedDeliveries.isEmpty()) {
                log.warn("배송 지연 건수: {}", delayedDeliveries.size());
                
                for (Delivery delivery : delayedDeliveries) {
                    log.warn("배송 지연 - 접수번호: {}, 등록일: {}, 택배사: {}", 
                        delivery.getRequest().getRequestNo(),
                        delivery.getCreatedAt(),
                        delivery.getCarrierName());
                        
                    // 관리자에게 배송 지연 SMS 발송
                    try {
                        String adminPhone = "010-1234-5678"; // TODO: 설정 파일에서 관리
                        notificationService.sendDeliveryDelayNotification(delivery, adminPhone);
                    } catch (Exception e) {
                        log.error("배송 지연 관리자 SMS 발송 실패 - 배송 ID: {}", delivery.getDeliveryId(), e);
                    }
                }
            }
            
        } catch (Exception e) {
            log.error("배송 지연 감지 작업 중 오류 발생", e);
        }
    }
}