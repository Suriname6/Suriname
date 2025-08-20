package com.suriname.request.dto;

import com.suriname.request.entity.Request;
import com.suriname.request.entity.RequestAssignmentLog;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
@NoArgsConstructor
public class RequestSearchCondition {
    private String customerName;
    private String productName;
    private String category;
    private String brand;
    private String modelCode;
    private String serialNumber;
    private String employeeName;
    private Request.Status status;
    private RequestAssignmentLog.AssignmentStatus AssignmentStatus;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;
}

