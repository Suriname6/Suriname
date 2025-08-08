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
<<<<<<< HEAD
=======

    Page<EmployeeResponseDto> getEmployees(EmployeeSearchRequestDto search, Pageable pageable);

    Page<EmployeeResponseDto> getPendingEmployees(EmployeeSearchRequestDto search, Pageable pageable);

    EmployeeResponseDto updateRole(Long employeeId, String role);

    boolean existsByName(String name);
    
    Page<EmployeeResponseDto> getEngineersByRole(Pageable pageable);

>>>>>>> 4061aef18b1e5b63022891ef5b6e82873081e963
}
