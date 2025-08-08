package com.suriname.repairpreset.dto;

import lombok.Data;

@Data
public class RepairPresetCreateDto {
    private Long categoryId;
    private String name;
    private String description;
    private Integer cost;
}