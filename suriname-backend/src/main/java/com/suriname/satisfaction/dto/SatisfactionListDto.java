package com.suriname.satisfaction.dto;

import com.suriname.satisfaction.entity.Satisfaction;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class SatisfactionListDto {

    private Long satisfactionId;
    private Long requestId;
    private String requestNo;
    private String customerName;
    private Long completionId;
    private Double averageRating;
    private String satisfactionGrade;
    private Boolean recommendToOthers;
    private String surveyMethod;
    private LocalDateTime submittedAt;
    private LocalDateTime createdAt;

    public SatisfactionListDto(Long satisfactionId, Long requestId, String requestNo,
                             String customerName, Long completionId,
                             Integer overallRating, Integer serviceQualityRating,
                             Integer responseTimeRating, Integer deliveryRating,
                             Integer staffKindnessRating, Boolean recommendToOthers,
                             Satisfaction.SurveyMethod surveyMethod,
                             LocalDateTime submittedAt, LocalDateTime createdAt) {
        this.satisfactionId = satisfactionId;
        this.requestId = requestId;
        this.requestNo = requestNo;
        this.customerName = customerName;
        this.completionId = completionId;
        
        // 평균 만족도 계산
        if (overallRating != null) {
            this.averageRating = (overallRating + serviceQualityRating + responseTimeRating + 
                                deliveryRating + staffKindnessRating) / 5.0;
            this.satisfactionGrade = getSatisfactionGradeFromAverage(this.averageRating);
        }
        
        this.recommendToOthers = recommendToOthers;
        this.surveyMethod = surveyMethod != null ? getSurveyMethodDisplayName(surveyMethod) : null;
        this.submittedAt = submittedAt;
        this.createdAt = createdAt;
    }

    private String getSatisfactionGradeFromAverage(double average) {
        if (average >= 4.5) return "매우 만족";
        else if (average >= 3.5) return "만족";
        else if (average >= 2.5) return "보통";
        else if (average >= 1.5) return "불만족";
        else return "매우 불만족";
    }

    private String getSurveyMethodDisplayName(Satisfaction.SurveyMethod method) {
        switch (method) {
            case ONLINE:
                return "온라인";
            case SMS:
                return "SMS";
            case PHONE:
                return "전화";
            case EMAIL:
                return "이메일";
            default:
                return method.name();
        }
    }
}