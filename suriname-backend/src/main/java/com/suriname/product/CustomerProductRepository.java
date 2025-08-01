package com.suriname.product;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.suriname.customer.Customer;

public interface CustomerProductRepository extends JpaRepository<CustomerProduct, Long> {
	Optional<CustomerProduct> findTopByCustomerOrderByCreatedAtDesc(Customer customer);

}