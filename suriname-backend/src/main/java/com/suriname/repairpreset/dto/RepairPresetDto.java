package com.suriname.repairpreset.dto;

import com.suriname.repairpreset.entity.RepairPreset;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RepairPresetDto {
    private Long repairPresetsId;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String description;
    private Integer cost;
    private Boolean isActive;
    private LocalDateTime createdAt;
    
    public RepairPresetDto(RepairPreset repairPreset, String categoryName) {
        this.repairPresetsId = repairPreset.getRepairPresetsId();
        this.categoryId = repairPreset.getCategoryId();
        this.categoryName = categoryName;
        this.name = repairPreset.getName();
        this.description = repairPreset.getDescription();
        this.cost = repairPreset.getCost();
        this.isActive = repairPreset.getIsActive();
        this.createdAt = repairPreset.getCreatedAt();
    }
}