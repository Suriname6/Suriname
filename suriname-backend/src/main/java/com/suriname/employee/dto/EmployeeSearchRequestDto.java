package com.suriname.employee.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EmployeeSearchRequestDto {
    private String name;
    private String loginId;
    private String email;
    private String phone;
    private String address;
    private String role;
    private String status;
}
