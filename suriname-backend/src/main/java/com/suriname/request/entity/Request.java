package com.suriname.request.entity;

import com.suriname.customer.entity.Customer;
import com.suriname.employee.entity.Employee;
import com.suriname.image.entity.Image;
import com.suriname.product.entity.CustomerProduct;
import com.suriname.payment.Payment;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.domain.AbstractAggregateRoot;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "request")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter @Setter
public class Request extends AbstractAggregateRoot<Request> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private Employee receiver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_product_id", nullable = false)
    private CustomerProduct customerProduct;

    @Column(name = "request_no", length = 30, unique = true, nullable = true)
    private String requestNo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private Status status;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "request", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Payment> payments = new ArrayList<>();

    public enum Status {
        RECEIVED,           // 접수
        REPAIRING,          // 수리중
        WAITING_FOR_PAYMENT,// 입금대기
        WAITING_FOR_DELIVERY,// 배송대기
        COMPLETED           // 완료
    }

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Builder
    public Request(Employee receiver,
                   Employee employee,
                   Customer customer,
                   CustomerProduct customerProduct,
                   String requestNo,
                   String content) {
        this.receiver = receiver;
        this.employee = employee;
        this.customer = customer;
        this.customerProduct = customerProduct;
        this.requestNo = requestNo;  
        this.content = content;
        this.status = Status.RECEIVED;
    }

    //상태 변경 시 완료시간 자동 세팅
    public void changeStatus(Status newStatus, String changedBy, String notes) {
        Status old = this.status;
        this.status = newStatus;

        if (newStatus == Status.COMPLETED && this.completedAt == null) {
            this.completedAt = LocalDateTime.now();
        }
        if (newStatus != Status.COMPLETED) this.completedAt = null;

        registerEvent(new RequestStatusChangedEvent(
                this.requestId, old, newStatus, changedBy, notes
        ));
    }

    public static Request of(Long requestId) {
        Request r = new Request();
        r.setRequestId(requestId);
        return r;
    }

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RequestAssignmentLog> assignmentLogs = new ArrayList<>();

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Image> requestImages = new ArrayList<>();

    public void publishStatusInitialized(String changedBy, String notes) {
        registerEvent(new RequestStatusChangedEvent(
                this.getRequestId(), null, this.status, changedBy, notes
        ));
    }
}
