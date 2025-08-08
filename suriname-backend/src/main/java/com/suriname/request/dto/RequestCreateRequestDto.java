package com.suriname.request.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestCreateRequestDto {

    private Long employeeId;
    private Long customerId;
    private Long customerProductId;
    private String content;
}
