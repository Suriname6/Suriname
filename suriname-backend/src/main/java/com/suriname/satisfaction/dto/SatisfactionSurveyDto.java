package com.suriname.satisfaction.dto;

import com.suriname.satisfaction.entity.Satisfaction;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SatisfactionSurveyDto {

    @NotNull(message = "완료 ID는 필수입니다.")
    private Long completionId;

    @NotNull(message = "전체 만족도는 필수입니다.")
    @Min(value = 1, message = "만족도는 1점 이상이어야 합니다.")
    @Max(value = 5, message = "만족도는 5점 이하여야 합니다.")
    private Integer overallRating;

    @NotNull(message = "서비스 품질 만족도는 필수입니다.")
    @Min(value = 1, message = "만족도는 1점 이상이어야 합니다.")
    @Max(value = 5, message = "만족도는 5점 이하여야 합니다.")
    private Integer serviceQualityRating;

    @NotNull(message = "응답 시간 만족도는 필수입니다.")
    @Min(value = 1, message = "만족도는 1점 이상이어야 합니다.")
    @Max(value = 5, message = "만족도는 5점 이하여야 합니다.")
    private Integer responseTimeRating;

    @NotNull(message = "배송 만족도는 필수입니다.")
    @Min(value = 1, message = "만족도는 1점 이상이어야 합니다.")
    @Max(value = 5, message = "만족도는 5점 이하여야 합니다.")
    private Integer deliveryRating;

    @NotNull(message = "직원 친절도는 필수입니다.")
    @Min(value = 1, message = "만족도는 1점 이상이어야 합니다.")
    @Max(value = 5, message = "만족도는 5점 이하여야 합니다.")
    private Integer staffKindnessRating;

    private String comments;

    @NotNull(message = "추천 의향은 필수입니다.")
    private Boolean recommendToOthers;

    @NotNull(message = "설문 방법은 필수입니다.")
    private Satisfaction.SurveyMethod surveyMethod;

    private String ipAddress;

    public SatisfactionSurveyDto(Long completionId, Integer overallRating, 
                               Integer serviceQualityRating, Integer responseTimeRating,
                               Integer deliveryRating, Integer staffKindnessRating,
                               String comments, Boolean recommendToOthers,
                               Satisfaction.SurveyMethod surveyMethod, String ipAddress) {
        this.completionId = completionId;
        this.overallRating = overallRating;
        this.serviceQualityRating = serviceQualityRating;
        this.responseTimeRating = responseTimeRating;
        this.deliveryRating = deliveryRating;
        this.staffKindnessRating = staffKindnessRating;
        this.comments = comments;
        this.recommendToOthers = recommendToOthers;
        this.surveyMethod = surveyMethod;
        this.ipAddress = ipAddress;
    }

    /**
     * 평균 만족도 계산
     */
    public double getAverageRating() {
        return (overallRating + serviceQualityRating + responseTimeRating + 
                deliveryRating + staffKindnessRating) / 5.0;
    }
}