package com.suriname.satisfaction.entity;

import com.suriname.completion.entity.Completion;
import com.suriname.customer.entity.Customer;
import com.suriname.request.entity.Request;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "satisfaction")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Satisfaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long satisfactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", unique = true, nullable = false)
    private Request request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "completion_id")
    private Completion completion;

    // 기존 필드 (하위 호환성 유지)
    @Column(nullable = false)
    private Byte rating;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    // 확장 필드
    @Column(name = "overall_rating")
    private Integer overallRating; // 전체 만족도 (1-5)

    @Column(name = "service_quality_rating")
    private Integer serviceQualityRating; // 서비스 품질 (1-5)

    @Column(name = "response_time_rating")
    private Integer responseTimeRating; // 응답 시간 (1-5)

    @Column(name = "delivery_rating")
    private Integer deliveryRating; // 배송 만족도 (1-5)

    @Column(name = "staff_kindness_rating")
    private Integer staffKindnessRating; // 직원 친절도 (1-5)

    @Column(name = "recommend_to_others")
    private Boolean recommendToOthers; // 타인 추천 의향

    @Enumerated(EnumType.STRING)
    @Column(name = "survey_method", length = 20)
    private SurveyMethod surveyMethod;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public enum SurveyMethod {
        ONLINE,  // 온라인 설문
        SMS,     // SMS 링크
        PHONE,   // 전화 설문
        EMAIL    // 이메일 설문
    }

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.submittedAt == null) {
            this.submittedAt = LocalDateTime.now();
        }
    }

    @Builder
    public Satisfaction(Request request, Customer customer, Completion completion,
                       Byte rating, String feedback,
                       Integer overallRating, Integer serviceQualityRating,
                       Integer responseTimeRating, Integer deliveryRating,
                       Integer staffKindnessRating, Boolean recommendToOthers,
                       SurveyMethod surveyMethod, String ipAddress) {
        this.request = request;
        this.customer = customer;
        this.completion = completion;
        this.rating = rating;
        this.feedback = feedback;
        this.overallRating = overallRating;
        this.serviceQualityRating = serviceQualityRating;
        this.responseTimeRating = responseTimeRating;
        this.deliveryRating = deliveryRating;
        this.staffKindnessRating = staffKindnessRating;
        this.recommendToOthers = recommendToOthers;
        this.surveyMethod = surveyMethod;
        this.ipAddress = ipAddress;
    }

    /**
     * 평균 만족도 계산 (새로운 필드 기준)
     */
    public double getAverageRating() {
        if (overallRating == null) return rating.doubleValue(); // 기존 방식 호환
        
        return (overallRating + serviceQualityRating + responseTimeRating + 
                deliveryRating + staffKindnessRating) / 5.0;
    }

    /**
     * 만족도 등급 반환
     */
    public String getSatisfactionGrade() {
        double average = getAverageRating();
        if (average >= 4.5) return "매우 만족";
        else if (average >= 3.5) return "만족";
        else if (average >= 2.5) return "보통";
        else if (average >= 1.5) return "불만족";
        else return "매우 불만족";
    }

    /**
     * 고만족 여부 확인 (평균 4점 이상)
     */
    public boolean isHighSatisfaction() {
        return getAverageRating() >= 4.0;
    }

    /**
     * 저만족 여부 확인 (평균 2점 이하)
     */
    public boolean isLowSatisfaction() {
        return getAverageRating() <= 2.0;
    }
}
