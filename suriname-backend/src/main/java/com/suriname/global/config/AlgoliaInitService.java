package com.suriname.global.config;

import com.algolia.api.SearchClient;
import com.algolia.model.search.IndexSettings;
// Ranking enum은 문자열로 직접 사용
import com.suriname.customer.dto.CustomerListDto;
import com.suriname.product.repository.CustomerProductRepository;
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
    
    // Algolia 설정
    private static final String INDEX_NAME = "customers";
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
        try {
            // 인덱스 설정
            IndexSettings settings = new IndexSettings()
                    .setSearchableAttributes(Arrays.asList(
                            "customerName",
                            "phone",
                            "email", 
                            "address",
                            "productName",
                            "productBrand",
                            "modelCode",
                            "serialNumber"
                    ))
                    .setAttributesForFaceting(Arrays.asList(
                            "productBrand",
                            "categoryName"
                    ))
                    .setRanking(Arrays.asList(
                            "typo",
                            "geo",
                            "words",
                            "filters",
                            "proximity",
                            "attribute",
                            "exact",
                            "custom"
                    ));

            client.setSettings(INDEX_NAME, settings);
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

            // DTO를 Algolia 문서 형태로 변환
            List<Map<String, Object>> algoliaDocuments = customerList.stream()
                    .map(this::convertToAlgoliaDocument)
                    .toList();

            // 기존 인덱스 데이터 삭제 후 새로 추가
            client.clearObjects(INDEX_NAME);
            log.info("기존 인덱스 데이터를 삭제했습니다.");

            // 새 데이터 배치 인덱싱
            client.saveObjects(INDEX_NAME, algoliaDocuments);
            log.info("{}건의 고객 데이터를 Algolia에 인덱싱했습니다.", algoliaDocuments.size());

        } catch (Exception e) {
            log.error("데이터 인덱싱 중 오류: {}", e.getMessage());
            throw e;
        }
    }

    private Map<String, Object> convertToAlgoliaDocument(CustomerListDto dto) {
        Map<String, Object> document = new HashMap<>();
        
        // 고객 정보
        document.put("objectID", dto.getCustomerId().toString());
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

    // 수동으로 인덱스를 재생성하고 싶을 때 사용할 수 있는 메소드
    public void reindexData() {
        log.info("수동 재인덱싱을 시작합니다.");
        indexCustomerData();
    }
}