package com.suriname.prediction.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "model_metadata")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class ModelMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long modelId;

    @Column(nullable = false, length = 100)
    private String modelName;

    @Column(nullable = false, length = 50)
    private String modelType;

    @Column(nullable = false, length = 20)
    private String version;

    @Column(nullable = false)
    private LocalDateTime trainingDate;

    @Column(precision = 5, scale = 4)
    private BigDecimal accuracy;

    @Column(nullable = false)
    private boolean isActive = false;

    @Builder
    public ModelMetadata(String modelName, String modelType, String version,
                        LocalDateTime trainingDate, BigDecimal accuracy, boolean isActive) {
        this.modelName = modelName;
        this.modelType = modelType;
        this.version = version;
        this.trainingDate = trainingDate;
        this.accuracy = accuracy;
        this.isActive = isActive;
    }

    public void activate() {
        this.isActive = true;
    }

    public void deactivate() {
        this.isActive = false;
    }

    public void updateAccuracy(BigDecimal newAccuracy) {
        this.accuracy = newAccuracy;
    }
}