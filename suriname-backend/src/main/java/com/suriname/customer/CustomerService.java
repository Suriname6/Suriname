package com.suriname.customer;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.suriname.category.Category;
import com.suriname.category.CategoryRepository;
import com.suriname.product.CustomerProduct;
import com.suriname.product.CustomerProductRepository;
import com.suriname.product.Product;
import com.suriname.product.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CustomerProductRepository customerProductRepository;

    @Transactional
    public Map<String, Long> registerCustomer(CustomerRegisterDto dto) {
        
    	// 1. 고객 저장
        Customer customer = new Customer();
        customer.setName(dto.getName());
        customer.setPhone(dto.getPhone());
        customer.setEmail(dto.getEmail());
        customer.setAddress(dto.getAddress());
        customer.setBirth(dto.getBirth());
        customer.setStatus(CustomerStatus.ACTIVE);
        customer.setCreatedAt(Timestamp.valueOf(LocalDateTime.now()));
        customer.setUpdatedAt(Timestamp.valueOf(LocalDateTime.now()));
        customerRepository.save(customer);

        // 2. 제품 저장 또는 조회
        Product product;
        if (dto.getProduct().getProductId() != null) {
            product = productRepository.findById(dto.getProduct().getProductId())
                    .orElseThrow(() -> new RuntimeException("제품 없음"));
        } else {
            product = new Product();
            product.setProductName(dto.getProduct().getProductName());
            product.setProductBrand(dto.getProduct().getProductBrand());
            product.setModelCode(dto.getProduct().getModelCode());
            product.setSerialNumber(dto.getProduct().getSerialNumber());
            product.setIsVisible(true);
            product.setCreatedAt(LocalDateTime.now());
            product.setUpdatedAt(LocalDateTime.now());

            // 카테고리 연동
            Category category = categoryRepository.findByName(dto.getProduct().getCategoryName())
                    .orElseThrow(() -> new RuntimeException("카테고리 없음"));
            product.setCategory(category);

            productRepository.save(product);
        }

        // 3. 고객 보유 제품 연결
        CustomerProduct cp = new CustomerProduct();
        cp.setCustomer(customer);
        cp.setProduct(product);
        cp.setCreatedAt(Timestamp.valueOf(LocalDateTime.now()));
        cp.setUpdatedAt(Timestamp.valueOf(LocalDateTime.now()));
        customerProductRepository.save(cp);

        return Map.of("customerId", customer.getCustomerId(), "customerProductId", cp.getCustomerProductId());
    }

    public Page<Customer> getAll(Pageable pageable) {
        return customerRepository.findAllByStatus(CustomerStatus.ACTIVE, pageable);
    }
    
    // 상세 조회
    public Customer getDetail(Long id) {
        return customerRepository.findById(id)
                .filter(c -> c.getStatus() == CustomerStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("고객 없음"));
    }

    // 수정
    @Transactional
    public void update(Long id, CustomerRegisterDto dto) {
        Customer customer = getDetail(id);
        customer.setName(dto.getName());
        customer.setPhone(dto.getPhone());
        customer.setEmail(dto.getEmail());
        customer.setAddress(dto.getAddress());
        customer.setBirth(dto.getBirth());
        customer.setUpdatedAt(Timestamp.valueOf(LocalDateTime.now()));
        customerRepository.save(customer);
    }

    // 소프트 삭제
    @Transactional
    public void softDelete(Long id) {
        Customer customer = getDetail(id);
        customer.setStatus(CustomerStatus.INACTIVE);
        customer.setUpdatedAt(Timestamp.valueOf(LocalDateTime.now()));
        customerRepository.save(customer);
    }
}

