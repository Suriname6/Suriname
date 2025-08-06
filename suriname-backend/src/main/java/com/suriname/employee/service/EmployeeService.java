package com.suriname.employee.service;

import com.suriname.employee.dto.SignupRequestDto;
import com.suriname.employee.dto.EmployeeResponseDto;
import com.suriname.employee.dto.EmployeeUpdateRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EmployeeService {
    EmployeeResponseDto signup(SignupRequestDto requestDto);

    EmployeeResponseDto getEmployeeById(Long employeeId);

    //List<EmployeeResponseDto> getAllEmployees();

    EmployeeResponseDto updateEmployee(Long employeeId, EmployeeUpdateRequestDto requestDto);

    void deactivateEmployee(Long employeeId);

    Page<EmployeeResponseDto> getEmployees(String role, Pageable pageable);

}
