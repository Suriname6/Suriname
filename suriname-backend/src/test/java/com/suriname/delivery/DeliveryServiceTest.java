package com.suriname.delivery;

import com.suriname.delivery.dto.DeliveryListDto;
import com.suriname.delivery.entity.Delivery;
import com.suriname.delivery.repository.DeliveryRepository;
import com.suriname.delivery.service.DeliveryService;
import com.suriname.request.entity.Request;
import com.suriname.request.repository.RequestRepository;
import com.suriname.customer.entity.Customer;
import com.suriname.customer.repository.CustomerRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class DeliveryServiceTest {
/*
    @Autowired
    private DeliveryService deliveryService;
    
    @Autowired
    private DeliveryRepository deliveryRepository;
    
    @Autowired
    private RequestRepository requestRepository;
    
    @Autowired
    private CustomerRepository customerRepository;

    @Test
    public void testGetAllDeliveries() {
        // Given: 테스트 데이터 생성
        Customer customer = Customer.builder()
                .name("테스트고객")
                .phone("010-1234-5678")
                .email("test@test.com")
                .build();
        customerRepository.save(customer);

        Request request = Request.builder()
                .customer(customer)
                .inputProductName("테스트제품")
                .content("테스트 내용")
                .build();
        requestRepository.save(request);

        Delivery delivery = Delivery.builder()
                .request(request)
                .name("테스트고객")
                .phone("010-1234-5678")
                .zipcode("12345")
                .address("테스트 주소")
                .status(Delivery.Status.PENDING)
                .build();
        deliveryRepository.save(delivery);

        // When: 배송 목록 조회
        Page<DeliveryListDto> result = deliveryService.getAllDeliveries(
            PageRequest.of(0, 10)
        );

        // Then: 결과 검증
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getCustomerName()).isEqualTo("테스트고객");
    }

    @Test
    public void testDeliveryStatusFilter() {
        // Given: 다양한 상태의 배송 데이터 생성
        Customer customer = Customer.builder()
                .name("테스트고객")
                .phone("010-0000-0000")
                .email("test@test.com")
                .build();
        customerRepository.save(customer);

        Request request1 = Request.builder()
                .customer(customer)
                .inputProductName("제품1")
                .content("내용1")
                .build();
        requestRepository.save(request1);

        Request request2 = Request.builder()
                .customer(customer)
                .inputProductName("제품2")
                .content("내용2")
                .build();
        requestRepository.save(request2);

        Delivery delivery1 = Delivery.builder()
                .request(request1)
                .name("고객1")
                .phone("010-1111-1111")
                .zipcode("11111")
                .address("주소1")
                .status(Delivery.Status.PENDING)
                .build();
        deliveryRepository.save(delivery1);

        Delivery delivery2 = Delivery.builder()
                .request(request2)
                .name("고객2")
                .phone("010-2222-2222")
                .zipcode("22222")
                .address("주소2")
                .status(Delivery.Status.SHIPPED)
                .build();
        deliveryRepository.save(delivery2);

        // When: 특정 상태로 필터링
        Page<DeliveryListDto> pendingResult = deliveryService.getDeliveriesByStatus(
            Delivery.Status.PENDING, PageRequest.of(0, 10)
        );
        
        Page<DeliveryListDto> shippedResult = deliveryService.getDeliveriesByStatus(
            Delivery.Status.SHIPPED, PageRequest.of(0, 10)
        );

        // Then: 필터링 결과 검증
        assertThat(pendingResult.getContent()).hasSize(1);
        assertThat(pendingResult.getContent().get(0).getStatus()).isEqualTo("PENDING");
        
        assertThat(shippedResult.getContent()).hasSize(1);
        assertThat(shippedResult.getContent().get(0).getStatus()).isEqualTo("SHIPPED");
    }*/
}