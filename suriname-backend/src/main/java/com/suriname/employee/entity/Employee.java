package com.suriname.employee.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long employeeId;

    @Column(nullable = false, unique = true, length = 50)
    private String loginId;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 10)
    private String name;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false)
    private LocalDate birth;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Status status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Role role;

    public enum Role {
        ADMIN, STAFF, ENGINEER
    }

    public enum Status {
        ACTIVE, INACTIVE
    }

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Builder
    public Employee(String loginId, String password, String name, String email, String phone, LocalDate birth, Role role) {
        this.loginId = loginId;
        this.password = password;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.birth = birth;
        this.role = role;
        this.status = Status.ACTIVE;
    }

    public void inactive() {
        this.status = Status.INACTIVE;
    }

    public void changePassword(String newPassword) {
        this.password = newPassword;
    }

    public void changeEmail(String email) {
        this.email = email;
    }

    public void changePhone(String phone) {
        this.phone = phone;
    }
}