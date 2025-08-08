package com.suriname.product.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.suriname.product.entity.Product;
import org.springframework.data.jpa.repository.Query;

<<<<<<< HEAD
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByModelCodeAndSerialNumber(String modelCode, String serialNumber);
=======
public interface ProductRepository extends JpaRepository<Product, Long>,
JpaSpecificationExecutor<Product> {
    
    List<Product> findByProductNameContainingIgnoreCase(String keyword);

    @Query(value = """
        SELECT 
            p.product_id AS productID,
            p.product_name AS productName, 
            c.name AS categoryName, 
            p.product_brand AS productBrand, 
            p.model_code AS modelCode
        FROM product p
        JOIN category c ON p.category_id = c.category_id
    """, nativeQuery = true)
    List<Object[]> findProductWithCategoryInfo();
>>>>>>> 4061aef18b1e5b63022891ef5b6e82873081e963
}
