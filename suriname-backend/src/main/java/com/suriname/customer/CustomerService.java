package com.suriname.customer;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
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

        // 제품 저장/조회
        Product product;
        if (dto.getProduct().getProductId() != null) {
            product = productRepository.findById(dto.getProduct().getProductId())
                    .orElseThrow(() -> new RuntimeException("제품 없음"));
        } else {
            Category category = categoryRepository.findByName(dto.getProduct().getCategoryName())
                    .orElseThrow(() -> new RuntimeException("카테고리 없음"));

            product = Product.builder()
                    .productName(dto.getProduct().getProductName())
                    .productBrand(dto.getProduct().getProductBrand())
                    .modelCode(dto.getProduct().getModelCode())
                    .serialNumber(dto.getProduct().getSerialNumber())
                    .category(category)
                    .build();

            productRepository.save(product);
        }

        // 고객 보유 제품 연결
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

    public Page<CustomerListDto> getAll(Pageable pageable) {
        Page<Customer> customers = customerRepository.findAllByStatus(Customer.Status.ACTIVE, pageable);

        return customers.map(customer -> {
            CustomerProduct cp = customerProductRepository
                    .findTopByCustomerOrderByCreatedAtDesc(customer)
                    .orElse(null);
            Product product = (cp != null) ? cp.getProduct() : null;

            return new CustomerListDto(
                customer.getCustomerId(),
                customer.getName(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getBirth().toString(),
                customer.getAddress(),

                (product != null) ? product.getProductName() : null,
                (product != null && product.getCategory() != null) ? product.getCategory().getName() : null,
                (product != null) ? product.getProductBrand() : null,
                (product != null) ? product.getModelCode() : null,
                (product != null) ? product.getSerialNumber() : null
            );
        });
    }


    public Customer getDetail(Long id) {
        return customerRepository.findById(id)
                .filter(c -> c.getStatus() == Customer.Status.ACTIVE)
                .orElseThrow(() -> new RuntimeException("고객 없음"));
    }

    @Transactional
    public void update(Long id, CustomerRegisterDto dto) {
        Customer customer = getDetail(id);
        customer.update(dto.getName(), dto.getEmail(), dto.getPhone(), dto.getAddress(), dto.getBirth());
        customerRepository.save(customer);
    }

    @Transactional
    public void softDelete(Long id) {
        Customer customer = getDetail(id);
        customer.markAsInactive();
        customerRepository.save(customer);
    }
} 