package com.suriname.completion.dto;

import com.suriname.completion.entity.Completion;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CompletionRegisterDto {

    @NotNull(message = "배송 ID는 필수입니다.")
    private Long deliveryId;

    @NotNull(message = "완료 담당자 ID는 필수입니다.")
    private Long employeeId;

    @NotNull(message = "완료 타입은 필수입니다.")
    private Completion.CompletionType completionType;

    private String completionNotes;

    public CompletionRegisterDto(Long deliveryId, Long employeeId, 
                               Completion.CompletionType completionType, String completionNotes) {
        this.deliveryId = deliveryId;
        this.employeeId = employeeId;
        this.completionType = completionType;
        this.completionNotes = completionNotes;
    }
}