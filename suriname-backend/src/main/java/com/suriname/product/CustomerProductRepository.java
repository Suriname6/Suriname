package com.suriname.product;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerProductRepository extends JpaRepository<CustomerProduct, Long> {
}