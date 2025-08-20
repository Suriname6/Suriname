package com.suriname.request.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RequestSearchDto {
    private String requestNo;
    private String customerName;
    private String productName;
    private String modelCode;
    private LocalDate startCreateAt;
    private LocalDate endCreateAt;
    private List<String> status;
    private List<String> assignmentStatus;
    private String employName;
}