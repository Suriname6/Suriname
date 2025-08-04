package com.suriname.employee.dto;

import com.suriname.employee.entity.Employee.Role;
import com.suriname.employee.entity.Employee.Status;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class EmployeeResponseDto {
    private Long employeeId;
    private String loginId;
    private String name;
    private String email;
    private String phone;
    private LocalDate birth;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Role role;
    private Status status;
}
