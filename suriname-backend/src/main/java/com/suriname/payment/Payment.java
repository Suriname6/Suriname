package com.suriname.payment;

import com.suriname.request.entity.Request;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Setter
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false, unique = true)
    private Request request;

    @Column(name = "merchant_uid", nullable = false, length = 64, unique = true)
    private String merchantUid;

    @Column(length = 50)
    private String account;

    @Column(length = 50)
    private String bank;

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

    @Builder
    public Payment(Request request, String merchantUid, String account, String bank, Integer cost, Status status, String memo) {
        this.request = request;
        this.merchantUid = merchantUid;
        this.account = account;
        this.bank = bank;
        this.cost = cost;
        this.status = status;
        this.memo = memo;
    }

    public void markCompleted() {
        this.status = Status.SUCCESS;
        this.confirmedAt = LocalDateTime.now();
    }

    public void setAccountAndBank(String account, String bank) {
        this.account = account;
        this.bank = bank;
    }
}
