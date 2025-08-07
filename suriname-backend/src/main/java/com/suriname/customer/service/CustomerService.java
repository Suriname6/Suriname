package com.suriname.customer.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
        Customer customer = Customer.builder()
                .name(dto.getName())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .address(dto.getAddress())
                .birth(dto.getBirth())
                .build();
        customerRepository.save(customer);

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
            CustomerProduct cp = customerProductRepository.findTopByCustomerOrderByCreatedAtDesc(customer).orElse(null);
            return new CustomerListDto(
                    customer.getCustomerId(),
                    customer.getName(),
                    customer.getPhone(),
                    customer.getEmail(),
                    customer.getBirth() != null ? customer.getBirth().toString() : null,
                    customer.getAddress(),
                    cp != null ? cp.getProduct().getProductName() : null,
                    cp != null ? cp.getProduct().getCategory().getName() : null,
                    cp != null ? cp.getProduct().getProductBrand() : null,
                    cp != null ? cp.getProduct().getModelCode() : null,
                    cp != null ? cp.getSerialNumber() : null
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
                customer.getBirth() != null ? customer.getBirth().toString() : null,
                customer.getStatus().name(),
                productDto
        );
    }

    @Transactional
    public void updateCustomer(Long customerId, CustomerRegisterDto dto) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("고객을 찾을 수 없습니다."));

        customer.update(
                dto.getName(),
                dto.getEmail(),
                dto.getPhone(),
                dto.getAddress(),
                dto.getBirth()
        );

        CustomerProductDto productDto = dto.getProduct();
        if (productDto != null) {
            boolean isValidProduct = productDto.getProductId() != null &&
                    productDto.getSerialNumber() != null && !productDto.getSerialNumber().isBlank();

            if (isValidProduct) {
                CustomerProduct customerProduct = customerProductRepository
                        .findTopByCustomerOrderByCreatedAtDesc(customer)
                        .orElseThrow(() -> new RuntimeException("고객의 제품 정보가 없습니다."));

                Product product = productRepository.findById(productDto.getProductId())
                        .orElseThrow(() -> new RuntimeException("제품을 찾을 수 없습니다."));

                customerProduct.updateCustomerAndProduct(customer, product, productDto.getSerialNumber());
                customerProductRepository.save(customerProduct);
            }
        }

        customerRepository.save(customer);
    }

    @Transactional
    public void softDelete(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("고객을 찾을 수 없습니다."));
        customer.markAsDeleted();
        customerRepository.save(customer);
    }

    @Transactional
    public void softDelete(List<Long> customerIds) {
        for (Long customerId : customerIds) {
            Customer customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("고객을 찾을 수 없습니다. ID: " + customerId));
            customer.markAsDeleted();
            customerRepository.save(customer);
        }
    }

    public Page<CustomerListDto> searchCustomerDtos(CustomerSearchDto dto, Pageable pageable) {
        Page<Customer> result = customerRepository.findAll(CustomerSpecification.searchWith(dto), pageable);

        return result.map(customer -> {
            CustomerProduct cp = customerProductRepository.findTopByCustomerOrderByCreatedAtDesc(customer).orElse(null);
            return new CustomerListDto(
                    customer.getCustomerId(),
                    customer.getName(),
                    customer.getPhone(),
                    customer.getEmail(),
                    customer.getBirth() != null ? customer.getBirth().toString() : null,
                    customer.getAddress(),
                    cp != null ? cp.getProduct().getProductName() : null,
                    cp != null ? cp.getProduct().getCategory().getName() : null,
                    cp != null ? cp.getProduct().getProductBrand() : null,
                    cp != null ? cp.getProduct().getModelCode() : null,
                    cp != null ? cp.getSerialNumber() : null
            );
        });
    }

    public List<CustomerDetailDto> autocompleteCustomers(String keyword) {
        List<Customer> matched = customerRepository.searchAutoComplete(keyword, Customer.Status.ACTIVE);
        return matched.stream()
                .map(customer -> {
                    CustomerProduct cp = customerProductRepository.findTopByCustomerOrderByCreatedAtDesc(customer).orElse(null);
                    CustomerProductDto cpDto = (cp != null) ? CustomerProductDto.fromEntity(cp) : null;

                    return new CustomerDetailDto(
                            customer.getCustomerId(),
                            customer.getName(),
                            customer.getEmail(),
                            customer.getPhone(),
                            customer.getAddress(),
                            customer.getBirth() != null ? customer.getBirth().toString() : null,
                            customer.getStatus().name(),
                            cpDto
                    );
                })
                .collect(Collectors.toList());
    }
}
