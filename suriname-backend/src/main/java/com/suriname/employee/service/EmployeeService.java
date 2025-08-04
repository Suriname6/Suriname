package com.suriname.employee.service;

import com.suriname.employee.dto.EmployeeRequestDto;
import com.suriname.employee.dto.EmployeeResponseDto;
import com.suriname.employee.dto.EmployeeUpdateRequestDto;
import org.springframework.stereotype.Service;

import java.util.List;

public interface EmployeeService {
    EmployeeResponseDto createEmployee(EmployeeRequestDto requestDto);

    EmployeeResponseDto getEmployeeById(Long employeeId);

    List<EmployeeResponseDto> getAllEmployees();

    EmployeeResponseDto updateEmployee(Long employeeId, EmployeeUpdateRequestDto requestDto);

    void deactivateEmployee(Long employeeId);
}
