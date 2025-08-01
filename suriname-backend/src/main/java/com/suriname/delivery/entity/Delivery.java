package com.suriname.delivery.entity;

import com.suriname.request.entity.Request;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "delivery")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deliveryId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false, unique = true)
    private Request request;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, length = 10)
    private String zipcode;

    @Column(nullable = false, length = 300)
    private String address;

    @Column(name = "tracking_no", length = 50)
    private String trackingNo;

    @Column(name = "carrier_name", length = 50)
    private String carrierName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "completed_date")
    private LocalDateTime completedDate;

    public enum Status {
        PENDING, SHIPPED, DELIVERED
    }

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Builder
    public Delivery(Request request, String name, String phone, String zipcode, String address,
                    String trackingNo, String carrierName, Status status) {
        this.request = request;
        this.name = name;
        this.phone = phone;
        this.zipcode = zipcode;
        this.address = address;
        this.trackingNo = trackingNo;
        this.carrierName = carrierName;
        this.status = status;
    }

    public void completeDelivery() {
        this.status = Status.DELIVERED;
        this.completedDate = LocalDateTime.now();
    }
}
