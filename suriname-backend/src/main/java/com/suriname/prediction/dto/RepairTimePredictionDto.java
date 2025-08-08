package com.suriname.prediction.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RepairTimePredictionDto {
    private Long requestId;
    private String productCategory;
    private String issueDescription;
    private String employeeExperience;
    private Integer currentWorkload;
    private String productAge;
}