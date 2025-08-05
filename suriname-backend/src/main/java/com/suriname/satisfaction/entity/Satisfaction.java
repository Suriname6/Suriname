package com.suriname.satisfaction.entity;

import com.suriname.customer.entity.Customer;
import com.suriname.request.entity.Request;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "satisfaction")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Satisfaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long satisfactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", unique = true, nullable = false)
    private Request request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false)
    private Byte rating;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public Satisfaction(Request request, Customer customer, Byte rating, String feedback) {
        this.request = request;
        this.customer = customer;
        this.rating = rating;
        this.feedback = feedback;
    }
}
