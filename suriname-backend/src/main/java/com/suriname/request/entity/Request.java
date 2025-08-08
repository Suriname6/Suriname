package com.suriname.request.entity;

import com.suriname.customer.entity.Customer;
import com.suriname.employee.entity.Employee;
import com.suriname.image.entity.Image;
import com.suriname.product.entity.CustomerProduct;
import com.suriname.payment.Payment;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "request")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Setter
public class Request {

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

    @Column(name = "request_no", nullable = false, length = 30, unique = true)
    private String requestNo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    // Payment와의 역방향 관계 매핑
    @OneToOne(mappedBy = "request", fetch = FetchType.LAZY)
    private Payment payment;

    public enum Status {
        RECEIVED,    // 접수
        REPAIRING,  // 수리중
        WAITING_FOR_PAYMENT, // 입금대기
        WAITING_FOR_DELIVERY, // 배송대기
        COMPLETED   // 완료
    }

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
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

    public void changeStatus(Status newStatus) {
        this.status = newStatus;
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
}
