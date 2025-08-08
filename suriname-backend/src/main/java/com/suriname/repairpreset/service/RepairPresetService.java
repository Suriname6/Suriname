package com.suriname.repairpreset.service;

import com.suriname.category.entity.Category;
import com.suriname.category.repository.CategoryRepository;
import com.suriname.repairpreset.dto.PresetRequestDto;
import com.suriname.repairpreset.dto.PresetResponseDto;
import com.suriname.repairpreset.entity.RepairPreset;
import com.suriname.repairpreset.repository.RepairPresetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RepairPresetService {

    private final RepairPresetRepository repairPresetRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public void createPreset(PresetRequestDto requestDto) {
        Category category = categoryRepository.findById(requestDto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));

        RepairPreset preset = RepairPreset.builder()
                .category(category)
                .name(requestDto.getName())
                .cost(requestDto.getCost())
                .build();

        repairPresetRepository.save(preset);
    }

    @Transactional(readOnly = true)
    public List<PresetResponseDto> getAllPresets() {
        return repairPresetRepository.findByIsActiveTrue().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PresetResponseDto> getPresetsByCategory(Long categoryId) {
        return repairPresetRepository.findByCategory_CategoryIdAndIsActiveTrue(categoryId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deactivatePreset(Long id) {
        RepairPreset preset = repairPresetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("프리셋을 찾을 수 없습니다."));
        preset.inactive();
    }

    private PresetResponseDto toDto(RepairPreset preset) {
        return new PresetResponseDto(
                preset.getRepairPresetsId(),
                preset.getCategory().getCategoryId(),
                preset.getName(),
                preset.getCost(),
                preset.getIsActive(),
                preset.getCreatedAt().toLocalDate()
        );
    }
}
