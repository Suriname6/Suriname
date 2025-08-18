package com.suriname.recommendation.service;

import com.suriname.recommendation.dto.RecommendationDto;
import com.suriname.request.repository.RequestRepository;
import com.suriname.satisfaction.repository.SatisfactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RequestRepository requestRepository;
    private final SatisfactionRepository satisfactionRepository;

    public List<RecommendationDto> getRecommendations() {
        LocalDateTime lastMonth = LocalDateTime.now().minusMonths(1);

        var repairs = requestRepository.countRepairsByModel(lastMonth);
        var ratings = satisfactionRepository.avgRatingByModel();

        Map<String, Long> repairMap = new HashMap<>();
        //모델명과 수리 건수
        repairs.forEach(obj -> repairMap.put((String) obj[0], (Long) obj[1]));

        Map<String, Double> ratingMap = new HashMap<>();
        //모델명과 만족도
        ratings.forEach(obj -> ratingMap.put((String) obj[0], ((Number) obj[1]).doubleValue()));

        Set<String> models = new HashSet<>();
        models.addAll(repairMap.keySet());
        models.addAll(ratingMap.keySet());

        List<RecommendationDto> recs = new ArrayList<>();
        for (String model : models) {
            long count = repairMap.getOrDefault(model, 0L);
            double avg = ratingMap.getOrDefault(model, 0.0);

            String message = buildMessage(model, count, avg);

            recs.add(new RecommendationDto(model, message, count, avg));
        }

        return recs;
    }

    private String buildMessage(String model, long count, double avg) {
        if (count >= 10 && avg <= 2.0) {
            return model + " : 수리 급증 + 고객 평가 낮음 → 긴급 조치 필요";
        } else if (count >= 10) {
            return model + " : 수리 건수 급증 → 작업량 대비";
        } else if (avg <= 2.0) {
            return model + " : 고객 평가 저조 → 서비스 강화 필요";
        } else {
            return model + " : 최근 현황 안정적";
        }
    }
}
