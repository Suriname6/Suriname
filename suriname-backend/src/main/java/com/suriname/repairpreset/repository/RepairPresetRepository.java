package com.suriname.repairpreset.repository;

import com.suriname.repairpreset.entity.RepairPreset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepairPresetRepository extends JpaRepository<RepairPreset, Long> {
    
    List<RepairPreset> findByIsActiveTrue();
    
    List<RepairPreset> findByCategoryIdAndIsActiveTrue(Long categoryId);
    
    @Query("SELECT rp FROM RepairPreset rp WHERE rp.isActive = true ORDER BY rp.createdAt DESC")
    List<RepairPreset> findActivePresets();
}