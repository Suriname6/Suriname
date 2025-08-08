package com.suriname.request.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class RequestDetailResponseDto {

    private Long requestId;          // 요청 PK
    private String requestNo;        // 접수번호
    private LocalDateTime createdAt; // 접수 일자
    private String status;           // AS 요청 상태
    private String receiverName;     // 접수 담당자명
    private String engineerName;     // 수리 담당자명
    private String content;          // 요청 내용

    private String customerName;     // 고객명

    private String categoryName;    // 카테고리명

    private String productName;      // 입력 제품명
    private String modelCode;        // 제품 고유번호
    private String productBrand;       // 입력 브랜드
    private String serialNumber;       // 입력 모델명

    private List<String> requestImages; // AS 요청 이미지

    private String assignmentStatus; // 접수 상태
    private String rejectionReason;


    private RepairResultDto repairResult;

    @Getter
    @Builder
    public static class RepairResultDto {
        private String content;                    // 수리 내용
        private Integer totalCost;                 // 총 수리 비용
        private LocalDateTime repairedAt;          // 수리 완료 일시
        private List<RepairItemDto> items;         // 수리 품목들
        private List<String> images;               // 수리 사진 URL 리스트
    }

    @Getter
    @Builder
    public static class RepairItemDto {
        private String itemName;
        private Integer cost;

        public RepairItemDto(String itemName, Integer cost) {
            this.itemName = itemName;
            this.cost = cost;
        }
    }
}
