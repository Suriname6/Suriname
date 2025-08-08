package com.suriname.prediction.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class PredictionResponseDto {
    private Long predictionId;
    private String predictionType;
    private BigDecimal predictedValue;
    private BigDecimal confidence;
    private String modelVersion;
    private String explanation;
    private LocalDateTime predictionTime;
}