package com.suriname.prediction.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PredictionRequestDto {
    private String predictionType;
    private Long requestId;
    private Long deliveryId;
    private Long customerId;
    private String inputData; // JSON format
}