package com.suriname.employee.controller;

import com.suriname.employee.dto.EmployeeRequestDto;
import com.suriname.employee.dto.EmployeeResponseDto;
import com.suriname.employee.dto.EmployeeUpdateRequestDto;
import com.suriname.employee.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employee")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping()
    public ResponseEntity<EmployeeResponseDto> createEmployee(
            @RequestBody @Valid EmployeeRequestDto requestDto
            )
    {
        EmployeeResponseDto responseDto = employeeService.createEmployee(requestDto);
        return ResponseEntity.ok(responseDto);
    }

    @GetMapping
    public ResponseEntity<List<EmployeeResponseDto>> getAllEmployees() {
        List<EmployeeResponseDto> responseDtos = employeeService.getAllEmployees();
        return ResponseEntity.ok(responseDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponseDto> getEmployee(@PathVariable Long id) {
        EmployeeResponseDto employee = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(employee);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponseDto> updateEmployees(
            @PathVariable Long id,
            @RequestBody @Valid EmployeeUpdateRequestDto requestDto
    )
    {
        EmployeeResponseDto responseDto = employeeService.updateEmployee(id, requestDto);
        return ResponseEntity.ok(responseDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateEmployee(@PathVariable Long id) {
        employeeService.deactivateEmployee(id);
        return ResponseEntity.noContent().build();
    }
}
