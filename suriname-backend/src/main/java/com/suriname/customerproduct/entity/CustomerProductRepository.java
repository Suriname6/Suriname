package com.suriname.customerproduct.entity;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerProductRepository extends JpaRepository<CustomerProduct, Long> {
}