package com.suriname.employee.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import com.suriname.employee.entity.Employee.Role;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class SignupRequestDto {

    @NotBlank
    @Size(min = 4, max = 20)
    private String loginId;

    @NotBlank
    @Size(min = 8, max = 20)
    private String password;

    @NotBlank
    @Size(max = 10)
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String phone;

    @NotNull
    private LocalDate birth;

    @NotNull
    private Role role;
}
