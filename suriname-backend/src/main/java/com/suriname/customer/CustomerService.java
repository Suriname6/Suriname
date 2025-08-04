package com.suriname.customer;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.suriname.category.Category;
import com.suriname.category.CategoryRepository;
import com.suriname.product.CustomerProduct;
import com.suriname.product.CustomerProductRepository;
import com.suriname.product.Product;
import com.suriname.product.ProductDto;
import com.suriname.product.ProductRepository;

import jakarta.persistence.EntityNotFoundException;
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
                customer.getBirth() != null ? customer.getBirth().toString() : null,
                customer.getAddress(),

                (product != null) ? product.getProductName() : null,
                (product != null && product.getCategory() != null) ? product.getCategory().getName() : null,
                (product != null) ? product.getProductBrand() : null,
                (product != null) ? product.getModelCode() : null,
                (product != null) ? product.getSerialNumber() : null
            );
        });
    }


    public CustomerDetailDto getDetailDto(Long id) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("고객을 찾을 수 없습니다."));

        List<ProductDto> products = customer.getCustomerProducts().stream()
            .map(cp -> {
                Product p = cp.getProduct();
                return new ProductDto(
                    p.getProductId(),
                    p.getProductName(),
                    p.getCategory().getName(),
                    p.getProductBrand(),
                    p.getModelCode(),
                    p.getSerialNumber()
                );
            }).toList();

        CustomerDetailDto dto = new CustomerDetailDto();
        dto.setCustomerId(customer.getCustomerId());
        dto.setName(customer.getName());
        dto.setEmail(customer.getEmail());
        dto.setPhone(customer.getPhone());
        dto.setAddress(customer.getAddress());
        dto.setBirth(customer.getBirth().toString());
        dto.setStatus(customer.getStatus().name());
        dto.setProducts(products);

        return dto;
    }



    // 수정
    @Transactional
    public void update(Long id, CustomerRegisterDto dto) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("해당 고객을 찾을 수 없습니다."));

        customer.update(
            dto.getName(),
            dto.getEmail(),
            dto.getPhone(),
            dto.getAddress(),
            dto.getBirth()
        );

    }

    // 삭제
    @Transactional
    public void softDelete(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> new RuntimeException("고객을 찾을 수 없습니다."));
        customer.markAsDeleted();
        customerRepository.save(customer);
    }

    
    // 검색
    public Page<CustomerListDto> searchCustomerDtos(CustomerSearchDto dto, Pageable pageable) {
        Page<Customer> result = customerRepository.findAll(CustomerSpecification.searchWith(dto), pageable);

        return result.map(customer -> {
            CustomerProduct cp = customerProductRepository
                    .findTopByCustomerOrderByCreatedAtDesc(customer)
                    .orElse(null);
            Product product = (cp != null) ? cp.getProduct() : null;

            return new CustomerListDto(
                    customer.getCustomerId(),
                    customer.getName(),
                    customer.getPhone(),
                    customer.getEmail(),
                    customer.getBirth() != null ? customer.getBirth().toString() : null,
                    customer.getAddress(),

                    (product != null) ? product.getProductName() : null,
                    (product != null && product.getCategory() != null) ? product.getCategory().getName() : null,
                    (product != null) ? product.getProductBrand() : null,
                    (product != null) ? product.getModelCode() : null,
                    (product != null) ? product.getSerialNumber() : null
            );
        });
    }

} 