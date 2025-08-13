package com.suriname.request.repository;

import com.suriname.customer.dto.CustomerRequestDto;
import com.suriname.request.dto.RequestSummaryDto;
import com.suriname.request.entity.Request;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {
    
    // 접수번호로 Request 조회
    Optional<Request> findByRequestNo(String requestNo);
    
    // 내가 수리한 내역
    @Query("""
            select new com.suriname.request.dto.RequestSummaryDto(
                r.requestId,
                r.requestNo,
                cast(r.status as string),
                r.customer.name,
                r.customerProduct.product.productName,
                r.customerProduct.product.modelCode,
                r.createdAt
            )
            from Request r
            where r.employee.employeeId = :employeeId
              and (:status is null or r.status = :status)
            order by r.createdAt desc
        """)
        Page<RequestSummaryDto> findMyRequestsDto(
            @Param("employeeId") Long employeeId,
            @Param("status") Request.Status status,
            Pageable pageable
        );

        // 내가 접수한 내역
        @Query("""
            select new com.suriname.request.dto.RequestSummaryDto(
                r.requestId,
                r.requestNo,
                cast(r.status as string),
                r.customer.name,
                r.customerProduct.product.productName,
                r.customerProduct.product.modelCode,
                r.createdAt
            )
            from Request r
            where r.receiver.employeeId = :receiverId
              and (:status is null or r.status = :status)
            order by r.createdAt desc
        """)
        Page<RequestSummaryDto> findMyReceivedDto(
            @Param("receiverId") Long receiverId,
            @Param("status") Request.Status status,
            Pageable pageable
        );
        
        // 특정 기간 완료 건수
        @Query("""
            select count(r) from Request r
            where r.employee.employeeId = :eid
              and r.status = com.suriname.request.entity.Request.Status.COMPLETED
              and r.completedAt between :start and :end
        """)
        long countCompletedBetween(@Param("eid") Long employeeId,
                                   @Param("start") LocalDateTime start,
                                   @Param("end") LocalDateTime end);

        // 상태별 전체 건수 (내가 담당인 모든 요청 기준)
        @Query("""
            select r.status, count(r) from Request r
            where r.employee.employeeId = :eid
            group by r.status
        """)
        List<Object[]> countByStatus(@Param("eid") Long employeeId);

        @Query("""
        		  select count(r) from Request r
        		  where r.receiver.employeeId = :rid
        		    and r.createdAt between :start and :end
        		""")
        		long countRegisteredBetween(@Param("rid") Long receiverId,
        		                            @Param("start") java.time.LocalDateTime start,
        		                            @Param("end") java.time.LocalDateTime end);

        		@Query("""
        		  select r.status, count(r) from Request r
        		  where r.receiver.employeeId = :rid
        		  group by r.status
        		""")
        		java.util.List<Object[]> countByStatusForReceiver(@Param("rid") Long receiverId);
        		
        		// 미완료 최신 1건
        	    @Query("""
        	            select new com.suriname.customer.dto.CustomerRequestDto(
        	                c.name, p.productName, r.requestNo
        	            )
        	            from Request r
        	              join r.customer c
        	              join r.customerProduct cp
        	              join cp.product p
        	            where lower(c.name) = lower(:name)
        	              and r.status <> com.suriname.request.entity.Request.Status.COMPLETED
        	            order by r.createdAt desc
        	        """)
        	        Page<CustomerRequestDto> findOpenBriefsByCustomer(@Param("name") String customerName, Pageable pageable);
        	
        	    
        	    default Optional<CustomerRequestDto> findLatestOpenBriefByCustomer(String customerName) {
        	        Page<CustomerRequestDto> page = findOpenBriefsByCustomer(customerName, PageRequest.of(0, 1));
        	        return page.stream().findFirst();
        	    }
}