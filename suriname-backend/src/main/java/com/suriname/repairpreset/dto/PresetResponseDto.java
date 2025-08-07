package com.suriname.repairpreset.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class PresetResponseDto {
    private Long id;
    private Long categoryId;
    private String name;
    private Integer cost;
    private Boolean isActive;
    private LocalDate createdAt;
}
