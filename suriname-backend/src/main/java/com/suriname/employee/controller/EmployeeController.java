package com.suriname.employee.controller;

import com.suriname.employee.dto.*;
import com.suriname.employee.entity.Employee;
import com.suriname.employee.service.EmployeeService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping()
    public ResponseEntity<EmployeeResponseDto> signup(
            @RequestBody @Valid SignupRequestDto requestDto
    )
    {
        EmployeeResponseDto responseDto = employeeService.signup(requestDto);
        URI location = URI.create("/api/users/" + responseDto.getEmployeeId());
        return ResponseEntity.created(location).body(responseDto);
    }

    @GetMapping
    public ResponseEntity<Page<EmployeeResponseDto>> getAllEmployees(
            @ModelAttribute EmployeeSearchRequestDto search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    )
    {
        Page<EmployeeResponseDto> responseDtos =
                employeeService.getEmployees(search, PageRequest.of(page, size));
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

    @GetMapping("/pending")
    public ResponseEntity<Page<EmployeeResponseDto>> getPendingEmployees(
            @ModelAttribute EmployeeSearchRequestDto searchDto,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    )
    {
        Page<EmployeeResponseDto> result = employeeService.getPendingEmployees(searchDto, PageRequest.of(page, size));
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<EmployeeResponseDto> updateRole(
            @PathVariable Long id,
            @RequestBody RoleUpdateRequestDto requestDto
    )
    {
        EmployeeResponseDto responseDto = employeeService.updateRole(id, requestDto.getRole());
        return ResponseEntity.ok(responseDto);
    }
}
