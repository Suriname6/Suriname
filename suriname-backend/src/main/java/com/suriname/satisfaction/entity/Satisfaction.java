package com.suriname.satisfaction.entity;

import com.suriname.customer.entity.Customer;
import com.suriname.request.entity.Request;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "satisfaction")
@NoArgsConstructor
@Getter
public class Satisfaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long satisfactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
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
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    private Satisfaction(Request request, Customer customer, Byte rating, String feedback) {
        this.request = request;
        this.customer = customer;
        this.rating = rating;
        this.feedback = feedback;
    }

    public static Satisfaction create(Request request, Customer customer, Byte rating, String feedback) {
        return Satisfaction.builder()
                .request(request)
                .customer(customer)
                .rating(rating)
                .feedback(feedback)
                .build();
    }
}
