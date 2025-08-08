package com.suriname.employee.repository;

import com.suriname.employee.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    //사용자 인증을 위한 조회용 메서드
    Optional<Employee> findByLoginId(String loginId);

    //존재 여부만 빠르게 확인할 때 사용
    boolean existsByLoginId(String loginId);
<<<<<<< HEAD
}
=======

    Page<Employee> findByRole(Employee.Role role, Pageable pageable);
    
    // 수리기사 이름으로 존재 여부 확인
    boolean existsByName(String name);
    
    // 수리기사 이름으로 검색
    Optional<Employee> findByName(String name);

}
>>>>>>> 4061aef18b1e5b63022891ef5b6e82873081e963
