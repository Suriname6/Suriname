package com.suriname.customer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface CustomerRepository extends JpaRepository<Customer, Long>, JpaSpecificationExecutor<Customer> {
	
	@Query("SELECT c FROM Customer c WHERE c.isDeleted = false AND c.status = :status")
	Page<Customer> findAllByStatus(Customer.Status status, Pageable pageable);

}
