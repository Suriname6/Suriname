package com.suriname.repairpreset.dto;

import com.suriname.repairpreset.entity.RepairPreset;
import lombok.Getter;

@Getter
public class RepairPresetDto {
    private Long repairPresetsId;
    private Long categoryId;
    private String name;
    private Integer cost;
    private Boolean isActive;

    public RepairPresetDto(RepairPreset preset) {
        this.repairPresetsId = preset.getRepairPresetsId();
        this.categoryId = preset.getCategory().getCategoryId();
        this.name = preset.getName();
        this.cost = preset.getCost();
        this.isActive = preset.getIsActive();
    }
}