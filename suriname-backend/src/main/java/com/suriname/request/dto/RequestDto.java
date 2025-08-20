package com.suriname.request.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestDto {
    private Long requestId;
    private String requestNo;
    private String customerName;
    private String productName;
    private String modelCode;
    private LocalDateTime createdAt;
    private String status;
    private String assignmentStatus;
    private String engineerName;
}