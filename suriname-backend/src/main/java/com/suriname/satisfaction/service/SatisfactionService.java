package com.suriname.satisfaction.service;

import com.suriname.completion.entity.Completion;
import com.suriname.completion.repository.CompletionRepository;
import com.suriname.satisfaction.dto.SatisfactionDetailDto;
import com.suriname.satisfaction.dto.SatisfactionListDto;
import com.suriname.satisfaction.dto.SatisfactionSurveyDto;
import com.suriname.satisfaction.entity.Satisfaction;
import com.suriname.satisfaction.repository.SatisfactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SatisfactionService {

    private final SatisfactionRepository satisfactionRepository;
    private final CompletionRepository completionRepository;

    /**
     * 만족도 조사 제출
     */
    @Transactional
    public Map<String, Long> submitSatisfactionSurvey(SatisfactionSurveyDto dto) {
        // 완료 정보 조회
        Completion completion = completionRepository.findById(dto.getCompletionId())
                .orElseThrow(() -> new RuntimeException("완료 정보를 찾을 수 없습니다."));

        // 이미 만족도 조사가 제출된 경우 체크
        if (satisfactionRepository.findByCompletion(completion).isPresent()) {
            throw new RuntimeException("이미 만족도 조사가 제출되었습니다.");
        }

        // 기존 필드와의 호환성을 위한 rating 값 계산 (평균값)
        byte legacyRating = (byte) Math.round(dto.getAverageRating());

        // 만족도 조사 생성
        Satisfaction satisfaction = Satisfaction.builder()
                .request(completion.getRequest())
                .customer(completion.getRequest().getCustomer())
                .completion(completion)
                .rating(legacyRating)
                .feedback(dto.getComments())
                .overallRating(dto.getOverallRating())
                .serviceQualityRating(dto.getServiceQualityRating())
                .responseTimeRating(dto.getResponseTimeRating())
                .deliveryRating(dto.getDeliveryRating())
                .staffKindnessRating(dto.getStaffKindnessRating())
                .recommendToOthers(dto.getRecommendToOthers())
                .surveyMethod(dto.getSurveyMethod())
                .ipAddress(dto.getIpAddress())
                .build();

        satisfactionRepository.save(satisfaction);

        log.info("만족도 조사 제출 - 접수번호: {}, 평균 점수: {:.1f}", 
            completion.getRequest().getRequestNo(), dto.getAverageRating());

        return Map.of("satisfactionId", satisfaction.getSatisfactionId());
    }

    /**
     * 만족도 목록 조회
     */
    public Page<SatisfactionListDto> getAllSatisfactions(Pageable pageable) {
        Page<Satisfaction> satisfactions = satisfactionRepository.findAllByOrderByCreatedAtDesc(pageable);

        return satisfactions.map(satisfaction -> new SatisfactionListDto(
                satisfaction.getSatisfactionId(),
                satisfaction.getRequest().getRequestId(),
                satisfaction.getRequest().getRequestNo(),
                satisfaction.getRequest().getCustomer().getName(),
                satisfaction.getCompletion() != null ? satisfaction.getCompletion().getCompletionId() : null,
                satisfaction.getOverallRating(),
                satisfaction.getServiceQualityRating(),
                satisfaction.getResponseTimeRating(),
                satisfaction.getDeliveryRating(),
                satisfaction.getStaffKindnessRating(),
                satisfaction.getRecommendToOthers(),
                satisfaction.getSurveyMethod(),
                satisfaction.getSubmittedAt(),
                satisfaction.getCreatedAt()
        ));
    }

    /**
     * 만족도 상세 조회
     */
    public SatisfactionDetailDto getSatisfactionDetail(Long satisfactionId) {
        Satisfaction satisfaction = satisfactionRepository.findById(satisfactionId)
                .orElseThrow(() -> new RuntimeException("만족도 조사 정보를 찾을 수 없습니다."));

        return new SatisfactionDetailDto(
                satisfaction.getSatisfactionId(),
                satisfaction.getRequest().getRequestId(),
                satisfaction.getRequest().getRequestNo(),
                satisfaction.getRequest().getCustomer().getName(),
                satisfaction.getRequest().getCustomer().getPhone(),
                satisfaction.getCompletion() != null ? satisfaction.getCompletion().getCompletionId() : null,
                satisfaction.getCompletion() != null ? satisfaction.getCompletion().getCompletionType().name() : null,
                satisfaction.getOverallRating(),
                satisfaction.getServiceQualityRating(),
                satisfaction.getResponseTimeRating(),
                satisfaction.getDeliveryRating(),
                satisfaction.getStaffKindnessRating(),
                satisfaction.getFeedback(),
                satisfaction.getRecommendToOthers(),
                satisfaction.getSurveyMethod(),
                satisfaction.getIpAddress(),
                satisfaction.getSubmittedAt(),
                satisfaction.getCreatedAt()
        );
    }

    /**
     * 고만족 고객 조회
     */
    public Page<SatisfactionListDto> getHighSatisfactionCustomers(Pageable pageable) {
        Page<Satisfaction> satisfactions = satisfactionRepository.findHighSatisfactionCustomers(pageable);

        return satisfactions.map(satisfaction -> new SatisfactionListDto(
                satisfaction.getSatisfactionId(),
                satisfaction.getRequest().getRequestId(),
                satisfaction.getRequest().getRequestNo(),
                satisfaction.getRequest().getCustomer().getName(),
                satisfaction.getCompletion() != null ? satisfaction.getCompletion().getCompletionId() : null,
                satisfaction.getOverallRating(),
                satisfaction.getServiceQualityRating(),
                satisfaction.getResponseTimeRating(),
                satisfaction.getDeliveryRating(),
                satisfaction.getStaffKindnessRating(),
                satisfaction.getRecommendToOthers(),
                satisfaction.getSurveyMethod(),
                satisfaction.getSubmittedAt(),
                satisfaction.getCreatedAt()
        ));
    }

    /**
     * 저만족 고객 조회
     */
    public Page<SatisfactionListDto> getLowSatisfactionCustomers(Pageable pageable) {
        Page<Satisfaction> satisfactions = satisfactionRepository.findLowSatisfactionCustomers(pageable);

        return satisfactions.map(satisfaction -> new SatisfactionListDto(
                satisfaction.getSatisfactionId(),
                satisfaction.getRequest().getRequestId(),
                satisfaction.getRequest().getRequestNo(),
                satisfaction.getRequest().getCustomer().getName(),
                satisfaction.getCompletion() != null ? satisfaction.getCompletion().getCompletionId() : null,
                satisfaction.getOverallRating(),
                satisfaction.getServiceQualityRating(),
                satisfaction.getResponseTimeRating(),
                satisfaction.getDeliveryRating(),
                satisfaction.getStaffKindnessRating(),
                satisfaction.getRecommendToOthers(),
                satisfaction.getSurveyMethod(),
                satisfaction.getSubmittedAt(),
                satisfaction.getCreatedAt()
        ));
    }

    /**
     * 전체 평균 만족도 조회
     */
    public Map<String, Object> getSatisfactionStatistics() {
        Double averageRating = satisfactionRepository.getAverageRating();
        Object[] distribution = satisfactionRepository.getSatisfactionDistribution();
        
        return Map.of(
            "averageRating", averageRating != null ? averageRating : 0.0,
            "distribution", Map.of(
                "excellent", distribution[0],  // 매우 만족 (4.5~5.0)
                "good", distribution[1],       // 만족 (3.5~4.4)
                "average", distribution[2],    // 보통 (2.5~3.4)
                "poor", distribution[3],       // 불만족 (1.5~2.4)
                "veryPoor", distribution[4]    // 매우 불만족 (1.0~1.4)
            )
        );
    }

    /**
     * 기간별 만족도 통계
     */
    public Map<String, Object> getSatisfactionStatisticsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        Double averageRating = satisfactionRepository.getAverageRatingByDateRange(startDate, endDate);
        Page<Satisfaction> satisfactions = satisfactionRepository.findByDateRange(startDate, endDate, Pageable.unpaged());
        
        return Map.of(
            "averageRating", averageRating != null ? averageRating : 0.0,
            "totalCount", satisfactions.getTotalElements(),
            "period", Map.of(
                "startDate", startDate,
                "endDate", endDate
            )
        );
    }

    /**
     * 접수번호로 만족도 조회 (고객용)
     */
    public SatisfactionDetailDto getSatisfactionByRequestNo(String requestNo) {
        Page<Satisfaction> satisfactions = satisfactionRepository.findByRequestNoContaining(requestNo, Pageable.ofSize(1));
        
        if (satisfactions.isEmpty()) {
            throw new RuntimeException("해당 접수번호의 만족도 조사를 찾을 수 없습니다.");
        }
        
        Satisfaction satisfaction = satisfactions.getContent().get(0);
        return getSatisfactionDetail(satisfaction.getSatisfactionId());
    }

    /**
     * 월별 만족도 통계
     */
    public Object[] getMonthlySatisfactionStats(int months) {
        LocalDateTime startDate = LocalDateTime.now().minusMonths(months);
        return satisfactionRepository.getMonthlySatisfactionStats(startDate).toArray();
    }
}