package com.suriname.prediction.entity;

import com.suriname.customer.entity.Customer;
import com.suriname.delivery.entity.Delivery;
import com.suriname.employee.entity.Employee;
import com.suriname.request.entity.Request;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "prediction")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long predictionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PredictionType predictionType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    private Request request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_id")
    private Delivery delivery;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(columnDefinition = "JSON")
    private String inputData;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private Employee createdBy;

    public enum PredictionType {
        REPAIR_TIME,
        DELIVERY_RISK,
        CUSTOMER_RETENTION
    }

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public Prediction(PredictionType predictionType, Request request, Delivery delivery, 
                     Customer customer, String inputData, Employee createdBy) {
        this.predictionType = predictionType;
        this.request = request;
        this.delivery = delivery;
        this.customer = customer;
        this.inputData = inputData;
        this.createdBy = createdBy;
    }
}