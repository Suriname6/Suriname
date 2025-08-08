package com.suriname.prediction.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "prediction_result")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class PredictionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resultId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prediction_id", nullable = false)
    private Prediction prediction;

    @Column(precision = 10, scale = 2)
    private BigDecimal predictedValue;

    @Column(precision = 5, scale = 4)
    private BigDecimal confidenceScore;

    @Column(length = 20)
    private String modelVersion;

    @Column(precision = 10, scale = 2)
    private BigDecimal actualValue;

    @Column(precision = 5, scale = 4)
    private BigDecimal accuracyScore;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public PredictionResult(Prediction prediction, BigDecimal predictedValue, 
                           BigDecimal confidenceScore, String modelVersion,
                           BigDecimal actualValue, BigDecimal accuracyScore) {
        this.prediction = prediction;
        this.predictedValue = predictedValue;
        this.confidenceScore = confidenceScore;
        this.modelVersion = modelVersion;
        this.actualValue = actualValue;
        this.accuracyScore = accuracyScore;
    }

    public void updateActualValue(BigDecimal actualValue) {
        this.actualValue = actualValue;
        if (predictedValue != null && actualValue != null) {
            // Calculate accuracy score
            BigDecimal difference = predictedValue.subtract(actualValue).abs();
            BigDecimal accuracy = BigDecimal.ONE.subtract(difference.divide(actualValue, 4, BigDecimal.ROUND_HALF_UP));
            this.accuracyScore = accuracy.max(BigDecimal.ZERO);
        }
    }
}