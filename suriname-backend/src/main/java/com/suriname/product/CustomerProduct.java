package com.suriname.product;

import com.suriname.customer.Customer;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "customer_product")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class CustomerProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long customerProductId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

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
    public CustomerProduct(Customer customer, Product product) {
        this.customer = customer;
        this.product = product;
    }
    
    public void updateCustomerAndProduct(Customer customer, Product product) {
        this.customer = customer;
        this.product = product;
        this.updatedAt = LocalDateTime.now();
    }


}