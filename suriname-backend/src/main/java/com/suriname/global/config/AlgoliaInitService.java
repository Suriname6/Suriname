package com.suriname.global.config;

import com.algolia.api.SearchClient;
import com.algolia.model.search.IndexSettings;
// Ranking enum은 문자열로 직접 사용
import com.suriname.customer.dto.CustomerListDto;
import com.suriname.product.dto.ProductListDto;
import com.suriname.product.dto.ProductSearchDto;
import com.suriname.product.repository.CustomerProductRepository;
import com.suriname.product.repository.ProductRepository;
import io.github.cdimascio.dotenv.Dotenv;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

import java.math.BigInteger;
import java.sql.Date;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlgoliaInitService {

    private final CustomerProductRepository customerProductRepository;
    private final ProductRepository productRepository;
    
    // Algolia 설정
    private static final String CUSTOMER_INDEX_NAME = "customers";
    private static final String PRODUCT_INDEX_NAME = "products";
    private SearchClient client;
    private String algoliaAppId;
    private String algoliaAdminKey;

    @PostConstruct
    public void initializeAlgolia() {
        try {
            // 환경 변수에서 Algolia 설정 로드
            loadAlgoliaConfig();
            
            // Algolia 클라이언트 초기화
            initializeAlgoliaClient();
            
            // 인덱스 설정
            configureIndex();
            
            // 데이터 인덱싱
            indexCustomerData();
            
            log.info("Algolia 초기화가 완료되었습니다.");
        } catch (Exception e) {
            log.error("Algolia 초기화 중 오류가 발생했습니다: {}", e.getMessage(), e);
        }
    }

    private void loadAlgoliaConfig() {
        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory(".")
                    .filename(".env.properties")
                    .load();
            
            algoliaAppId = dotenv.get("ALGOLIA_APP_ID");
            algoliaAdminKey = dotenv.get("ALGOLIA_ADMIN_KEY"); // Admin Key 필요 (인덱싱용)
            log.info("Loaded ALGOLIA_APP_ID: {}", algoliaAppId);
            log.info("Loaded ALGOLIA_ADMIN_KEY: {}", algoliaAdminKey);
            if (algoliaAppId == null || algoliaAdminKey == null) {
                throw new IllegalStateException("Algolia 설정이 env.properties에 없습니다.");
            }
            
            log.info("Algolia 설정을 로드했습니다. App ID: {}", algoliaAppId);
        } catch (Exception e) {
            log.error("Algolia 설정 로드 중 오류: {}", e.getMessage());
            throw e;
        }
    }

    private void initializeAlgoliaClient() {
        client = new SearchClient(algoliaAppId, algoliaAdminKey);
        log.info("Algolia 클라이언트를 초기화했습니다.");
    }

    private void configureIndex() {
        List<String> COMMON_RANKING = Arrays.asList(
                "typo", "geo", "words", "filters", "proximity", "attribute", "exact", "custom"
        );

        try {
            // 인덱스 설정
            IndexSettings createCustomerIndexSettings = new IndexSettings()
                    .setSearchableAttributes(Arrays.asList(
                            "customerName", "phone", "email", "address",
                            "productName", "productBrand", "modelCode", "serialNumber"
                    ))
                    .setAttributesForFaceting(Arrays.asList(
                            "productBrand",
                            "categoryName"
                    ))
                    .setRanking(COMMON_RANKING);

            IndexSettings createProductIndexSettings = new IndexSettings()
                    .setSearchableAttributes(Arrays.asList(
                            "categoryName", "productName", "productBrand", "modelCode"
                    ))
                    .setAttributesForFaceting(Arrays.asList(
                            "productBrand",
                            "categoryName"
                    ))
                    .setRanking(COMMON_RANKING);

            client.setSettings(CUSTOMER_INDEX_NAME, createCustomerIndexSettings);
            client.setSettings(PRODUCT_INDEX_NAME, createProductIndexSettings);
            log.info("Algolia 인덱스 설정을 완료했습니다.");
        } catch (Exception e) {
            log.error("인덱스 설정 중 오류: {}", e.getMessage());
            throw e;
        }
    }

    private void indexCustomerData() {
        try {
            // 데이터베이스에서 고객 데이터 조회
            List<CustomerListDto> customerList = customerProductRepository.findCustomerRaw()
                    .stream()
                    .map(row -> new CustomerListDto(
                            ((Long) row[0]), // customerId
                            (String) row[1], // customerName
                            (String) row[2], // phone
                            (String) row[3], // email
                            ((Date) row[4]).toLocalDate().toString(), // birth
                            (String) row[5], // address
                            (String) row[6], // productName
                            (String) row[7], // categoryName
                            (String) row[8], // productBrand
                            (String) row[9], // modelCode
                            (String) row[10] // serialNumber
                    ))
                    .toList();

            if (customerList.isEmpty()) {
                log.warn("인덱싱할 고객 데이터가 없습니다.");
                return;
            }

            List<ProductListDto> productList = productRepository.findProductWithCategoryInfo()
                    .stream()
                    .map(row -> new ProductListDto(
                            ((Long) row[0]), // productId
                            (String) row[1], // productName
                            (String) row[2], // categoryName
                            (String) row[3], // productBrand
                            (String) row[4]  // modelCode
                    ))
                    .toList();

            // DTO를 Algolia 문서 형태로 변환
            List<Map<String, Object>> customerDocuments = customerList.stream()
                    .map(this::convertToCustomerDocument)
                    .toList();

            List<Map<String, Object>> productDocuments = productList.stream()
                    .map(this::convertToProductDocument)
                    .toList();

            // 기존 인덱스 데이터 삭제 후 새로 추가
            client.clearObjects(CUSTOMER_INDEX_NAME);
            client.clearObjects(PRODUCT_INDEX_NAME);
            log.info("기존 인덱스 데이터를 삭제했습니다.");

            // 새 데이터 배치 인덱싱
            client.saveObjects(CUSTOMER_INDEX_NAME, customerDocuments);
            log.info("{}건의 고객 데이터를 Algolia에 인덱싱했습니다.", customerDocuments.size());
            log.info("보낼 customerDocuments 전체 내용:\n{}", customerDocuments);
            client.saveObjects(PRODUCT_INDEX_NAME, productDocuments);
            log.info("{}건의 제품 데이터를 Algolia에 인덱싱했습니다.", productDocuments.size());
            log.info("보낼 productDocuments 전체 내용:\n{}", productDocuments);

        } catch (Exception e) {
            log.error("데이터 인덱싱 중 오류: {}", e.getMessage());
            throw e;
        }
    }

    private Map<String, Object> convertToCustomerDocument(CustomerListDto dto) {
        Map<String, Object> document = new HashMap<>();
        
        // 고객 정보
        document.put("objectID", dto.getCustomerId() + "-" + dto.getModelCode());
        document.put("customerId", dto.getCustomerId());
        document.put("customerName", dto.getCustomerName());
        document.put("phone", dto.getPhone());
        document.put("email", dto.getEmail());
        document.put("birth", dto.getBirth());
        document.put("address", dto.getAddress());
        
        // 제품 정보
        document.put("productName", dto.getProductName());
        document.put("categoryName", dto.getCategoryName());
        document.put("productBrand", dto.getProductBrand());
        document.put("modelCode", dto.getModelCode());
        document.put("serialNumber", dto.getSerialNumber());
        
        return document;
    }

    private Map<String, Object> convertToProductDocument(ProductListDto dto) {
        Map<String, Object> document = new HashMap<>();

        document.put("objectID", dto.getProductId().toString());
        // 제품 정보
        document.put("productName", dto.getProductName());
        document.put("categoryName", dto.getCategoryName());
        document.put("productBrand", dto.getProductBrand());
        document.put("modelCode", dto.getModelCode());

        return document;
    }

    // 수동으로 인덱스를 재생성하고 싶을 때 사용할 수 있는 메소드
    public void reindexData() {
        log.info("수동 재인덱싱을 시작합니다.");
        indexCustomerData();
    }
}