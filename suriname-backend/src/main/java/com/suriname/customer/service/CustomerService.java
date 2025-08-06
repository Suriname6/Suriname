package com.suriname.customer.service;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.suriname.category.entity.Category;
import com.suriname.category.repository.CategoryRepository;
import com.suriname.customer.dto.CustomerDetailDto;
import com.suriname.customer.dto.CustomerListDto;
import com.suriname.customer.dto.CustomerRegisterDto;
import com.suriname.customer.dto.CustomerSearchDto;
import com.suriname.customer.entity.Customer;
import com.suriname.customer.entity.CustomerSpecification;
import com.suriname.customer.repository.CustomerRepository;
import com.suriname.product.dto.CustomerProductDto;
import com.suriname.product.entity.CustomerProduct;
import com.suriname.product.entity.Product;
import com.suriname.product.repository.CustomerProductRepository;
import com.suriname.product.repository.ProductRepository;

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
        CustomerProduct cp = new CustomerProduct(customer, product, dto.getProduct().getSerialNumber());
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

            CustomerProductDto cpDto = (cp != null) ? CustomerProductDto.fromEntity(cp) : null;

            return new CustomerListDto(
                customer.getCustomerId(),
                customer.getName(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getBirth() != null ? customer.getBirth().toString() : null,
                customer.getAddress(),
                cpDto
            );
        });
    }


    public CustomerDetailDto getDetailDto(Long id) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("고객을 찾을 수 없습니다."));

        CustomerProductDto productDto = customerProductRepository.findTopByCustomerOrderByCreatedAtDesc(customer).stream()
            .findFirst()
            .map(CustomerProductDto::fromEntity)
            .orElse(null);

        return new CustomerDetailDto(
            customer.getCustomerId(),
            customer.getName(),
            customer.getEmail(),
            customer.getPhone(),
            customer.getAddress(),
            customer.getBirth().toString(),
            customer.getStatus().name(),
            productDto
        );
    }


    // 수정
    @Transactional
    public void updateCustomer(Long customerId, CustomerRegisterDto dto) {
        // 고객 조회
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("고객을 찾을 수 없습니다."));

        // 고객 기본 정보 수정
        customer.update(
                dto.getName(),
                dto.getEmail(),
                dto.getPhone(),
                dto.getAddress(),
                dto.getBirth()
        );

        // CustomerProduct 정보 수정
        CustomerProductDto productDto = dto.getProduct();
        if (productDto != null) {
            boolean isValidProduct =
                    (productDto.getProductId() != null) &&
                    (productDto.getSerialNumber() != null && !productDto.getSerialNumber().isBlank());

            if (isValidProduct) {
                // 기존 CustomerProduct 조회
                CustomerProduct customerProduct = customerProductRepository
                        .findTopByCustomerOrderByCreatedAtDesc(customer)
                        .orElseThrow(() -> new RuntimeException("고객의 제품 정보가 없습니다."));

                // 기존 Product 조회 
                Product product = productRepository.findById(productDto.getProductId())
                        .orElseThrow(() -> new RuntimeException("제품을 찾을 수 없습니다."));

                // CustomerProduct에만 시리얼 넘버 갱신
                customerProduct.updateCustomerAndProduct(customer, product, productDto.getSerialNumber());
                customerProductRepository.save(customerProduct);
            }
        }

        customerRepository.save(customer);
    }



    // 단건 삭제
    @Transactional
    public void softDelete(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> new RuntimeException("고객을 찾을 수 없습니다."));
        customer.markAsDeleted();
        customerRepository.save(customer);
    }
    // 다건 삭제
    @Transactional
    public void softDelete(List<Long> customerIds) {
        for (Long customerId : customerIds) {
            Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("고객을 찾을 수 없습니다. ID: " + customerId));
            customer.markAsDeleted();
            customerRepository.save(customer);
        }
    }

    
    // 검색
    public Page<CustomerListDto> searchCustomerDtos(CustomerSearchDto dto, Pageable pageable) {
        Page<Customer> result = customerRepository.findAll(CustomerSpecification.searchWith(dto), pageable);

        return result.map(customer -> {
            CustomerProduct cp = customerProductRepository
                    .findTopByCustomerOrderByCreatedAtDesc(customer)
                    .orElse(null);

            CustomerProductDto cpDto = (cp != null) ? CustomerProductDto.fromEntity(cp) : null;

            return new CustomerListDto(
                customer.getCustomerId(),
                customer.getName(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getBirth() != null ? customer.getBirth().toString() : null,
                customer.getAddress(),
                cpDto
            );
        });
    }


} 