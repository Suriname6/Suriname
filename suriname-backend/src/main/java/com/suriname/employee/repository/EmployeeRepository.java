package com.suriname.employee.repository;

import com.suriname.employee.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {

    //사용자 인증을 위한 조회용 메서드
    Optional<Employee> findByLoginId(String loginId);

    //존재 여부만 빠르게 확인할 때 사용
    boolean existsByLoginId(String loginId);

    Page<Employee> findByRole(Employee.Role role, Pageable pageable);
    
    // 수리기사 이름으로 존재 여부 확인
    boolean existsByName(String name);
    
    // 수리기사 이름으로 검색
    Optional<Employee> findByName(String name);

}