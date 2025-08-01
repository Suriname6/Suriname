package com.suriname.payment.entity;

import com.suriname.request.entity.Request;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false, unique = true)
    private Request request;

    @Column(nullable = false, length = 50)
    private String account;

    @Column(nullable = false, length = 50)
    private String bank;

    @Column(nullable = false)
    private Integer cost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Status status;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(columnDefinition = "TEXT")
    private String memo;

    public enum Status {
        FAILED, PENDING, SUCCESS
    }

    @PrePersist
    public void onCreate() {
        this.confirmedAt = LocalDateTime.now();
    }

    @Builder
    public Payment(Request request, String account, String bank, Integer cost, Status status, String memo) {
        this.request = request;
        this.account = account;
        this.bank = bank;
        this.cost = cost;
        this.status = status;
        this.memo = memo;
    }
}
