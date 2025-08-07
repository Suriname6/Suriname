package com.suriname.completion.entity;

import com.suriname.delivery.entity.Delivery;
import com.suriname.request.entity.Request;
import com.suriname.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "completion")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Completion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long completionId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false, unique = true)
    private Request request;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_id", nullable = false)
    private Delivery delivery;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "completed_by", nullable = false)
    private Employee completedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "completion_type", nullable = false, length = 20)
    private CompletionType completionType;

    @Column(name = "completion_notes", columnDefinition = "TEXT")
    private String completionNotes;

    @Column(name = "customer_received", nullable = false)
    private Boolean customerReceived;

    @Column(name = "received_date")
    private LocalDateTime receivedDate;

    @Column(name = "satisfaction_requested", nullable = false)
    private Boolean satisfactionRequested;

    @Column(name = "satisfaction_sent_date")
    private LocalDateTime satisfactionSentDate;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public enum CompletionType {
        REPAIR_COMPLETED,    // 수리 완료
        EXCHANGE_COMPLETED,  // 교체 완료
        REFUND_COMPLETED,    // 환불 완료
        RETURN_COMPLETED,    // 반품 완료
        INSPECTION_COMPLETED // 점검 완료
    }

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.customerReceived = false;
        this.satisfactionRequested = false;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Builder
    public Completion(Request request,
                     Delivery delivery,
                     Employee completedBy,
                     CompletionType completionType,
                     String completionNotes) {
        this.request = request;
        this.delivery = delivery;
        this.completedBy = completedBy;
        this.completionType = completionType;
        this.completionNotes = completionNotes;
    }

    /**
     * 고객 수령 확인
     */
    public void confirmCustomerReceived() {
        this.customerReceived = true;
        this.receivedDate = LocalDateTime.now();
    }

    /**
     * 만족도 조사 요청 발송
     */
    public void requestSatisfactionSurvey() {
        this.satisfactionRequested = true;
        this.satisfactionSentDate = LocalDateTime.now();
    }

    /**
     * 완료 메모 업데이트
     */
    public void updateNotes(String notes) {
        this.completionNotes = notes;
    }

    /**
     * 완료 여부 확인
     */
    public boolean isFullyCompleted() {
        return this.customerReceived && this.satisfactionRequested;
    }
}