package com.suriname.recommendation.service;

import com.suriname.recommendation.dto.RecommendationDto;
import com.suriname.request.repository.RequestRepository;
import com.suriname.satisfaction.repository.SatisfactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RequestRepository requestRepository;
    private final SatisfactionRepository satisfactionRepository;

    public List<RecommendationDto> getRecommendations() {
        LocalDateTime lastMonth = LocalDateTime.now().minusMonths(1);
        List<RecommendationDto> recs = new ArrayList<>();

        //모델별 고장 급증 파악
        requestRepository.countRepairsByModel(lastMonth).forEach(obj -> {
            String modelName = (String) obj[0];
            long count = (Long) obj[1];
            if (count >= 10) {
                recs.add(new RecommendationDto(
                        modelName,
                        modelName + " 수리 건수 급증 → 작업량 증가 대비"
                ));
            }
        });

        //모델별 평균 평점 하락
        satisfactionRepository.avgRatingByModel().forEach(obj -> {
            String modelName = (String) obj[0];
            double avgRating = (Double) obj[1];
            if (avgRating <= 2.0) {
                recs.add(new RecommendationDto(
                        modelName,
                        modelName + " 고객 평가 저조 → 서비스 응대 강화"
                ));
            }
        });

        return recs;
    }
}
