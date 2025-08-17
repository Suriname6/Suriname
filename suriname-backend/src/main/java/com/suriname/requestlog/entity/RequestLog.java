package com.suriname.requestlog.entity;

import com.suriname.request.entity.Request;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "request_status_log")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class RequestLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "status_log_id")
    private Long statusLogId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private Request request;

    @Column(name = "changed_by", length = 50)
    private String changedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_status", length = 30)
    private Request.Status oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 30)
    private Request.Status newStatus;

    @CreationTimestamp
    @Column(name = "changed_at", nullable = false, updatable = false)
    private LocalDateTime changedAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Builder
    public RequestLog(Request request,
                      String changedBy,
                      Request.Status oldStatus,
                      Request.Status newStatus,
                      String notes) {
        this.request = request;
        this.changedBy = changedBy;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.notes = notes;
    }

    public void advanceStatus(Request.Status nextStatus, String changedBy) {
        this.oldStatus = this.newStatus;
        this.newStatus = nextStatus;
        this.changedBy = changedBy;
    }
}
