package com.suriname.repairpreset.controller;

import com.suriname.repairpreset.dto.RepairPresetCreateDto;
import com.suriname.repairpreset.dto.RepairPresetDto;
import com.suriname.repairpreset.entity.RepairPreset;
import com.suriname.repairpreset.service.RepairPresetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/repair-presets")
@RequiredArgsConstructor
public class RepairPresetController {

    private final RepairPresetService repairPresetService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createPreset(@RequestBody RepairPresetCreateDto createDto) {
        try {
            RepairPreset createdPreset = repairPresetService.createPreset(createDto);
            
            return ResponseEntity.ok(Map.of(
                "status", 201,
                "data", Map.of(
                    "presetId", createdPreset.getRepairPresetsId(),
                    "name", createdPreset.getName()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", 400,
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllPresets() {
        try {
            List<RepairPresetDto> presets = repairPresetService.getAllActivePresets();
            
            return ResponseEntity.ok(Map.of(
                "status", 200,
                "data", presets
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", 500,
                "message", "프리셋 목록 조회 중 오류가 발생했습니다."
            ));
        }
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Map<String, Object>> getPresetsByCategory(@PathVariable Long categoryId) {
        try {
            List<RepairPresetDto> presets = repairPresetService.getPresetsByCategory(categoryId);
            
            return ResponseEntity.ok(Map.of(
                "status", 200,
                "data", presets
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", 500,
                "message", "카테고리별 프리셋 조회 중 오류가 발생했습니다."
            ));
        }
    }

    @DeleteMapping("/{presetId}")
    public ResponseEntity<Map<String, Object>> deletePreset(@PathVariable Long presetId) {
        try {
            repairPresetService.deletePreset(presetId);
            
            return ResponseEntity.ok(Map.of(
                "status", 200,
                "message", "프리셋이 삭제되었습니다."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", 400,
                "message", e.getMessage()
            ));
        }
    }
}