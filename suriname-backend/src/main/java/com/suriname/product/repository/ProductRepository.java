package com.suriname.product.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.suriname.product.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByModelCodeAndSerialNumber(String modelCode, String serialNumber);
}
