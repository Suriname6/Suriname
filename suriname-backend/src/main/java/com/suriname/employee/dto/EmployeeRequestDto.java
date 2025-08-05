package com.suriname.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import com.suriname.employee.entity.Employee.Role;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class EmployeeRequestDto {
    private String loginId;
    private String password;
    private String name;
    private String email;
    private String phone;
    private LocalDate birth;
    private Role role;
}
