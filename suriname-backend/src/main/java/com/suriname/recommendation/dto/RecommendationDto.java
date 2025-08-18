package com.suriname.recommendation.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RecommendationDto {
    private String modelName;
    private String message;
}
