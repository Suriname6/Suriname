package com.suriname.request.service;

import com.suriname.customer.entity.Customer;
import com.suriname.customer.repository.CustomerRepository;
import com.suriname.employee.entity.Employee;
import com.suriname.employee.repository.EmployeeRepository;
import com.suriname.image.entity.Image;
import com.suriname.product.entity.CustomerProduct;
import com.suriname.product.entity.Product;
import com.suriname.product.repository.CustomerProductRepository;
import com.suriname.request.dto.*;
import com.suriname.request.entity.Request;
import com.suriname.request.entity.RequestAssignmentLog;
import com.suriname.request.repository.RequestAssignmentLogRepository;
import com.suriname.request.repository.RequestQueryRepository;
import com.suriname.request.repository.RequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class RequestService {

	private final RequestRepository requestRepository;
	private final EmployeeRepository employeeRepository;
	private final CustomerRepository customerRepository;
	private final CustomerProductRepository customerProductRepository;
	private final RequestAssignmentLogRepository requestAssignmentLogRepository;
	private final RequestQueryRepository requestQueryRepository;

	// AS 요청 생성
	@Transactional
	public RequestCreateResponseDto createRequest(Long receiverId, RequestCreateRequestDto dto) {
		if (receiverId == null) throw new IllegalArgumentException("접수 담당자 ID가 필요합니다.");
		if (dto.getEmployeeId() == null)
			throw new IllegalArgumentException("수리 담당자 ID가 필요합니다.");
		if (dto.getCustomerId() == null)
			throw new IllegalArgumentException("고객 ID가 필요합니다.");
		if (dto.getCustomerProductId() == null)
			throw new IllegalArgumentException("고객 제품 ID가 필요합니다.");

		Employee receiver = employeeRepository.findById(receiverId)
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 접수 담당자 ID"));
		Employee employee = employeeRepository.findById(dto.getEmployeeId())
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 수리 담당자 ID"));
		Customer customer = customerRepository.findById(dto.getCustomerId())
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 고객 ID"));
		CustomerProduct customerProduct = customerProductRepository.findById(dto.getCustomerProductId())
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 고객 제품 ID"));

		Request request = Request.builder().receiver(receiver).employee(employee).customer(customer)
				.customerProduct(customerProduct).requestNo(null).content(dto.getContent()).build();

		requestRepository.save(request);

		String createdDate = request.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
		String requestNo = String.format("AS-%s-%d", createdDate, request.getRequestId());
		request.setRequestNo(requestNo);

		request.publishStatusInitialized(receiver.getEmployeeId().toString(), "요청 생성");
		requestRepository.saveAndFlush(request);

		// 수리 담당자 배정 이력
		RequestAssignmentLog assignmentLog = RequestAssignmentLog.builder().request(request).employee(employee) // 수리 기사
				.assignedBy(receiver) // 배정자 (접수 담당자)
				.assignmentType(RequestAssignmentLog.AssignmentType.MANUAL)
				.status(RequestAssignmentLog.AssignmentStatus.PENDING).assignedAt(LocalDateTime.now()).build();

		requestAssignmentLogRepository.save(assignmentLog);

		return RequestCreateResponseDto.builder().requestId(request.getRequestId()).requestNo(request.getRequestNo())
				.build();
	}

	// AS 요청 목록 조회
	@Transactional(readOnly = true)
	public Page<RequestListResponseDto> getRequestList(RequestSearchCondition condition, Pageable pageable,
			Long viewerId, String role) {

		if (!"ADMIN".equals(role) && !"STAFF".equals(role) && !"ENGINEER".equals(role)) {
			throw new AccessDeniedException("권한이 없습니다.");
		}

		return requestQueryRepository.searchRequestList(condition, pageable, viewerId, role);
	}

	// AS 요청 단건 조회
	@Transactional(readOnly = true)
	public RequestDetailResponseDto getRequestDetail(Long requestId, Long viewerId, String role) {
		Request request = requestRepository.findById(requestId)
				.orElseThrow(() -> new IllegalArgumentException("해당 요청이 존재하지 않습니다."));

		if ("STAFF".equals(role)) {
			Long receiverId = request.getReceiver() != null ? request.getReceiver().getEmployeeId() : null;
			if (!Objects.equals(receiverId, viewerId)) {
				throw new AccessDeniedException("해당 요청에 접근 권한이 없습니다.");
			}
		} else if ("ENGINEER".equals(role)) {
			Long engineerId = request.getEmployee() != null ? request.getEmployee().getEmployeeId() : null;
			if (!Objects.equals(engineerId, viewerId)) {
				throw new AccessDeniedException("해당 요청에 접근 권한이 없습니다.");
			}
		}

		// 가장 최근 assignment log 가져오기
		RequestAssignmentLog latestLog = requestAssignmentLogRepository
				.findTopByRequestRequestIdOrderByAssignedAtDesc(requestId)
				.orElseThrow(() -> new IllegalStateException("배정 이력이 존재하지 않습니다."));

		// 상품 정보
		CustomerProduct customerProduct = request.getCustomerProduct();
		Product product = customerProduct.getProduct();

		// 접수 이미지
		List<String> requestImages = request.getRequestImages().stream().map(Image::getFileUrl).toList();

		return RequestDetailResponseDto.builder().requestId(request.getRequestId()).requestNo(request.getRequestNo())
				.createdAt(request.getCreatedAt()).status(request.getStatus().name())
				.receiverName(request.getReceiver().getName())
				.receiverPhone(request.getReceiver().getPhone())
				.engineerName(request.getEmployee().getName())
				.engineerPhone(request.getEmployee().getPhone())
				.content(request.getContent())

				.assignmentStatus(latestLog.getStatus().name()).rejectionReason(latestLog.getRejectionReason())
				.assignmentStatusChangedAt(latestLog.getStatusChangedAt())

				.customerName(request.getCustomer().getName())
				.customerPhone(request.getCustomer().getPhone())
				.customerBirth(request.getCustomer().getBirth())

				.categoryName(product.getCategory().getName()).productName(product.getProductName())
				.modelCode(product.getModelCode()).productBrand(product.getProductBrand())
				.serialNumber(customerProduct.getSerialNumber())
				.requestImages(requestImages).build();
	}

	// AS 요청 수정
	@Transactional
	public RequestCreateResponseDto updateRequest(Long requestId, RequestUpdateDto dto, Long viewerId, String role) {

		Request request = requestRepository.findById(requestId)
				.orElseThrow(() -> new IllegalArgumentException("해당 요청이 존재하지 않습니다."));

		if (dto.getEmployeeId() != null) {
			Employee employee = employeeRepository.findById(dto.getEmployeeId())
					.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 직원 ID"));
			request.setEmployee(employee);
		}

		if (dto.getCustomerId() != null) {
			Customer customer = customerRepository.findById(dto.getCustomerId())
					.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 고객 ID"));
			request.setCustomer(customer);
		}

		if (dto.getCustomerProductId() != null) {
			CustomerProduct customerProduct = customerProductRepository.findById(dto.getCustomerProductId())
					.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 고객 제품 ID"));
			request.setCustomerProduct(customerProduct);
		}

		if (dto.getContent() != null)
			request.setContent(dto.getContent());


		return RequestCreateResponseDto.builder().requestId(request.getRequestId()).requestNo(request.getRequestNo())
				.build();
	}

	@Transactional
	public void updateStatus(Long requestId, Long viewerId, Request.Status newStatus) {
		Request request = requestRepository.findById(requestId)
				.orElseThrow(() -> new IllegalArgumentException("해당 요청이 존재하지 않습니다."));
		request.changeStatus(newStatus, String.valueOf(viewerId), null);
	}

	// AS 요청 삭제
	public void deleteRequest(Long requestId) {
		Request request = requestRepository.findById(requestId)
				.orElseThrow(() -> new IllegalArgumentException("해당 요청이 존재하지 않습니다."));

		requestRepository.delete(request);
	}

	// AS 요청 다중 삭제
	@Transactional
	public void deleteRequests(List<Long> requestIds) {
		requestAssignmentLogRepository.deleteAllByRequestRequestIdIn(requestIds);

		requestRepository.deleteAllByIdInBatch(requestIds);
	}

	// 내가 수리한 내역
	public Page<RequestSummaryDto> getMyRequests(Long engineerId, Request.Status status, Pageable pageable) {
		return requestRepository.findMyRequestsDto(engineerId, status, pageable);
	}

	// 내가 접수한 내역
	public Page<RequestSummaryDto> getMyReceived(Long receiverId, Request.Status status, Pageable pageable) {
		return requestRepository.findMyReceivedDto(receiverId, status, pageable);
	}
	
	// 누적 수리 건수
	public RequestMainDto getEngineerSummary(Long engineerId) {
	    var startToday = java.time.LocalDate.now().atStartOfDay();
	    var endToday   = startToday.plusDays(1);

	    var today = java.time.LocalDate.now();
	    var weekStart = today.with(java.time.DayOfWeek.MONDAY).atStartOfDay();
	    var weekEnd   = weekStart.plusDays(7);

	    var monthStart = today.withDayOfMonth(1).atStartOfDay();
	    var monthEnd   = monthStart.plusMonths(1);
	    
	    long todayCompleted = requestRepository.countCompletedBetween(engineerId, startToday, endToday);
	    long weekCompleted  = requestRepository.countCompletedBetween(engineerId, weekStart, weekEnd);
	    long monthCompleted  = requestRepository.countCompletedBetween(engineerId, monthStart, monthEnd);
	    		
	    var grouped = requestRepository.countByStatus(engineerId);
	    java.util.Map<String, Long> statusCounts = new java.util.HashMap<>();
	    for (Object[] row : grouped) {
	        statusCounts.put(row[0].toString(), (Long) row[1]);
	    }

	    return new RequestMainDto(
	        todayCompleted,
	        weekCompleted,
	        monthCompleted, 
	        java.util.Map.copyOf(statusCounts)
	    );
	}
	
	// 누적 접수 건수
	@Transactional(readOnly = true)
	public StaffMainDto getStaffSummary(Long receiverId) {
	    var today = java.time.LocalDate.now();

	    var startToday = today.atStartOfDay();
	    var endToday   = startToday.plusDays(1);

	    var weekStart  = today.with(java.time.DayOfWeek.MONDAY).atStartOfDay();
	    var weekEnd    = weekStart.plusDays(7);

	    var monthStart = today.withDayOfMonth(1).atStartOfDay();
	    var monthEnd   = monthStart.plusMonths(1);

	    long todayCnt  = requestRepository.countRegisteredBetween(receiverId, startToday, endToday);
	    long weekCnt   = requestRepository.countRegisteredBetween(receiverId, weekStart, weekEnd);
	    long monthCnt  = requestRepository.countRegisteredBetween(receiverId, monthStart, monthEnd);

	    var rows = requestRepository.countByStatusForReceiver(receiverId);
	    var statusCounts = new java.util.HashMap<String, Long>();
	    for (Object[] r : rows) {
	        statusCounts.put(r[0].toString(), (Long) r[1]);
	    }

	    return new StaffMainDto(
	        todayCnt,
	        weekCnt,
	        monthCnt,
	        java.util.Map.copyOf(statusCounts)
	    );
	}


}
