package com.suriname.repairpreset.repository;

import com.suriname.repairpreset.entity.RepairPreset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

public interface RepairPresetRepository extends JpaRepository<RepairPreset, Long> {

    List<RepairPreset> findByCategory_CategoryIdAndIsActiveTrue(Long categoryId);

    List<RepairPreset> findByIsActiveTrue();
    
    // 10000 이상의 가장 큰 ID를 찾아서 다음 ID 생성용
    @Query("SELECT MAX(r.repairPresetsId) FROM RepairPreset r WHERE r.repairPresetsId >= 10000")
    Optional<Long> findMaxDirectInputId();
}
