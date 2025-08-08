package com.suriname.request.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class RequestDeleteDto {
    private List<Long> ids;
}
