package com.suriname.request.entity;

import com.suriname.customer.Customer;
import com.suriname.customerproduct.entity.CustomerProduct;
import com.suriname.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "request")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Request {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

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

    @Column(name = "input_product_name", length = 100)
    private String inputProductName;

    @Column(name = "input_brand", length = 100)
    private String inputBrand;

    @Column(name = "input_model", length = 100)
    private String inputModel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private LocalDateTime createdAt;

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
    public Request(Employee employee,
                    Customer customer,
                    CustomerProduct customerProduct,
                    String requestNo,
                    String inputProductName,
                    String inputBrand,
                    String inputModel,
                    String content) {

        this.employee = employee;
        this.customer = customer;
        this.customerProduct = customerProduct;
        this.requestNo = requestNo;
        this.inputProductName = inputProductName;
        this.inputBrand = inputBrand;
        this.inputModel = inputModel;
        this.content = content;
        this.status = Status.RECEIVED;
    }

    public void changeStatus(Status newStatus) {
        this.status = newStatus;
    }
}
