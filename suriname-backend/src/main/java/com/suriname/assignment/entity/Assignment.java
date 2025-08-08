package com.suriname.assignment.entity;

import com.suriname.employee.entity.Employee;
import com.suriname.request.entity.Request;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "assignment")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long assignmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private Request request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by")
    private Employee assignedBy;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "assignment_type", nullable = false, length = 10)
    private AssignmentType assignmentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "response_status", nullable = false, length = 10)
    private ResponseStatus responseStatus;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @Column(columnDefinition = "TEXT")
    private String memo;

    public enum AssignmentType {
        AUTO, MANUAL
    }

    public enum ResponseStatus {
        PENDING, APPROVED, REJECTED, CANCELLED, EXPIRED
    }

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public Assignment(Employee employee,
                       Request request,
                       Employee assignedBy,
                       AssignmentType assignmentType,
                       ResponseStatus responseStatus,
                       LocalDateTime respondedAt,
                       String memo)
    {
        this.employee = employee;
        this.request = request;
        this.assignedBy = assignedBy;
        this.assignmentType = assignmentType;
        this.responseStatus = responseStatus;
        this.respondedAt = respondedAt;
        this.memo = memo;
    }

    //응답 상태, 시점 기록
    public void respond(ResponseStatus status) {
        this.responseStatus = status;
        this.respondedAt = LocalDateTime.now();
    }
}
