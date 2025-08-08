package com.suriname.employee.controller;

import com.suriname.employee.dto.SignupRequestDto;
import com.suriname.employee.dto.EmployeeResponseDto;
import com.suriname.employee.dto.EmployeeUpdateRequestDto;
import com.suriname.employee.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/employee")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping("/signup")
    public ResponseEntity<EmployeeResponseDto> signup(
            @RequestBody @Valid SignupRequestDto requestDto
            )
    {
        EmployeeResponseDto responseDto = employeeService.signup(requestDto);
        URI location = URI.create("/employee/" + responseDto.getEmployeeId());
        return ResponseEntity.created(location).body(responseDto);
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
<<<<<<< HEAD
=======

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

    @GetMapping("/validate/name/{name}")
    public ResponseEntity<Boolean> validateEmployeeName(@PathVariable String name) {
        boolean exists = employeeService.existsByName(name);
        return ResponseEntity.ok(exists);
    }
    
    @GetMapping("/engineers")
    public ResponseEntity<Page<EmployeeResponseDto>> getEngineers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size
    ) {
        Page<EmployeeResponseDto> engineers = employeeService.getEngineersByRole(PageRequest.of(page, size));
        return ResponseEntity.ok(engineers);
    }
>>>>>>> 4061aef18b1e5b63022891ef5b6e82873081e963
}
