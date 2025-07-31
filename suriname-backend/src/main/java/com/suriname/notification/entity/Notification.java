package com.suriname.notification.entity;

import com.suriname.customer.entity.Customer;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
@NoArgsConstructor
@Getter
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false, length = 255)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    @Column(nullable = false)
    private Boolean isRead;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public enum NotificationType {
        REQUEST_RECEIVED,
        REPAIR_COMPLETE,
        PAYMENT_CONFIRMED,
        DELIVERY_STARTED,
        OTHER
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }

    @Builder
    private Notification(Customer customer, String message, NotificationType type) {
        this.customer = customer;
        this.message = message;
        this.type = type;
    }

    public static Notification create(Customer customer, String message, NotificationType type) {
        return Notification.builder()
                .customer(customer)
                .message(message)
                .type(type)
                .build();
    }
}
