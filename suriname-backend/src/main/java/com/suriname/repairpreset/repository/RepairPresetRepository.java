package com.suriname.repairpreset.repository;

import com.suriname.repairpreset.entity.RepairPreset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RepairPresetRepository extends JpaRepository<RepairPreset, Long> {

    List<RepairPreset> findByCategory_CategoryIdAndIsActiveTrue(Long categoryId);

    List<RepairPreset> findByIsActiveTrue();
}
