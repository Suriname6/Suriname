package com.suriname.quote.entity;

import com.suriname.employee.entity.Employee;
import com.suriname.request.entity.Request;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "quote")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Quote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long quotesId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false, unique = true)
    private Request request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private Employee approvedBy; // null 허용 (미승인 시)

    @Column(nullable = false)
    private Long cost;

    @Column(columnDefinition = "TEXT")
    private String field; // nullable 허용

    @Column(name = "is_approved", nullable = false)
    private Boolean isApproved;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.isApproved = false;
    }

    public void approve(Employee approver) {
        this.approvedBy = approver;
        this.approvedAt = LocalDateTime.now();
        this.isApproved = true;
    }

    @Builder
    public Quote(Request request, Long cost, String field) {
        this.request = request;
        this.cost = cost;
        this.field = field;
    }
}
