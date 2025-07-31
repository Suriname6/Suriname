package com.suriname.requestlog.entity;

import com.suriname.employee.entity.Employee;
import com.suriname.request.entity.Request;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "request_log")
@NoArgsConstructor
@Getter
public class RequestLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private Request request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(name = "pre_status", length = 20)
    private PreStatus preStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 20)
    private NewStatus newStatus;

    @Column(name = "change_at", nullable = false)
    private LocalDateTime changeAt;

    @Column(columnDefinition = "TEXT")
    private String memo;

    public enum PreStatus {
        RECEIVED,
        IN_PROGRESS,
        AWAITING_PAYMENT,
        READY_FOR_DELIVERY,
        COMPLETED
    }

    public enum NewStatus {
        IN_PROGRESS,
        AWAITING_PAYMENT,
        READY_FOR_DELIVERY,
        COMPLETED
    }

    @PrePersist
    protected void onCreate() {
        this.changeAt = LocalDateTime.now();
    }

    @Builder
    private RequestLog(Request request,
                       Employee employee,
                       PreStatus preStatus,
                       NewStatus newStatus,
                       String memo) {
        this.request = request;
        this.employee = employee;
        this.preStatus = preStatus;
        this.newStatus = newStatus;
        this.memo = memo;
    }

    public static RequestLog create(Request request,
                                    Employee employee,
                                    PreStatus preStatus,
                                    NewStatus newStatus,
                                    String memo) {
        return RequestLog.builder()
                .request(request)
                .employee(employee)
                .preStatus(preStatus)
                .newStatus(newStatus)
                .memo(memo)
                .build();
    }

    public void advanceStatus(NewStatus newStatus) {
        this.preStatus = PreStatus.valueOf(this.newStatus.name());
        this.newStatus = newStatus;
    }

}
