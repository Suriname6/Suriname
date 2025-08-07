package com.suriname.delivery.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * 배송 관리 시스템 설정
 */
@Configuration
public class DeliveryConfig {

    /**
     * 택배사 API 호출을 위한 RestTemplate 설정
     */
    @Bean(name = "deliveryRestTemplate")
    public RestTemplate restTemplate() {
        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();
        
        // 타임아웃 설정 (택배사 API 응답 속도 고려)
        factory.setConnectTimeout(Duration.ofSeconds(10));
        factory.setConnectionRequestTimeout(Duration.ofSeconds(5));
        
        RestTemplate restTemplate = new RestTemplate(factory);
        
        // 에러 핸들러 추가 (선택사항)
        // restTemplate.setErrorHandler(new CourierApiErrorHandler());
        
        return restTemplate;
    }
}