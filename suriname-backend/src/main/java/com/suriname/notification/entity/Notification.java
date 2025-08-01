package com.suriname.notification.entity;

import com.suriname.customer.Customer;
import com.suriname.employee.entity.Employee;
import com.suriname.request.entity.Request;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requests_id", nullable = false)
    private Request request;

    @Column(nullable = false, length = 10)
    private String channel;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 30)
    private NotificationType eventType;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private Boolean isRead;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public enum NotificationType {
        RECEIVED,
        REPAIR_COMPLETED,
        DELIVERY_STARTED
    }

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }

    @Builder
    public Notification(Employee employee,
                         Customer customer,
                         Request request,
                         String channel,
                         NotificationType eventType,
                         String content) {
        this.employee = employee;
        this.customer = customer;
        this.request = request;
        this.channel = channel;
        this.eventType = eventType;
        this.content = content;
    }

    public void read() {
        this.isRead = true;
    }
}
