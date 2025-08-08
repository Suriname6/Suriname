package com.suriname.product.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.suriname.customer.entity.Customer;
import com.suriname.product.entity.CustomerProduct;
import org.springframework.data.jpa.repository.Query;

public interface CustomerProductRepository extends JpaRepository<CustomerProduct, Long> {
	Optional<CustomerProduct> findTopByCustomerOrderByCreatedAtDesc(Customer customer);

	@Query(value = """
		SELECT 
		  c.customer_id AS customerId,
		  c.name AS customerName,
		  c.phone AS phone,
		  c.email AS email,
		  c.birth AS birth,
		  c.address AS address,
		  p.product_name AS productName,
		  cg.name AS categoryName,
		  p.product_brand AS productBrand,
		  p.model_code AS modelCode,
		  cp.serial_number AS serialNumber
		FROM customer_product cp
		JOIN customer c ON cp.customer_id = c.customer_id
		JOIN product p ON cp.product_id = p.product_id
		LEFT JOIN category cg ON p.category_id = cg.category_id
		WHERE c.is_deleted = FALSE
	""", nativeQuery = true)
	List<Object[]> findCustomerRaw();

	List<CustomerProduct> findByCustomerCustomerId(Long customerId);
}