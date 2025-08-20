package com.suriname.request.dto;

import com.suriname.request.entity.RequestAssignmentLog;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class RequestListResponseDto {
    private Long requestId;
    private String requestNo;
    private String customerName;
    private String phone;
    private String address;
    private String productName;
    private String modelCode;
    private String categoryName;
    private LocalDateTime createdAt;
    private String status;
    private String engineerName;
    private RequestAssignmentLog.AssignmentStatus assignmentStatus;

    public RequestListResponseDto(Long requestId,
                                  String requestNo,
                                  String customerName,
                                  String productName,
                                  String phone,
                                  String address,
                                  String modelCode,
                                  String categoryName,
                                  LocalDateTime createdAt,
                                  String status,
                                  String engineerName,
                                  RequestAssignmentLog.AssignmentStatus assignmentStatus) {
        this.requestId = requestId;
        this.requestNo = requestNo;
        this.customerName = customerName;
        this.phone = phone;
        this.address = address;
        this.productName = productName;
        this.modelCode = modelCode;
        this.categoryName = categoryName;
        this.createdAt = createdAt;
        this.status = status;
        this.engineerName = engineerName;
        this.assignmentStatus = assignmentStatus;
    }
}
