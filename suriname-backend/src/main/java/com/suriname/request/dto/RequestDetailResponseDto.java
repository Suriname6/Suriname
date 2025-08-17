package com.suriname.request.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
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
    private String receiverPhone;
    private String engineerName;     // 수리 담당자명
    private String engineerPhone;

    private String content;          // 요청 내용

    private String customerName;     // 고객명
    private String customerPhone;
    private LocalDate customerBirth;

    private String categoryName;    // 카테고리명

    private String productName;      // 입력 제품명
    private String modelCode;        // 제품 고유번호
    private String productBrand;       // 입력 브랜드
    private String serialNumber;       // 입력 모델명

    private List<String> requestImages; // AS 요청 이미지

    private String assignmentStatus; // 접수 상태
    private LocalDateTime assignmentStatusChangedAt;
    private String rejectionReason; // 거절 사유


}
