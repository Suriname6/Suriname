package com.suriname.delivery.controller;

import com.suriname.delivery.dto.DeliveryDetailDto;
import com.suriname.delivery.dto.DeliveryListDto;
import com.suriname.delivery.dto.DeliveryRegisterDto;
import com.suriname.delivery.dto.DeliveryStatusUpdateDto;
import com.suriname.delivery.entity.Delivery;
import com.suriname.delivery.service.DeliveryService;
import com.suriname.delivery.service.CourierApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/delivery")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;
    private final CourierApiService courierApiService;

    // 배송 정보 등록
    @PostMapping
    public ResponseEntity<?> registerDelivery(@RequestBody @Validated DeliveryRegisterDto dto) {
        try {
            Map<String, Long> result = deliveryService.registerDelivery(dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("status", 201, "data", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", 400, "message", e.getMessage()));
        }
    }

    // 배송 목록 조회
    @GetMapping
    public ResponseEntity<?> getDeliveryList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        try {
            PageRequest pageable = PageRequest.of(page, size);
            Page<DeliveryListDto> deliveries;

            if (status != null && !status.isEmpty()) {
                Delivery.Status deliveryStatus = Delivery.Status.valueOf(status.toUpperCase());
                deliveries = deliveryService.getDeliveriesByStatus(deliveryStatus, pageable);
            } else {
                deliveries = deliveryService.getAllDeliveries(pageable);
            }

            return ResponseEntity.ok(Map.of("status", 200, "data", deliveries));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", 400, "message", e.getMessage()));
        }
    }

    // 배송 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<?> getDeliveryDetail(@PathVariable("id") Long id) {
        try {
            DeliveryDetailDto delivery = deliveryService.getDeliveryDetail(id);
            return ResponseEntity.ok(Map.of("status", 200, "data", delivery));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("status", 404, "message", e.getMessage()));
        }
    }

    // 배송 상태 업데이트
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateDeliveryStatus(
            @PathVariable("id") Long id,
            @RequestBody @Validated DeliveryStatusUpdateDto dto) {
        try {
            deliveryService.updateDeliveryStatus(id, dto);
            return ResponseEntity.ok(Map.of("status", 200, "message", "배송 상태가 업데이트되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", 400, "message", e.getMessage()));
        }
    }

    // 송장번호 및 택배사 업데이트
    @PutMapping("/{id}/tracking")
    public ResponseEntity<?> updateTrackingInfo(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> trackingInfo) {
        try {
            String trackingNo = trackingInfo.get("trackingNo");
            String carrierName = trackingInfo.get("carrierName");
            
            if (trackingNo == null || trackingNo.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("status", 400, "message", "송장번호는 필수입니다."));
            }
            
            deliveryService.updateTrackingInfo(id, trackingNo, carrierName);
            return ResponseEntity.ok(Map.of("status", 200, "message", "송장 정보가 업데이트되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", 400, "message", e.getMessage()));
        }
    }

    // 외부 택배사 배송 조회 API
    @GetMapping("/tracking")
    public ResponseEntity<?> getTrackingInfo(
            @RequestParam String carrierName,
            @RequestParam String trackingNo) {
        try {
            Map<String, Object> trackingInfo = courierApiService.getTrackingInfo(carrierName, trackingNo);
            return ResponseEntity.ok(Map.of("status", 200, "data", trackingInfo));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", 400, "message", e.getMessage()));
        }
    }

    // 배송 분석 데이터 조회
    @GetMapping("/analytics")
    public ResponseEntity<?> getDeliveryAnalytics() {
        try {
            Map<String, Object> analytics = deliveryService.getDeliveryAnalytics();
            return ResponseEntity.ok(Map.of("status", 200, "data", analytics));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", 500, "message", e.getMessage()));
        }
    }
}

// 고객 공개용 배송 조회 Controller (별도)
@RestController
@RequestMapping("/api/public/delivery")
@RequiredArgsConstructor
class PublicDeliveryController {

    private final DeliveryService deliveryService;

    // 접수번호로 배송 상태 조회 (고객용)
    @GetMapping("/{requestNo}")
    public ResponseEntity<?> getDeliveryByRequestNo(@PathVariable("requestNo") String requestNo) {
        try {
            DeliveryDetailDto delivery = deliveryService.getDeliveryByRequestNo(requestNo);
            return ResponseEntity.ok(Map.of("status", 200, "data", delivery));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("status", 404, "message", e.getMessage()));
        }
    }
}