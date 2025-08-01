package com.suriname.global.security.service;

import com.suriname.employee.entity.Employee;
import com.suriname.employee.repository.EmployeeRepository;
import com.suriname.global.security.model.EmployeeDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmployeeDetailsService implements UserDetailsService {

    private final EmployeeRepository employeeRepository;

    @Override
    public UserDetails loadUserByUsername(String loginId) throws UsernameNotFoundException {
        Employee employee = employeeRepository.findByLoginId(loginId)
                .orElseThrow(() -> new UsernameNotFoundException("해당 ID를 가진 직원을 찾을 수 없습니다: " + loginId));

        return new EmployeeDetails(employee);
    }
}
