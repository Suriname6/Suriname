package com.suriname.employee.service;

import com.suriname.employee.dto.EmployeeSearchRequestDto;
import com.suriname.employee.dto.SignupRequestDto;
import com.suriname.employee.dto.EmployeeResponseDto;
import com.suriname.employee.dto.EmployeeUpdateRequestDto;
import com.suriname.employee.entity.Employee;
import com.suriname.employee.repository.EmployeeRepository;
import com.suriname.employee.repository.EmployeeSpecification;
import com.suriname.employee.service.mapper.EmployeeMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper;

    @Override
    @Transactional
    public EmployeeResponseDto signup(SignupRequestDto requestDto) {
        validateDuplicateLoginId(requestDto.getLoginId());

        Employee employee = employeeMapper.toEntity(requestDto);
        employeeRepository.save(employee);

        return employeeMapper.toDto(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponseDto getEmployeeById(Long employeeId) {
        Employee employee = findEmployee(employeeId);
        return employeeMapper.toDto(employee);
    }

//    @Override
//    @Transactional(readOnly = true)
//    public List<EmployeeResponseDto> getAllEmployees() {
//        return employeeRepository.findAll().stream()
//                .map(employeeMapper::toDto)
//                .collect(Collectors.toList());
//    }

    @Override
    @Transactional
    public EmployeeResponseDto updateEmployee(Long employeeId, EmployeeUpdateRequestDto requestDto) {
        Employee employee = findEmployee(employeeId);

        employee.changePassword(requestDto.getNewPassword());
        employee.changeEmail(requestDto.getEmail());
        employee.changePhone(requestDto.getPhone());

        return employeeMapper.toDto(employee);
    }

    @Override
    @Transactional
    public void deactivateEmployee(Long employeeId) {
        Employee employee = findEmployee(employeeId);
        employee.inactive();
    }

    private void validateDuplicateLoginId(String loginId) {
        if (employeeRepository.existsByLoginId(loginId)) {
            throw new IllegalArgumentException("이미 사용 중인 로그인 ID입니다.");
        }
    }

    private Employee findEmployee(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 직원이 존재하지 않습니다."));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeResponseDto> getEmployees(EmployeeSearchRequestDto search, Pageable pageable) {
        // 🔍 디버깅 로그
        System.out.println("🔍 [EmployeeService] 검색 요청 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓");
        System.out.println("name     = [" + search.getName() + "]");
        System.out.println("loginId  = [" + search.getLoginId() + "]");
        System.out.println("email    = [" + search.getEmail() + "]");
        System.out.println("phone    = [" + search.getPhone() + "]");
        System.out.println("address  = [" + search.getAddress() + "]");
        System.out.println("role     = [" + search.getRole() + "]");
        System.out.println("status   = [" + search.getStatus() + "]");
        System.out.println("page     = " + pageable.getPageNumber());
        System.out.println("size     = " + pageable.getPageSize());
        System.out.println("↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑");

        return employeeRepository
                .findAll(EmployeeSpecification.searchWith(search), pageable)
                .map(employeeMapper::toDto);
    }
}
