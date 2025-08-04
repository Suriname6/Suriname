package com.suriname.customer;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.suriname.product.CustomerProduct;

@Entity
@Table(name = "customer")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long customerId;

    @Column(nullable = false, length = 10)
    private String name;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(nullable = false)
    private LocalDate birth;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Status status;

    public enum Status {
        ACTIVE, INACTIVE
    }
    
    @Column(nullable = false)
    private boolean isDeleted = false; 

    public void markAsDeleted() {
        this.isDeleted = true;
    }

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Builder
    public Customer(String name, String email, String phone, String address, LocalDate birth) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.birth = birth;
        this.status = Status.ACTIVE;
    }

    public void markAsInactive() {
        this.status = Status.INACTIVE;
    }
    
    public void update(String name, String email, String phone, String address, LocalDate birth) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.birth = birth;
    }
    
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CustomerProduct> customerProducts = new ArrayList<>();


}
