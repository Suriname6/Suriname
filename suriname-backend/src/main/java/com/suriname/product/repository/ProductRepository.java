package com.suriname.product.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.suriname.product.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long>,
JpaSpecificationExecutor<Product> {
    
    List<Product> findByProductNameContainingIgnoreCase(String keyword);

}
