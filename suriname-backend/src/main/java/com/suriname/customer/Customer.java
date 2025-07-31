package com.suriname.customer;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.suriname.product.CustomerProduct;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "customer")
@Getter @Setter
public class Customer {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long customerId;

    private String name;
    private String email;
    private String phone;
    private String address;
    private LocalDate birth;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    @Enumerated(EnumType.STRING)
    private CustomerStatus status; 

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private List<CustomerProduct> ownedProducts = new ArrayList<>();
}
