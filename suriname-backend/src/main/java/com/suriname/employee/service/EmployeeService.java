package com.suriname.employee.service;

import com.suriname.employee.dto.SignupRequestDto;
import com.suriname.employee.dto.EmployeeResponseDto;
import com.suriname.employee.dto.EmployeeUpdateRequestDto;

import java.util.List;

public interface EmployeeService {
    EmployeeResponseDto signup(SignupRequestDto requestDto);

    EmployeeResponseDto getEmployeeById(Long employeeId);

    List<EmployeeResponseDto> getAllEmployees();

    EmployeeResponseDto updateEmployee(Long employeeId, EmployeeUpdateRequestDto requestDto);

    void deactivateEmployee(Long employeeId);
}
