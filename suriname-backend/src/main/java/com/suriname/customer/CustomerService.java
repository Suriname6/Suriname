package com.suriname.customer;

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

        // 고객 저장
        Customer customer = Customer.builder()
                .name(dto.getName())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .address(dto.getAddress())
                .birth(dto.getBirth())
                .build();

        customerRepository.save(customer);

        // 제품 저장 또는 조회
        Product product;
        if (dto.getProduct().getProductId() != null) {
            product = productRepository.findById(dto.getProduct().getProductId())
                    .orElseThrow(() -> new RuntimeException("제품 없음"));
        } else {
            // 새 제품 등록
            Category category = categoryRepository.findByName(dto.getProduct().getCategoryName())
                    .orElseThrow(() -> new RuntimeException("카테고리 없음"));

            product = Product.builder()
                    .productName(dto.getProduct().getProductName())
                    .productBrand(dto.getProduct().getProductBrand())
                    .modelCode(dto.getProduct().getModelCode())
                    .serialNumber(dto.getProduct().getSerialNumber())
                    .isVisible(true)
                    .category(category)
                    .build();

            productRepository.save(product);
        }

        // 고객-제품 연결 
        CustomerProduct cp = CustomerProduct.builder()
                .customer(customer)
                .product(product)
                .build();

        customerProductRepository.save(cp);

        return Map.of(
                "customerId", customer.getCustomerId(),
                "customerProductId", cp.getCustomerProductId()
        );
    }

    public Page<Customer> getAll(Pageable pageable) {
        return customerRepository.findAllByStatus(Customer.Status.ACTIVE, pageable);
    }

    public Customer getDetail(Long id) {
        return customerRepository.findById(id)
                .filter(c -> c.getStatus() == Customer.Status.ACTIVE)
                .orElseThrow(() -> new RuntimeException("고객 없음"));
    }


    // 삭제
    @Transactional
    public void softDelete(Long id) {
        Customer customer = getDetail(id);
        customer.markAsInactive();
        customerRepository.save(customer);
    }
}
