package com.suriname.satisfaction.dto;

import com.suriname.satisfaction.entity.Satisfaction;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class SatisfactionDetailDto {

    private Long satisfactionId;
    private Long requestId;
    private String requestNo;
    private String customerName;
    private String customerPhone;
    private Long completionId;
    private String completionType;
    
    // 만족도 점수
    private Integer overallRating;
    private Integer serviceQualityRating;
    private Integer responseTimeRating;
    private Integer deliveryRating;
    private Integer staffKindnessRating;
    
    // 계산된 값
    private Double averageRating;
    private String satisfactionGrade;
    
    // 추가 정보
    private String comments;
    private Boolean recommendToOthers;
    private String surveyMethod;
    private String ipAddress;
    private LocalDateTime submittedAt;
    private LocalDateTime createdAt;

    public SatisfactionDetailDto(Long satisfactionId, Long requestId, String requestNo,
                               String customerName, String customerPhone, Long completionId,
                               String completionType, Integer overallRating,
                               Integer serviceQualityRating, Integer responseTimeRating,
                               Integer deliveryRating, Integer staffKindnessRating,
                               String comments, Boolean recommendToOthers,
                               Satisfaction.SurveyMethod surveyMethod, String ipAddress,
                               LocalDateTime submittedAt, LocalDateTime createdAt) {
        this.satisfactionId = satisfactionId;
        this.requestId = requestId;
        this.requestNo = requestNo;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.completionId = completionId;
        this.completionType = completionType;
        this.overallRating = overallRating;
        this.serviceQualityRating = serviceQualityRating;
        this.responseTimeRating = responseTimeRating;
        this.deliveryRating = deliveryRating;
        this.staffKindnessRating = staffKindnessRating;
        this.comments = comments;
        this.recommendToOthers = recommendToOthers;
        this.surveyMethod = surveyMethod != null ? getSurveyMethodDisplayName(surveyMethod) : null;
        this.ipAddress = ipAddress;
        this.submittedAt = submittedAt;
        this.createdAt = createdAt;

        // 평균 만족도 계산
        if (overallRating != null) {
            this.averageRating = (overallRating + serviceQualityRating + responseTimeRating + 
                                deliveryRating + staffKindnessRating) / 5.0;
            this.satisfactionGrade = getSatisfactionGradeFromAverage(this.averageRating);
        }
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