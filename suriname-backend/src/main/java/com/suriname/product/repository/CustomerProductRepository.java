package com.suriname.product.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.suriname.customer.entity.Customer;
import com.suriname.product.entity.CustomerProduct;

public interface CustomerProductRepository extends JpaRepository<CustomerProduct, Long> {
	Optional<CustomerProduct> findTopByCustomerOrderByCreatedAtDesc(Customer customer);

}