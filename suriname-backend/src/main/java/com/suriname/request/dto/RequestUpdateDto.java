package com.suriname.request.dto;

import lombok.Getter;

@Getter
public class RequestUpdateDto {

    private Long employeeId;
    private Long customerId;
    private Long customerProductId;

    private String content;
}
