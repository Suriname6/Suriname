package com.suriname.product;

import java.sql.Timestamp;

import com.suriname.customer.Customer;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "customer_product")
@Getter @Setter
public class CustomerProduct {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long customerProductId;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private Timestamp createdAt;
    private Timestamp updatedAt;
}

