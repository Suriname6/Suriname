package com.suriname.product;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByModelCodeAndSerialNumber(String modelCode, String serialNumber);
}
