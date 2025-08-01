package com.suriname.analytics.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class TempRequest {
    @Id
    private Long requestId;

    private Long employeeId;
    private Long customerId;
    private Long customerProductId;

    private String requestNo;
    private String inputProductName;
    private String inputBrand;
    private String inputModel;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    private String content;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

