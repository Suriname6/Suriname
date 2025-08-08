package com.suriname.customer.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.suriname.category.entity.Category;
import com.suriname.category.entity.CategoryRepository;
import com.suriname.customer.dto.CustomerDetailDto;
import com.suriname.customer.dto.CustomerListDto;
import com.suriname.customer.dto.CustomerRegisterDto;
import com.suriname.customer.dto.CustomerSearchDto;
import com.suriname.customer.entity.Customer;
import com.suriname.customer.entity.CustomerSpecification;
import com.suriname.customer.repository.CustomerRepository;
import com.suriname.product.dto.ProductDto;
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

<<<<<<< HEAD
        // 고객 보유 제품 연결
        CustomerProduct cp = CustomerProduct.builder()
                .customer(customer)
                .product(product)
                .build();
=======
        CustomerProduct cp = new CustomerProduct(customer, product, dto.getProduct().getSerialNumber());
>>>>>>> 4061aef18b1e5b63022891ef5b6e82873081e963
        customerProductRepository.save(cp);

        return Map.of(
                "customerId", customer.getCustomerId(),
                "customerProductId", cp.getCustomerProductId()
        );
    }

    public Page<CustomerListDto> getAll(Pageable pageable) {
        Page<Customer> customers = customerRepository.findAllByStatus(Customer.Status.ACTIVE, pageable);

        return customers.map(customer -> {
<<<<<<< HEAD
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
=======
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
>>>>>>> 4061aef18b1e5b63022891ef5b6e82873081e963
            );
        });
    }

    public CustomerDetailDto getDetailDto(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("고객을 찾을 수 없습니다."));

<<<<<<< HEAD
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
    public void updateCustomer(Long customerId, CustomerRegisterDto dto) {
    	// 1. 기존 고객 찾기
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("고객을 찾을 수 없습니다."));
        
        // 2. 고객 기본 정보 수정
=======
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

>>>>>>> 4061aef18b1e5b63022891ef5b6e82873081e963
        customer.update(
                dto.getName(),
                dto.getEmail(),
                dto.getPhone(),
                dto.getAddress(),
                dto.getBirth()
        );

<<<<<<< HEAD
        // 3. 제품 정보가 있을 경우에만 수정
        ProductDto productDto = dto.getProduct();

        if (productDto != null) {
            boolean isValidProduct =
                    (productDto.getProductName() != null && !productDto.getProductName().isBlank()) ||
                    (productDto.getModelCode() != null && !productDto.getModelCode().isBlank());
=======
        CustomerProductDto productDto = dto.getProduct();
        if (productDto != null) {
            boolean isValidProduct = productDto.getProductId() != null &&
                    productDto.getSerialNumber() != null && !productDto.getSerialNumber().isBlank();

>>>>>>> 4061aef18b1e5b63022891ef5b6e82873081e963
            if (isValidProduct) {
                CustomerProduct customerProduct = customerProductRepository
                        .findTopByCustomerOrderByCreatedAtDesc(customer)
                        .orElseThrow(() -> new RuntimeException("고객의 제품 정보가 없습니다."));
                Product product = customerProduct.getProduct();

<<<<<<< HEAD
                Category category = product.getCategory(); // 기본 유지
                if (productDto.getCategoryName() != null && !productDto.getCategoryName().isBlank()) {
                    category = categoryRepository.findByName(productDto.getCategoryName())
                            .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));
                }

                product.updateProduct(
                        productDto.getProductName(),
                        productDto.getProductBrand(),
                        productDto.getModelCode(),
                        productDto.getSerialNumber(),
                        category 
                        );
                productRepository.save(product);
=======
                Product product = productRepository.findById(productDto.getProductId())
                        .orElseThrow(() -> new RuntimeException("제품을 찾을 수 없습니다."));

                customerProduct.updateCustomerAndProduct(customer, product, productDto.getSerialNumber());
                customerProductRepository.save(customerProduct);
>>>>>>> 4061aef18b1e5b63022891ef5b6e82873081e963
            }
        }
        customerRepository.save(customer);
    }

<<<<<<< HEAD



    // 삭제
=======
>>>>>>> 4061aef18b1e5b63022891ef5b6e82873081e963
    @Transactional
    public void softDelete(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("고객을 찾을 수 없습니다."));
        customer.markAsDeleted();
        customerRepository.save(customer);
    }
<<<<<<< HEAD
=======

    @Transactional
    public void softDelete(List<Long> customerIds) {
        for (Long customerId : customerIds) {
            Customer customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("고객을 찾을 수 없습니다. ID: " + customerId));
            customer.markAsDeleted();
            customerRepository.save(customer);
        }
    }
>>>>>>> 4061aef18b1e5b63022891ef5b6e82873081e963

    public Page<CustomerListDto> searchCustomerDtos(CustomerSearchDto dto, Pageable pageable) {
        Page<Customer> result = customerRepository.findAll(CustomerSpecification.searchWith(dto), pageable);

        return result.map(customer -> {
<<<<<<< HEAD
            CustomerProduct cp = customerProductRepository
                    .findTopByCustomerOrderByCreatedAtDesc(customer)
                    .orElse(null);
            Product product = (cp != null) ? cp.getProduct() : null;

=======
            CustomerProduct cp = customerProductRepository.findTopByCustomerOrderByCreatedAtDesc(customer).orElse(null);
>>>>>>> 4061aef18b1e5b63022891ef5b6e82873081e963
            return new CustomerListDto(
                    customer.getCustomerId(),
                    customer.getName(),
                    customer.getPhone(),
                    customer.getEmail(),
                    customer.getBirth() != null ? customer.getBirth().toString() : null,
                    customer.getAddress(),
<<<<<<< HEAD

                    (product != null) ? product.getProductName() : null,
                    (product != null && product.getCategory() != null) ? product.getCategory().getName() : null,
                    (product != null) ? product.getProductBrand() : null,
                    (product != null) ? product.getModelCode() : null,
                    (product != null) ? product.getSerialNumber() : null
=======
                    cp != null ? cp.getProduct().getProductName() : null,
                    cp != null ? cp.getProduct().getCategory().getName() : null,
                    cp != null ? cp.getProduct().getProductBrand() : null,
                    cp != null ? cp.getProduct().getModelCode() : null,
                    cp != null ? cp.getSerialNumber() : null
>>>>>>> 4061aef18b1e5b63022891ef5b6e82873081e963
            );
        });
    }

<<<<<<< HEAD
} 
=======
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

    // 고객명 존재 여부 확인
    public boolean existsByName(String name) {
        return customerRepository.findByName(name).isPresent();
    }
} 
>>>>>>> 4061aef18b1e5b63022891ef5b6e82873081e963
