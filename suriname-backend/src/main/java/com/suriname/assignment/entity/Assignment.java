package com.suriname.assignment.entity;

import com.suriname.employee.entity.Employee;
import com.suriname.request.entity.Request;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "assignment")
@NoArgsConstructor
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
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    private Assignment(Employee employee,
                       Request request,
                       Employee assignedBy,
                       AssignmentType assignmentType,
                       ResponseStatus responseStatus,
                       LocalDateTime respondedAt,
                       String memo) {
        this.employee = employee;
        this.request = request;
        this.assignedBy = assignedBy;
        this.assignmentType = assignmentType;
        this.responseStatus = responseStatus;
        this.respondedAt = respondedAt;
        this.memo = memo;
    }

    public static Assignment create(Employee employee,
                                    Request request,
                                    Employee assignedBy,
                                    AssignmentType assignmentType,
                                    String memo) {
        return Assignment.builder()
                .employee(employee)
                .request(request)
                .assignedBy(assignedBy)
                .assignmentType(assignmentType)
                .responseStatus(ResponseStatus.PENDING)
                .memo(memo)
                .build();
    }

    //기사가 수락, 거절했을 때 상태를 바꾸는 메서드
    public void respond(ResponseStatus status) {
        this.responseStatus = status;
        this.respondedAt = LocalDateTime.now();
    }

    //자동, 수동 배정
    public static Assignment createAuto(Employee engineer, Request request, String memo) {
        return create(engineer, request, null, AssignmentType.AUTO, memo);
    }

    public static Assignment createManual(Employee engineer, Request request, Employee admin, String memo) {
        return create(engineer, request, admin, AssignmentType.MANUAL, memo);
    }
}
