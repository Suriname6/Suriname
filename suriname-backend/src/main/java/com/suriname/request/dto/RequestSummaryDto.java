package com.suriname.request.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class RequestSummaryDto {
    private Long requestId;
    private String requestNo;
    private String status;
    private String customerName;
    private String productName;
    private String modelCode;
    private LocalDateTime createdAt;
}
