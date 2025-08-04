package com.suriname.employee.service;

import com.suriname.employee.dto.EmployeeRequestDto;
import com.suriname.employee.dto.EmployeeResponseDto;
import com.suriname.employee.dto.EmployeeUpdateRequestDto;
import com.suriname.employee.entity.Employee;
import com.suriname.employee.repository.EmployeeRepository;
import com.suriname.employee.service.mapper.EmployeeMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper;

    @Override
    public EmployeeResponseDto createEmployee(EmployeeRequestDto requestDto) {
        validateDuplicateLoginId(requestDto.getLoginId());

        Employee employee = employeeMapper.toEntity(requestDto);
        employeeRepository.save(employee);

        return employeeMapper.toDto(employee);
    }

    @Override
    public EmployeeResponseDto getEmployeeById(Long employeeId) {
        Employee employee = findEmployee(employeeId);
        return employeeMapper.toDto(employee);
    }

    @Override
    public List<EmployeeResponseDto> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(employeeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public EmployeeResponseDto updateEmployee(Long employeeId, EmployeeUpdateRequestDto requestDto) {
        Employee employee = findEmployee(employeeId);

        employee.changePassword(requestDto.getNewPassword());
        employee.changeEmail(requestDto.getEmail());
        employee.changePhone(requestDto.getPhone());

        return employeeMapper.toDto(employee);
    }

    @Override
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
}
