package com.suriname.quote.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class QuoteCreateDto {
    private Long requestId;
    private Long estimatedCost; // 예상 총 견적금액
    private Long actualCost; // 실제 수리비용
    private List<RepairItemDto> repairItems; // 수리 항목들

    @Getter
    @Setter
    public static class RepairItemDto {
        private String itemName; // 수리 항목명
        private String description; // 설명
        private Long cost; // 비용
        private String category; // 카테고리 (선택적)
        private Long presetId; // 프리셋 ID (선택적)
    }
}