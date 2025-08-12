package com.suriname.request.dto;

import com.suriname.request.entity.Request;

import lombok.Getter;

@Getter
public class RequestUpdateDto {

    private Long employeeId;
    private Long customerId;
    private Long customerProductId;
    private String content;
    private Request.Status status;
}
