package com.suriname.request.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RequestCreateResponseDto {
    private Long requestId;
    private String requestNo;
}