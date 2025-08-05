package com.suriname.employee.service.mapper;

import com.suriname.employee.dto.SignupRequestDto;
import com.suriname.employee.dto.EmployeeResponseDto;
import com.suriname.employee.entity.Employee;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EmployeeMapper {

    private final PasswordEncoder passwordEncoder;

    public Employee toEntity(SignupRequestDto dto) {
        return Employee.builder()
                .loginId(dto.getLoginId())
                .password(passwordEncoder.encode(dto.getPassword()))
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .birth(dto.getBirth())
                .role(Employee.Role.PENDING)
                .build();
    }

    public EmployeeResponseDto toDto(Employee employee) {
        return new EmployeeResponseDto(
                employee.getEmployeeId(),
                employee.getLoginId(),
                employee.getName(),
                employee.getEmail(),
                employee.getPhone(),
                employee.getBirth(),
                employee.getCreatedAt(),
                employee.getUpdatedAt(),
                employee.getRole(),
                employee.getStatus()
        );
    }
}
