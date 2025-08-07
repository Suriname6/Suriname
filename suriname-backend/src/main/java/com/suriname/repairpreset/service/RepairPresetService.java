package com.suriname.repairpreset.service;

import com.suriname.category.entity.Category;
import com.suriname.category.entity.CategoryRepository;
import com.suriname.repairpreset.dto.RepairPresetCreateDto;
import com.suriname.repairpreset.dto.RepairPresetDto;
import com.suriname.repairpreset.entity.RepairPreset;
import com.suriname.repairpreset.repository.RepairPresetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RepairPresetService {

    private final RepairPresetRepository repairPresetRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public RepairPreset createPreset(RepairPresetCreateDto createDto) {
        // 카테고리 존재 확인
        Category category = categoryRepository.findById(createDto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다."));

        // 다음 ID 계산
        Long nextId = repairPresetRepository.findAll()
                .stream()
                .mapToLong(RepairPreset::getRepairPresetsId)
                .max()
                .orElse(0L) + 1;

        RepairPreset repairPreset = RepairPreset.builder()
                .categoryId(createDto.getCategoryId())
                .name(createDto.getName())
                .description(createDto.getDescription())
                .cost(createDto.getCost())
                .build();

        // ID를 수동으로 설정
        try {
            java.lang.reflect.Field idField = RepairPreset.class.getDeclaredField("repairPresetsId");
            idField.setAccessible(true);
            idField.set(repairPreset, nextId);
        } catch (Exception e) {
            throw new RuntimeException("ID 설정 중 오류가 발생했습니다.", e);
        }

        return repairPresetRepository.save(repairPreset);
    }

    public List<RepairPresetDto> getAllActivePresets() {
        List<RepairPreset> presets = repairPresetRepository.findActivePresets();
        
        // 카테고리 ID들을 수집하여 한 번에 조회
        List<Long> categoryIds = presets.stream()
                .map(RepairPreset::getCategoryId)
                .distinct()
                .collect(Collectors.toList());
        
        Map<Long, String> categoryNameMap = categoryRepository.findAllById(categoryIds)
                .stream()
                .collect(Collectors.toMap(Category::getCategoryId, Category::getName));
        
        return presets.stream()
                .map(preset -> new RepairPresetDto(preset, 
                        categoryNameMap.getOrDefault(preset.getCategoryId(), "알 수 없는 카테고리")))
                .collect(Collectors.toList());
    }

    public List<RepairPresetDto> getPresetsByCategory(Long categoryId) {
        List<RepairPreset> presets = repairPresetRepository.findByCategoryIdAndIsActiveTrue(categoryId);
        
        String categoryName = categoryRepository.findById(categoryId)
                .map(Category::getName)
                .orElse("알 수 없는 카테고리");
        
        return presets.stream()
                .map(preset -> new RepairPresetDto(preset, categoryName))
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePreset(Long presetId) {
        RepairPreset preset = repairPresetRepository.findById(presetId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프리셋입니다."));
        
        preset.inactive(); // 소프트 삭제
        repairPresetRepository.save(preset);
    }
}