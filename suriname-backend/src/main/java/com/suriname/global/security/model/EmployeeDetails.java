package com.suriname.global.security.model;

import com.suriname.employee.entity.Employee;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@RequiredArgsConstructor
@Getter
public class EmployeeDetails implements UserDetails {
    private final Employee employee;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + employee.getRole().name()));
    }

    @Override
    public String getPassword() {
        return employee.getPassword();
    }

    @Override
    public String getUsername() {
        return employee.getLoginId();
    }

    //계정 만료 안 함
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    //잠금 안 함
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    //자격 만료 안 함
    @Override public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override public boolean isEnabled() {
        return employee.getStatus() == Employee.Status.ACTIVE;
    }
}
