package com.suriname.requestdetail.entity;

import com.suriname.employee.entity.Employee;
import com.suriname.repairpreset.entity.RepairPreset;
import com.suriname.request.entity.Request;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "request_detail")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class RequestDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestDetailId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requests_id", nullable = false)
    private Request request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repair_presets_id")
    private RepairPreset repairPreset;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private Integer cost;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public RequestDetail(Request request,
                          Employee employee,
                          RepairPreset repairPreset,
                          String content,
                          Integer cost) {
        this.request = request;
        this.employee = employee;
        this.repairPreset = repairPreset;
        this.content = content;
        this.cost = cost;
    }
}
