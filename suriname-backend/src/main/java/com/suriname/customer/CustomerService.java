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
import lombok.extern.slf4j.Slf4j;

@Slf4j
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
    public void updateCustomer(Long customerId, CustomerRegisterDto dto) {
    	log.info("🔧 [고객 수정 시작] customerId: {}, dto: {}", customerId, dto);
    	// 1. 기존 고객 찾기
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("고객을 찾을 수 없습니다."));
        log.info("✅ 고객 조회 성공: {}", customer.getName());
        
        // 2. 고객 기본 정보 수정
        customer.update(
                dto.getName(),
                dto.getEmail(),
                dto.getPhone(),
                dto.getAddress(),
                dto.getBirth()
        );
        log.info("📝 고객 기본 정보 수정 완료");

        // 3. 제품 정보가 있을 경우에만 수정
        ProductDto productDto = dto.getProduct();
        log.info("📦 받은 제품 정보: {}", productDto);

        if (productDto != null) {
            boolean isValidProduct =
                    (productDto.getProductName() != null && !productDto.getProductName().isBlank()) ||
                    (productDto.getModelCode() != null && !productDto.getModelCode().isBlank());
            log.info("✅ 제품 유효성: {}", isValidProduct);
            if (isValidProduct) {
                CustomerProduct customerProduct = customerProductRepository
                        .findTopByCustomerOrderByCreatedAtDesc(customer)
                        .orElseThrow(() -> new RuntimeException("고객의 제품 정보가 없습니다."));
                log.info("🔄 고객 최신 제품 정보 가져오기 완료");
                Product product = customerProduct.getProduct();

                Category category = product.getCategory(); // 기본 유지
                if (productDto.getCategoryName() != null && !productDto.getCategoryName().isBlank()) {
                    category = categoryRepository.findByName(productDto.getCategoryName())
                            .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));
                    log.info("📂 카테고리 조회 완료: {}", category.getName());
                }

                product.updateProduct(
                        productDto.getProductName(),
                        productDto.getProductBrand(),
                        productDto.getModelCode(),
                        productDto.getSerialNumber(),
                        category 
                        );
                log.info("🛠️ 제품 정보 수정 완료: {}", product.getProductName());
                productRepository.save(product);
                log.info("💾 제품 저장 완료");
            }
        }
        customerRepository.save(customer);
        log.info("💾 고객 저장 완료");
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